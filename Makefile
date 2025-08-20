.PHONY: build run templ notify-templ-proxy tailwind minify-tailwind build-inject-tw build-echo run-build run-vite gen-envs build-gen-envs build-gen-manifest gen-manifest docker-build docker-run
# Declares "phony" targets (not real files) so make always runs them.

# To be used for development only and with the templ proxy
-include .env.dev
# Include environment variables from `.env.dev` if the file exists.

# Fail immediately on any command error
SHELL := /bin/sh -e

# Suppress the "Entering/Leaving directory" messages
MAKEFLAGS += --no-print-directory	

# Build the Go binary into ./tmp/main
build-echo: 
	@go build -o ./tmp/main .

# Build the generate-envs helper tool
build-gen-envs:
	@go build -o generate-envs/generate-envs generate-envs/generate-envs.go

# Run the generate-envs tool (outputs env files)
gen-envs:
	@./generate-envs/generate-envs

# Build the generate-manifest helper tool
build-gen-manifest:
	@go build -o generate-manifest/generate-manifest generate-manifest/generate-manifest.go

# Run the generate-manifest tool (outputs manifest file)
gen-manifest:
	@generate-manifest/generate-manifest

# Full build pipeline (development + production artifacts)
build:
	$(MAKE) build-inject-tw      # Build the Tailwind injector tool
	$(MAKE) build-gen-manifest   # Build the manifest generator
	$(MAKE) build-gen-envs       # Build the envs generator
	$(MAKE) gen-envs             # Generate env files
	$(MAKE) minify-tailwind      # Compile + minify Tailwind CSS
	$(MAKE) inject-tw            # Inject Tailwind output into templates
	@npm run build               # Run frontend build with Vite
	$(MAKE) gen-manifest         # Generate manifest file
	@templ generate              # Run templ code generation
	$(MAKE) build-echo           # Build main Go binary

# Build all artifacts (same as `build`)
docker-build:
	$(MAKE) build

# Build Docker image and run container on port 8080
docker-run:
	@docker build -t myapp .
	@docker run --rm -it -p 8080:8080 \
  myapp

# Run a production build and start the compiled Go binary
run-build:
	@make build
	@ENV_FILE=.env.prod tmp/main

# Build the Tailwind injector helper tool
build-inject-tw: 
	@go build -o inject-tailwind/inject-tailwind inject-tailwind/inject-tailwind.go

# Run the Tailwind injector (injects Tailwind CSS into templates)
inject-tw: 
	@inject-tailwind/inject-tailwind

# Run templ in watch mode, proxying backend requests
templ: 
	@templ generate --watch --proxy=http://localhost:$(APP_PORT) --proxyport=$(TEMPL_PROXY_PORT) --open-browser=false --proxybind="0.0.0.0"

# Notify the templ proxy that templates have changed (hot reload trigger)
notify-templ-proxy:
	@templ generate --notify-proxy --proxyport=$(TEMPL_PROXY_PORT)

# You could watch tailwindcss like this. Did not find a good implementation of getting this to work with everything else yet. 
# watch-tailwind:
# 	@npx @tailwindcss/cli -i ./tailwind.css -o ./static/assets/css/output-tw.css --watch[=always]	

# Compile Tailwind CSS (unminified)
tailwind: 
	@npx @tailwindcss/cli -i ./tailwind.css -o ./static/assets/css/output-tw.css

# Compile and minify Tailwind CSS
minify-tailwind: 
	@npx @tailwindcss/cli -i ./tailwind.css -o ./static/assets/css/output-tw.css --minify

# Run Vite development server
run-vite: 
	@npm run dev

# Run full dev environment:
# - templ in watch mode
# - build helper tools
# - vite frontend dev server
# - backend hot reload via air
run:
	@make templ & sleep 1
	@$(MAKE) build-inject-tw
	@$(MAKE) build-gen-manifest
	@$(MAKE) run-vite & sleep 1
	@ENV_FILE=.env.dev air
