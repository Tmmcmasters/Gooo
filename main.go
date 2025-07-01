package main

import (
	"PersonalPortfolio/handlers"
	"log"
	"os"

	_ "github.com/joho/godotenv/autoload"
	"github.com/labstack/echo/v4"
)

func main()  {
	e := echo.New();

	appPort := os.Getenv("APP_PORT");
	if appPort == "" {
		log.Fatal("APP_PORT env variable not set correctly");
	}

	e.GET("/", handlers.HomeHandler)
	e.Static("/assets", "static/assets")

	e.Logger.Fatal(e.Start(":" + appPort));
}


