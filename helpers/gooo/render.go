package gooo

import (
	"github.com/a-h/templ"
	"github.com/labstack/echo/v4"
)

// Render renders the given component into the response of the given context.
//
// The caller is responsible for ensuring that the component is valid and
// compatible with the context, and that the context has not already been
// written to.
//
// The context's request context is used to render the component.
//
// Any error returned by the component during rendering is returned as-is.
//
// The status code is used when writing the response.
func Render(ctx echo.Context, statusCode int, component templ.Component) error {
	buf := templ.GetBuffer()

	defer templ.ReleaseBuffer(buf)

	if err := component.Render(ctx.Request().Context(), buf); err != nil {
		return err
	}

	return ctx.HTML(statusCode, buf.String())
}
