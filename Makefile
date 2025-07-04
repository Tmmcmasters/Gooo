.PHONY: build run templ notify-templ-proxy tailwind minify-tailwind

-include .env

build:
	@npm run build
	@templ generate
	@make minify-tailwind

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