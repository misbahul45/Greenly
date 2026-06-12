package utils

import (
	"fmt"
	"strconv"
	"strings"
)

func FormatFloat(f float64) string {
	return strconv.FormatFloat(f, 'f', -1, 64)
}

func FormatMoney(f float64) string {
	s := fmt.Sprintf("%.0f", f)
	if len(s) <= 3 {
		return s
	}
	
	var res []string
	for len(s) > 3 {
		res = append([]string{s[len(s)-3:]}, res...)
		s = s[:len(s)-3]
	}
	if len(s) > 0 {
		res = append([]string{s}, res...)
	}
	return strings.Join(res, ".")
}
