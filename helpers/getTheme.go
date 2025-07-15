package helpers

import (
	"PersonalPortfolio/constants"
	"context"
)

func GetTheme(ctx context.Context) string {
	// Get the theme from the context
	if theme, ok := ctx.Value(constants.ThemeKey).(string); ok {
		return theme
	}

	// Default theme
	return "light"
}