package main

import (
	"PersonalPortfolio/constants"
	"log"
	"os"
	"regexp"
	"strings"
)

func main() {
	log.SetFlags(0)
	log.Println("")
	log.Println("\u2022" + constants.Blue + constants.Bold + " Build: " + constants.Reset + "Injecting Tailwind CSS into tailwind.templ")

	// Read the Tailwind CSS file
	cssPath := "./static/assets/css/output-tw.css"
	css, err := os.ReadFile(cssPath)
	if err != nil {
		log.Fatalf("Error reading %s: %v", cssPath, err)
	}
	cssContent := strings.TrimSpace(string(css))

	// Read the tailwind.templ file
	templPath := "./server/generated/tailwind.templ"
	templContent, err := os.ReadFile(templPath)
	if err != nil {
		log.Fatalf("Error reading templ file at path: %s, error: %v", templPath, err)
	}

	// Use regex to match content inside <style data-tailwind>...</style>
	re := regexp.MustCompile(`(?s)<style data-tailwind>(.*?)</style>`)
	matches := re.FindStringSubmatch(string(templContent))
	if len(matches) < 2 {
		log.Fatalf("Could not find <style data-tailwind> tag in %s", templPath)
	}
	contentToReplace := matches[0] // Full match: <style data-tailwind>...</style>

	// Replace the entire <style> tag content with new CSS
	newTemplContent := strings.Replace(
		string(templContent),
		contentToReplace,
		"<style data-tailwind>\n\t\t\t"+cssContent+"\n\t\t\t</style>",
		1,
	)

	// Write the updated tailwind.templ file
	err = os.WriteFile(templPath, []byte(newTemplContent), 0644)
	if err != nil {
		log.Fatalf("Error writing %s: %v", templPath, err)
	}

	log.Println("\u2022" + constants.Green + constants.Bold + " Build: " + constants.Reset + "Successfully injected Tailwind CSS into tailwind.templ")
	log.Println("")
}
