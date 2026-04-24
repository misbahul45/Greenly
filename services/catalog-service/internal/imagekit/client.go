package imagekit

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"time"
)

type Client interface {
	Upload(fileName string, fileData []byte, folder string) (*UploadResponse, error)
	Delete(fileID string) error
}

type UploadResponse struct {
	FileID string `json:"fileId"`
	Name   string `json:"name"`
	URL    string `json:"url"`
}

type client struct {
	privateKey string
	httpClient *http.Client
}

func NewClient() Client {
	return &client{
		privateKey: os.Getenv("IMAGEKIT_PRIVATE_KEY"),
		httpClient: &http.Client{Timeout: 30 * time.Second},
	}
}

func (c *client) authHeader() string {
	encoded := base64.StdEncoding.EncodeToString([]byte(c.privateKey + ":"))
	return "Basic " + encoded
}

func (c *client) Upload(fileName string, fileData []byte, folder string) (*UploadResponse, error) {
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	part, err := writer.CreateFormFile("file", fileName)
	if err != nil {
		return nil, err
	}
	if _, err = part.Write(fileData); err != nil {
		return nil, err
	}

	writer.WriteField("fileName", fileName)
	if folder != "" {
		writer.WriteField("folder", folder)
	}
	writer.Close()

	req, err := http.NewRequest("POST", "https://upload.imagekit.io/api/v1/files/upload", body)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", c.authHeader())
	req.Header.Set("Content-Type", writer.FormDataContentType())

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("imagekit upload failed: status %d, body: %s", resp.StatusCode, string(respBody))
	}

	var result UploadResponse
	if err := json.Unmarshal(respBody, &result); err != nil {
		return nil, err
	}
	return &result, nil
}

func (c *client) Delete(fileID string) error {
	req, err := http.NewRequest("DELETE", fmt.Sprintf("https://api.imagekit.io/v1/files/%s", fileID), nil)
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", c.authHeader())

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusNoContent && resp.StatusCode != http.StatusOK {
		return fmt.Errorf("imagekit delete failed: status %d", resp.StatusCode)
	}
	return nil
}
