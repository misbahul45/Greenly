package utils

import (
	"crypto/rand"
	"encoding/hex"
)

func NewID() string {
	bytes := make([]byte, 12)
	rand.Read(bytes)
	return hex.EncodeToString(bytes)
}