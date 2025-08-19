# --------------------------
# Stage 1: Builder
# --------------------------
FROM golang:alpine AS builder
RUN apk add --no-cache \
    curl \
    make \
    git \
    nodejs \
    npm

RUN go install github.com/a-h/templ/cmd/templ@latest
ENV PATH="/go/bin:${PATH}"

WORKDIR /app

# Install JS deps first (better caching)
COPY package*.json ./
RUN npm install

# Copy everything else (Go + Makefiles + templates)
COPY . .

# Always use production env
ENV ENV_FILE=/app/.env.prod

# Build artifacts + env files
RUN make docker-build \
 && echo "✅ Generated env files:" \
 && ls -l /app/.env*

# --------------------------
# Stage 2: Runtime
# --------------------------
FROM alpine:3.20 AS runtime

WORKDIR /app

# Copy only what we need from builder
COPY --from=builder /app/tmp/main /app/main
COPY --from=builder /app/static /app/static
COPY --from=builder /app/gen /app/gen
COPY --from=builder /app/.env.prod /app/.env.prod

RUN chmod +x /app/main

# Point Go app to the right env file
ENV ENV_FILE=/app/.env.prod

# Expose a port (Railway will override with $PORT)
EXPOSE 8080

CMD ["/app/main"]
