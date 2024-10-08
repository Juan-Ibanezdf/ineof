package utils

import (
	"math/rand"
	"regexp"
	"strings"
	"time"
	"unicode"
)

// Função para gerar um ID aleatório
func MakeID(length int) string {
	const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

	// Cria um novo gerador de números aleatórios com uma nova fonte
	seed := time.Now().UnixNano()
	rng := rand.New(rand.NewSource(seed))

	b := make([]byte, length)
	for i := range b {
		b[i] = charset[rng.Intn(len(charset))]
	}

	return string(b)
}

// slugify converte uma string em um slug amigável para URLs, removendo acentos e caracteres especiais.
func Slugify(s string) string {
	// Converte a string para minúsculas
	s = strings.ToLower(s)

	// Mapa de caracteres acentuados e especiais para seus equivalentes "normais"
	replacements := map[rune]rune{
		'à': 'a', 'á': 'a', 'ä': 'a', 'â': 'a', 'ã': 'a',
		'è': 'e', 'é': 'e', 'ë': 'e', 'ê': 'e',
		'ì': 'i', 'í': 'i', 'ï': 'i', 'î': 'i',
		'ò': 'o', 'ó': 'o', 'ö': 'o', 'ô': 'o', 'õ': 'o',
		'ù': 'u', 'ú': 'u', 'ü': 'u', 'û': 'u', 'ũ': 'u',
		'ñ': 'n', 'ç': 'c',
		'·': '-', '/': '-', '_': '-', ',': '-', ':': '-', ';': '-',
	}

	// Construtor de string eficiente
	var sb strings.Builder
	for _, r := range s {
		if repl, ok := replacements[r]; ok {
			sb.WriteRune(repl)
		} else if unicode.IsLetter(r) || unicode.IsDigit(r) {
			sb.WriteRune(r)
		} else if unicode.IsSpace(r) {
			sb.WriteRune('-')
		}
	}

	// Atribuir a string do builder para s
	s = sb.String()

	// Substitui múltiplos hifens consecutivos por um único
	re := regexp.MustCompile(`-+`)
	s = re.ReplaceAllString(s, "-")

	// Remove hifens do início e do final da string
	s = strings.Trim(s, "-")

	return s
}

// ConvertArrayToPostgresArray converte um array de strings para o formato de array PostgreSQL
func ConvertArrayToPostgresArray(arr *[]string) *[]string {
	if arr == nil {
		return &[]string{}
	}
	return arr
}
