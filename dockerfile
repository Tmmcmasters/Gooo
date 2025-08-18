# --------------------------
# Stage 1: Builder
# --------------------------
FROM golang:alpine AS builder

# Install build deps
RUN apk add --no-cache \
    curl \
    make \
    git \
    nodejs \
    npm

# Install templ CLI
RUN go install github.com/a-h/templ/cmd/templ@latest

# Add Go bin to PATH
ENV PATH="/go/bin:${PATH}"

WORKDIR /app

# Copy npm deps first (better caching)
COPY package*.json ./
RUN npm install

# Copy everything else
COPY . .

# Default env file for build
ENV ENV_FILE=.env.prod

# Run your Makefile target (this compiles Go + builds assets)
RUN make run-build

# --------------------------
# Stage 2: Runtime
# --------------------------
FROM alpine:3.20 AS runtime

WORKDIR /app

# Copy final binary & assets from builder
COPY --from=builder /app/tmp/main /app/main
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/static /app/static

# Ensure we can run it
RUN chmod +x /app/main

# Default environment file
ENV ENV_FILE=.env.prod

EXPOSE 8080

CMD ["/app/main"]
