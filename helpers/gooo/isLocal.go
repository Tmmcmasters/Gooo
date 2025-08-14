package gooo

import (
	"Gooo/constants"
	"context"
	"strings"
)

func IsLocal(ctx context.Context) bool {
	// Get the theme from the context
	if env, ok := ctx.Value(constants.EnvKey).(string); ok {
		return strings.ToLower(env) == "local"
	}

	// Default theme
	return false
}
