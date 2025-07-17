package main

import (
	"PersonalPortfolio/constants"
	"PersonalPortfolio/handlers"
	"context"
	"log"
	"net/http"
	"net/http/httptest"
	"net/http/httputil"
	"net/url"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/gorilla/websocket"
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

	e.Use(themeMiddleware)

	e.Use(middleware.GzipWithConfig(middleware.GzipConfig{
		Level: 5,
		// Skipper: func(c echo.Context) bool {
		// 	path := c.Request().URL.Path

		// 	// Skip gzip if path is not a js statically generated vue file
		// 	if strings.HasPrefix(path, "/gen/js") && strings.HasSuffix(path, ".js") {
		// 		return false
		// 	}

		// 	return true
		// },
	}))

	e.GET("/", handlers.HomeHandler)

	e.Use(func(next echo.HandlerFunc) echo.HandlerFunc {
		return envMiddleware(next, os.Getenv("ENV"))
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

	if isLocal {
		e.GET("/ws/reload", reloadWebSocket)
		go func() {
			// time.Sleep(1 * time.Second) // Initial delay to let server stabilize
			log.Println(constants.Green + "[dev] Initiating client reload broadcast..." + constants.Reset)
			broadcastReload()
		}()
	}
	e.Logger.Fatal(e.Start(":" + appPort))
}

var (
	reloadClients   = make(map[*websocket.Conn]bool)
	reloadCLientsMu sync.Mutex
	upgrader        = websocket.Upgrader{}
)

// reloadWebSocket sets up a websocket to listen for reload events and
// automatically reload connected clients when the server restarts.
// It's used by the vite dev server to communicate with the client to reload
// the page when the server restarts.
func reloadWebSocket(c echo.Context) error {
	conn, err := upgrader.Upgrade(c.Response(), c.Request(), nil)
	if err != nil {
		return err
	}

	reloadCLientsMu.Lock()
	reloadClients[conn] = true
	reloadCLientsMu.Unlock()

	go func() {
		defer func() {
			reloadCLientsMu.Lock()
			delete(reloadClients, conn)
			reloadCLientsMu.Unlock()
			conn.Close()
		}()
		for {
			if _, _, err := conn.NextReader(); err != nil {
				break
			}
		}
	}()

	return nil
}

// broadcastReload sends a WebSocket message to all connected clients to reload
// the page, but only after at least one client is connected or a timeout is reached.
func broadcastReload() {
	// Wait for at least one client or timeout after 5 seconds
	timeout := time.After(5 * time.Second)
	ticker := time.NewTicker(500 * time.Millisecond)
	defer ticker.Stop()

	for {
		select {
		case <-timeout:
			log.Println(constants.Yellow + "[dev] No clients connected after timeout, skipping reload broadcast" + constants.Reset)
			return
		case <-ticker.C:
			reloadCLientsMu.Lock()
			if len(reloadClients) > 0 {
				log.Println(constants.Green+"[dev] Broadcasting client reload to", len(reloadClients), "clients..."+constants.Reset)
				for conn := range reloadClients {
					if err := conn.WriteMessage(websocket.TextMessage, []byte("reload")); err != nil {
						conn.Close()
						delete(reloadClients, conn)
					}
				}
				reloadCLientsMu.Unlock()
				return
			}
			reloadCLientsMu.Unlock()
		}
	}
}

// themeMiddleware sets the theme for the request based on the cookie value.
// The theme is sanitized to be either "light" or "dark". The theme is stored
// in the echo.Context and the request.Context for use by the application.
func themeMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
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

		if strings.HasSuffix(path, ".js") {
			filename := strings.TrimPrefix(path, "/gen/js/")
			filename = strings.TrimSuffix(filename, ".js")
			c.Request().URL.Path = "/client/" + filename + ".ts"
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

// envMiddleware injects the environment variable into the echo.Context and
// the request.Context for use by the application. It sets the environment
// in the context using a predefined key and ensures the value is accessible
// throughout the request lifecycle. This middleware is useful for passing
// environment-specific configuration to handlers and other middleware functions.
func envMiddleware(next echo.HandlerFunc, env string) echo.HandlerFunc {
	return func(c echo.Context) error {
		c.Set(string(constants.EnvKey), env)

		req := c.Request()
		ctxWithEnv := context.WithValue(req.Context(), constants.EnvKey, env)
		c.SetRequest(req.WithContext(ctxWithEnv))

		return next(c)

	}
}
