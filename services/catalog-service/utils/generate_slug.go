package utils

import (
	"catalog-service/databases"
	"fmt"
	"strings"
)

func GenerateProductSlug(name string) string {
	base := strings.ToLower(strings.ReplaceAll(name, " ", "-"))
	id := databases.NewID()
	return fmt.Sprintf("%s-%s", base, id[:6])
}