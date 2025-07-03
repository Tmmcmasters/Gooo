.PHONY: build run templ notify-templ-proxy watch-tailwind

-include .env

build:
	@npm run build
	@templ generate

templ: 
	@templ generate --watch --proxy=http://localhost:$(APP_PORT) --proxyport=$(TEMPL_PROXY_PORT) --open-browser=false --proxybind="0.0.0.0"

notify-templ-proxy:
	@templ generate --notify-proxy --proxyport=$(TEMPL_PROXY_PORT)

watch-tailwind:
	@npx @tailwindcss/cli -i ./main-tw.css -o ./output-tw.css --watch

run:
	@make templ & sleep 1
	@make watch-tailwind & sleep 2
	@air