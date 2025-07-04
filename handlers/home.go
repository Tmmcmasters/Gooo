package handlers

import (
	serverPages "PersonalPortfolio/components/server/pages"
	"PersonalPortfolio/helpers"
	"log"
	"os"

	"github.com/labstack/echo/v4"
)

func HomeHandler(context echo.Context) error  {
	cssBytes, err := os.ReadFile("static/assets/css/output-tw.css");
	if err != nil {
		log.Printf("Failed to read output-tw.css: %v", err)
		return helpers.Render(context, 500, serverPages.Home(""));
	}

	cssContent := string(cssBytes);

	return helpers.Render(context, 200, serverPages.Home(cssContent))
}