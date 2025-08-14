package gooo

import (
	"log"
	"net/http"
	"net/http/httptest"
	"net/http/httputil"
	"net/url"
	"strings"

	"github.com/labstack/echo/v4"
)

// handleViteDevServer sets up the reverse proxy to Vite for development. It
// forwards requests from /gen/js/* to /client/*.ts to allow Vite to handle
// the typescript files. It also forwards requests for Vite's HMR client and
// other client assets. If a request for a static asset fails, it attempts to
// proxy the request to Vite dev server. If the proxy succeeds, it copies the
// response to the client. If the proxy fails, it falls back to the default
// Echo error handling or custom 404 response.
func HandleViteDevServer(e *echo.Echo, isLocal bool) {
	// Establish the Reverse Proxy to Vite
	viteUrl, _ := url.Parse("http://localhost:5173")
	proxy := httputil.NewSingleHostReverseProxy(viteUrl)

	e.Any("/gen/js/*", func(c echo.Context) error {
		path := c.Request().URL.Path

		// If the path is a JS file and not a goooNavigation file, convert
		// it to a TS file path.
		if strings.HasSuffix(path, ".js") && !strings.Contains(path, "goooNavigation") {
			filename := strings.TrimPrefix(path, "/gen/js/")
			filename = strings.TrimSuffix(filename, ".js")
			c.Request().URL.Path = "/client/" + filename + ".ts"
		} else {
			// Otherwise, assume it's a utils file and convert it to a TS
			// file path.
			filename := strings.TrimPrefix(path, "/gen/js/")
			filename = strings.TrimSuffix(filename, ".js")
			c.Request().URL.Path = "/client/utils/" + filename + ".ts"
		}

		proxy.ServeHTTP(c.Response().Writer, c.Request())
		return nil
	})

	// Proxy Vite's HMR client
	e.Any("/@vite/*", func(c echo.Context) error {
		proxy.ServeHTTP(c.Response().Writer, c.Request())
		return nil
	})

	e.Any("/node_modules/.vite/*", func(c echo.Context) error {
		proxy.ServeHTTP(c.Response().Writer, c.Request())
		return nil
	})

	// Proxy other client assets (e.g., /client/*.ts)
	e.Any("/client/*", func(c echo.Context) error {
		proxy.ServeHTTP(c.Response().Writer, c.Request())
		return nil
	})

	// Handle 404s that might be attempting to go to vue
	e.HTTPErrorHandler = func(err error, c echo.Context) {
		if he, ok := err.(*echo.HTTPError); ok && he.Code == http.StatusNotFound && isLocal {
			// Try proxying to Vite dev server
			req := c.Request()
			originalPath := req.URL.Path
			// log.Printf("404 for %s, attempting to proxy to Vite", originalPath)

			// Create a new response writer to capture proxy response
			proxyResp := httptest.NewRecorder()
			proxy.ServeHTTP(proxyResp, req)

			// Check if proxy succeeded (status < 400)
			if proxyResp.Code < 400 {
				// Copy proxy response to client
				for k, v := range proxyResp.Header() {
					c.Response().Header()[k] = v
				}
				c.Response().WriteHeader(proxyResp.Code)
				_, writeErr := c.Response().Write(proxyResp.Body.Bytes())
				if writeErr != nil {
					log.Printf("Error writing proxy response: %v", writeErr)
				}
				return
			}
			log.Printf("Vite proxy failed for %s, status: %d", originalPath, proxyResp.Code)
		}

		// Fallback to default Echo error handling or custom 404 response
		if c.Response().Committed {
			return
		}
		if he, ok := err.(*echo.HTTPError); ok {
			c.String(he.Code, "404 Not Found: "+c.Request().URL.Path)
		} else {
			c.String(http.StatusInternalServerError, "Internal Server Error")
		}
	}
}
