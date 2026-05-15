# ── Stage 1: build the Expo web SPA ─────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

# Copy source and build args (injected at build time via --build-arg)
COPY . .

ARG API_BASE_URL=http://localhost:3000
ARG AI_SERVICE_URL=http://localhost:8000
ARG CLERK_PUBLISHABLE_KEY=pk_test_bm90ZWQtbWFzdG9kb24tMjcuY2xlcmsuYWNjb3VudHMuZGV2JA

# Write .env so app.config.js can read it at build time
RUN printf "API_BASE_URL=%s\nAI_SERVICE_URL=%s\nCLERK_PUBLISHABLE_KEY=%s\n" \
    "$API_BASE_URL" "$AI_SERVICE_URL" "$CLERK_PUBLISHABLE_KEY" > .env

# Export static web bundle (outputs to dist/)
RUN npx expo export --platform web

# ── Stage 2: serve with nginx ────────────────────────────────────────────────
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

# SPA routing: redirect all 404s back to index.html
RUN printf 'server {\n\
    listen 8081;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 8081
CMD ["nginx", "-g", "daemon off;"]
