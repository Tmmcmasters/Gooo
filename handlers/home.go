package handlers

import (
	"Gooo/helpers"
	serverPages "Gooo/server/pages"

	"github.com/labstack/echo/v4"
)

func HomeHandler(context echo.Context) error {
	return helpers.Render(context, 200, serverPages.Home())
}
