# ============================================================
# Gamarra 360° — Frontend Dockerfile
# React + Vite — Multi-stage build con nginx
# ============================================================

# Etapa 1: Build con Node
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Vite usa .env.production automaticamente con npm run build
COPY . .
RUN npm run build

# Etapa 2: Servir con nginx
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

RUN rm -rf ./*

COPY --from=build /app/dist .
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
