package customMiddleware

import (
	"Gooo/constants"
	"context"

	"github.com/labstack/echo/v4"
)

// envMiddleware injects the environment variable into the echo.Context and
// the request.Context for use by the application. It sets the environment
// in the context using a predefined key and ensures the value is accessible
// throughout the request lifecycle. This middleware is useful for passing
// environment-specific configuration to handlers and other middleware functions.
func EnvMiddleware(next echo.HandlerFunc, env string) echo.HandlerFunc {
	return func(c echo.Context) error {
		c.Set(string(constants.EnvKey), env)

		req := c.Request()
		ctxWithEnv := context.WithValue(req.Context(), constants.EnvKey, env)
		c.SetRequest(req.WithContext(ctxWithEnv))

		return next(c)

	}
}
