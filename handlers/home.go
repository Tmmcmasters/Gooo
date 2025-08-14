package handlers

import (
	"Gooo/helpers/gooo"
	serverPages "Gooo/server/pages"

	"github.com/labstack/echo/v4"
)

func HomeHandler(context echo.Context) error {
	return gooo.Render(context, 200, serverPages.Home())
}
