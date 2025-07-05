package main

import (
	"PersonalPortfolio/handlers"
	"log"
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

	// Serve Static Assets for Production
	e.GET("/", handlers.HomeHandler)
	e.Static("/static", "static")
	e.Static("/gen", "gen")

	e.Logger.Fatal(e.Start(":" + appPort));
}


