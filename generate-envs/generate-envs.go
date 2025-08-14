package main

import (
	"Gooo/constants"
	"log"
	"os"
	"regexp"
	"strings"
)

func main() {
	log.SetFlags(0)
	log.Println("")
	log.Println("\u2022" + constants.Blue + constants.Bold + " Build: " + constants.Reset + "Generating .env files")
	log.Println("")

	var envFilePaths = []string{
		"./.env.prod.j2",
		"./.env.dev.j2",
	}

	for _, oldFilePath := range envFilePaths {
		// Read the template file
		templateContent, err := os.ReadFile(oldFilePath)
		if err != nil {
			log.Fatalf("Error reading template file at path: %s, error: %v", oldFilePath, err)
		}

		// Generate the .env file
		err = generateEnvFile(templateContent, oldFilePath)
		if err != nil {
			log.Fatalf("Error generating .env file at path: %s, error: %v", oldFilePath, err)
		}

		generatedEnvFilePath := strings.TrimSuffix(oldFilePath, ".j2")
		generatedEnvFilePath = strings.TrimPrefix(generatedEnvFilePath, "./")

		log.Printf("\u2022 Generated %s file from template: %s", generatedEnvFilePath, oldFilePath)
	}

	log.Println("")
	log.Println("\u2022" + constants.Green + constants.Bold + " Build: " + constants.Reset + "Finished generating .env files")
}

func generateEnvFile(templateContent []byte, filePath string) error {
	// Render the template
	renderedContent, err := renderTemplate(templateContent)
	if err != nil {
		return err
	}

	// Write the rendered content to the .env file
	return os.WriteFile(strings.TrimSuffix(filePath, ".j2"), renderedContent, 0644)
}

func renderTemplate(templateContent []byte) ([]byte, error) {
	// Convert template content to string
	content := string(templateContent)

	// Find all placeholders in the template (e.g., {{ example_api_url }})
	re := regexp.MustCompile(`\{\{\s*([a-zA-Z0-9_]+)\s*\}\}`)
	matches := re.FindAllStringSubmatch(content, -1)

	// Replace each placeholder with its value
	for _, match := range matches {
		if len(match) < 2 {
			continue
		}
		placeholder := match[0] // e.g., {{ example_api_url }}
		key := match[1]         // e.g., example_api_url
		value := getValueForKey(key)
		content = strings.ReplaceAll(content, placeholder, value)
	}

	return []byte(content), nil
}

func getValueForKey(key string) string {
	// Manually assign value for example_api_url
	// In the future, this could fetch from a secure source(vault or other).
	if key == "example_api_url" {
		return "http://localhost:8080/api"
	}
	// Return empty string for unknown keys (or could error out)
	return ""
}
