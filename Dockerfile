# ── Build stage ───────────────────────────────────────────────
# Vite lee las variables VITE_* del archivo .env presente en el
# contexto de build (se crea en el servidor antes de construir).
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ── Runtime stage (Nginx sirve el build estático) ─────────────
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
