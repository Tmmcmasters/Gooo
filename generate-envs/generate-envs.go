package main

import (
	"Gooo/constants"
	"log"
	"os"
	"strings"
)

func main() {
	log.SetFlags(0)
	log.Println("")
	log.Println("\u2022" + constants.Blue + constants.Bold + " Build: " + constants.Reset + "Generating .env files")

	var envFilePaths = []string{
		"../.env.prod.j2",
		"../.env.dev.j2",
	}

	for _, filePath := range envFilePaths {
		// Read the template file
		templateContent, err := os.ReadFile(filePath)
		if err != nil {
			log.Fatalf("Error reading template file at path: %s, error: %v", filePath, err)
		}

		// Generate the .env file
		err = generateEnvFile(templateContent, filePath)
		if err != nil {
			log.Fatalf("Error generating .env file at path: %s, error: %v", filePath, err)
		}
	}
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
	// You could go get the data from a secure source and populate the template here.

	return nil, nil
}
