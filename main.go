package main

import (
	"Gooo/constants"
	"Gooo/handlers"
	"Gooo/helpers/gooo"
	customMiddleware "Gooo/helpers/middleware"
	"log"
	"net/http"
	"net/http/httptest"
	"net/http/httputil"
	"net/url"
	"os"
	"strings"

	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	envFile := os.Getenv("ENV_FILE")

	if envFile == "" {
		envFile = ".env"
	}

	if err := godotenv.Load(envFile); err != nil {
		log.Printf("WARNING: Couldn't load %s file: %v", envFile, err)
	}

	log.SetFlags(0)
	log.Println("")
	log.Printf("\u2022 Environment: %s%s%s%s", constants.Blue, constants.Bold, os.Getenv("ENV"), constants.Reset)

	e := echo.New()

	appPort := os.Getenv("APP_PORT")
	if appPort == "" {
		log.Fatal("APP_PORT env variable not set correctly")
	}

	e.Use(customMiddleware.ThemeMiddleware)

	e.Use(middleware.GzipWithConfig(middleware.GzipConfig{
		Level: 5,
	}))

	e.GET("/", handlers.HomeHandler)
	e.GET("/todo", handlers.TodoHandler)

	e.Use(func(next echo.HandlerFunc) echo.HandlerFunc {
		return customMiddleware.EnvMiddleware(next, os.Getenv("ENV"))
	})

	// Serve Static Assets for Production
	isLocal := os.Getenv("ENV") == "LOCAL"

	if !isLocal {
		e.Static("/static", "static")
		e.Static("/gen", "gen")
	} else {
		handleViteDevServer(e, isLocal)
	}

	e.Static("/static", "static")
	e.Static("/gen", "gen")

	e.File("/favicon.ico", "static/favicon.ico")

	gooo.HandleServerReload(e, isLocal)

	e.Logger.Fatal(e.Start(":" + appPort))
}

// handleViteDevServer sets up the reverse proxy to Vite for development. It
// forwards requests from /gen/js/* to /client/*.ts to allow Vite to handle
// the typescript files. It also forwards requests for Vite's HMR client and
// other client assets. If a request for a static asset fails, it attempts to
// proxy the request to Vite dev server. If the proxy succeeds, it copies the
// response to the client. If the proxy fails, it falls back to the default
// Echo error handling or custom 404 response.
func handleViteDevServer(e *echo.Echo, isLocal bool) {
	// Establish the Reverse Proxy to Vite
	viteUrl, _ := url.Parse("http://localhost:5173")
	proxy := httputil.NewSingleHostReverseProxy(viteUrl)

	e.Any("/gen/js/*", func(c echo.Context) error {
		path := c.Request().URL.Path

		if strings.HasSuffix(path, ".js") && !strings.Contains(path, "goooNavigation") {
			filename := strings.TrimPrefix(path, "/gen/js/")
			filename = strings.TrimSuffix(filename, ".js")
			c.Request().URL.Path = "/client/" + filename + ".ts"
		} else {
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
