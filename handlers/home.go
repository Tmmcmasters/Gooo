package handlers

import (
	serverPages "PersonalPortfolio/components/server/pages"
	"PersonalPortfolio/helpers"

	"github.com/labstack/echo/v4"
)

func HomeHandler(context echo.Context) error  {
	return helpers.Render(context, 200, serverPages.Home())
}