package customMiddleware

import (
	"Gooo/constants"
	"context"

	"github.com/labstack/echo/v4"
)

// themeMiddleware sets the theme for the request based on the cookie value.
// The theme is sanitized to be either "light" or "dark". The theme is stored
// in the echo.Context and the request.Context for use by the application.
func ThemeMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		theme := "light"
		cookie, err := c.Cookie("color-scheme")
		if err == nil && cookie != nil {
			theme = cookie.Value
		}

		// Sanitize/validate theme
		switch theme {
		case "dark":
			// leave as-is
		default:
			theme = "light"
		}

		// Store in echo.Context (for direct access)
		c.Set(string(constants.ThemeKey), theme)

		// Also inject into request.Context for templ
		req := c.Request()
		ctxWithTheme := context.WithValue(req.Context(), constants.ThemeKey, theme)
		c.SetRequest(req.WithContext(ctxWithTheme))

		return next(c)
	}
}
