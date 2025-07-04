.PHONY: build run templ notify-templ-proxy tailwind minify-tailwind build-inject-tw build-echo run-build

-include .env

build-echo: 
	@go build -o ./tmp/main .

build:
	@make build-inject-tw
	@make minify-tailwind
	@make inject-tw
	@npm run build
	@templ generate
	@make build-echo

run-build:
	@make build
	@tmp/main

build-inject-tw: 
	@go build -o inject-tailwind/inject-tailwind inject-tailwind/inject-tailwind.go

inject-tw: 
	@inject-tailwind/inject-tailwind

templ: 
	@templ generate --watch --proxy=http://localhost:$(APP_PORT) --proxyport=$(TEMPL_PROXY_PORT) --open-browser=false --proxybind="0.0.0.0"

notify-templ-proxy:
	@templ generate --notify-proxy --proxyport=$(TEMPL_PROXY_PORT)

# watch-tailwind:
# 	@npx @tailwindcss/cli -i ./main-tw.css -o ./static/assets/css/output-tw.css --watch[=always]

tailwind: 
	@npx @tailwindcss/cli -i ./main-tw.css -o ./static/assets/css/output-tw.css

minify-tailwind: 
	@npx @tailwindcss/cli -i ./main-tw.css -o ./static/assets/css/output-tw.css --minify

run:
	@make templ & sleep 1
	@air