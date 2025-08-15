.PHONY: build run templ notify-templ-proxy tailwind minify-tailwind build-inject-tw build-echo run-build run-vite gen-envs build-gen-envs build-gen-manifest gen-manifest

#To be used for development only and with the templ proxy
-include .env.dev

# Suppress the "Entering/Leaving directory" messages
MAKEFLAGS += --no-print-directory	

build-echo: 
	@go build -o ./tmp/main .

build-gen-envs:
	@go build -o generate-envs/generate-envs generate-envs/generate-envs.go

gen-envs:
	@generate-envs/generate-envs

build-gen-manifest:
	@go build -o generate-manifest/generate-manifest generate-manifest/generate-manifest.go

gen-manifest:
	@generate-manifest/generate-manifest

build:
	@make build-inject-tw
	@make build-gen-manifest
	@make minify-tailwind
	@make inject-tw
	@npm run build
	@make gen-manifest
	@templ generate
	@make build-echo

run-build:
	@make build
	@ENV_FILE=.env.prod tmp/main

build-inject-tw: 
	@go build -o inject-tailwind/inject-tailwind inject-tailwind/inject-tailwind.go

inject-tw: 
	@inject-tailwind/inject-tailwind

templ: 
	@templ generate --watch --proxy=http://localhost:$(APP_PORT) --proxyport=$(TEMPL_PROXY_PORT) --open-browser=false --proxybind="0.0.0.0"

notify-templ-proxy:
	@templ generate --notify-proxy --proxyport=$(TEMPL_PROXY_PORT)

# watch-tailwind:
# 	@npx @tailwindcss/cli -i ./tailwind.css -o ./static/assets/css/output-tw.css --watch[=always]

tailwind: 
	@npx @tailwindcss/cli -i ./tailwind.css -o ./static/assets/css/output-tw.css

minify-tailwind: 
	@npx @tailwindcss/cli -i ./tailwind.css -o ./static/assets/css/output-tw.css --minify

run-vite: 
	@npm run dev

run:
	@make templ & sleep 1
	@$(MAKE) build-inject-tw
	@$(MAKE) build-gen-manifest
	@$(MAKE) run-vite & sleep 1
	@ENV_FILE=.env.dev air