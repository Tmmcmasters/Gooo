package main

import (
	"PersonalPortfolio/handlers"
	"log"
	"net/http/httputil"
	"net/url"
	"os"
	"strings"

	_ "github.com/joho/godotenv/autoload"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main()  {
	e := echo.New();

	appPort := os.Getenv("APP_PORT");
	if appPort == "" {
		log.Fatal("APP_PORT env variable not set correctly");
	}

	e.Use(middleware.GzipWithConfig(middleware.GzipConfig{
		Level: 6,
		Skipper: func(c echo.Context) bool {
			path := c.Request().URL.Path	

			// Skip gzip if path is not a js statically generated vue file
			if strings.HasPrefix(path, "/gen/js") && strings.HasSuffix(path, ".js") {
				return false
			}

			return true
		},
	}))

	e.GET("/", handlers.HomeHandler)


	// Serve Static Assets for Production
	isLocal := os.Getenv("ENV");
	if isLocal != "LOCAL" {
		e.Static("/static", "static")
		e.Static("/gen", "gen")
	} else {
		viteUrl, _ := url.Parse("http://localhost:5173")
		proxy := httputil.NewSingleHostReverseProxy(viteUrl);

		e.Any("/gen/js/*", func(c echo.Context) error {
			path := c.Request().URL.Path;

			if strings.HasSuffix(path, ".js") {
				filename := strings.TrimPrefix(path, "/gen/js/");
				filename = strings.TrimSuffix(filename, ".js");
				c.Request().URL.Path = "/client/" + filename + ".ts";	
			}

			proxy.ServeHTTP(c.Response().Writer, c.Request())
			return nil;
		})

		 // Proxy Vite's HMR client
        e.Any("/@vite/*", func(c echo.Context) error {
            proxy.ServeHTTP(c.Response().Writer, c.Request())
            return nil
        })

        // Proxy other client assets (e.g., /client/*.ts)
        e.Any("/client/*", func(c echo.Context) error {
            proxy.ServeHTTP(c.Response().Writer, c.Request())
            return nil
        })

	}	


	e.Static("/static", "static")
	e.Static("/gen", "gen")

	e.Logger.Fatal(e.Start(":" + appPort));
}


