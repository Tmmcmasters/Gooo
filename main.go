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

	// Serve Static Assets for Production
	e.GET("/", handlers.HomeHandler)
	e.Static("/assets", "static/assets")

	// // Proxy dynamic client-side requests to Vite dev server
	// viteProxy := &httputil.ReverseProxy{
	// 	Director: func(r *http.Request) {
	// 		r.URL.Scheme = "http"
	// 		r.URL.Host = "localhost:5173"
	// 		r.Host = "localhost:5173"
	// 	},
	// };

	// e.Any("/*", echo.WrapHandler(viteProxy));

	e.Logger.Fatal(e.Start(":" + appPort));
}


