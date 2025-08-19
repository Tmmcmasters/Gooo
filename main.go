package main

import (
	"Gooo/constants"
	"Gooo/handlers"
	"Gooo/helpers/gooo"
	customMiddleware "Gooo/helpers/middleware"
	"log"
	"os"

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
		// Fallback for some deployment services create their own ports
		appPort = os.Getenv("PORT")
	}

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
	isLocal := os.Getenv("ENV") == "DEV"

	if !isLocal {
		e.Static("/static", "static")
		e.Static("/gen", "gen")
	} else {
		gooo.HandleViteDevServer(e, isLocal)
	}

	e.Static("/static", "static")
	e.Static("/gen", "gen")

	e.File("/favicon.ico", "static/favicon.ico")

	gooo.HandleServerReload(e, isLocal)

	e.Logger.Fatal(e.Start(":" + appPort))
}
