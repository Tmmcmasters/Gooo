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

COPY package*.json ./
RUN npm install

COPY . .

# Always use production env
ENV ENV_FILE=.env.prod

# Build artifacts (but don't run them!)
RUN make docker-build

# --------------------------
# Stage 2: Runtime
# --------------------------
FROM alpine:3.20 AS runtime

WORKDIR /app

# Copy only needed artifacts from tmp/
COPY --from=builder /app/tmp/main /app/main
COPY --from=builder /app/static /app/static
COPY --from=builder /app/gen /app/gen
# Add .env.prod to runtime stage
COPY --from=builder /app/.env.prod /app/.env.prod

RUN chmod +x /app/main

ENV ENV_FILE=.env.prod
EXPOSE 8080

CMD ["/app/main"]