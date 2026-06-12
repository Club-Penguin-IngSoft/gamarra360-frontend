# --- ETAPA 1: Construcción (Build) ---
# Usamos una imagen de Node para compilar la aplicación React
FROM node:18-alpine AS build
WORKDIR /app

# Copiamos archivos de dependencias para aprovechar la caché de capas de Docker
COPY package*.json ./
RUN npm install

# Copiamos el resto del código y compilamos
COPY . .
RUN npm run build

# --- ETAPA 2: Producción (Servidor Web) ---
# Usamos Nginx ligero para servir los archivos estáticos
FROM nginx:stable-alpine

# Copiamos los archivos estáticos generados en la etapa de build
COPY --from=build /app/dist /usr/share/nginx/html

# Copiamos la configuración personalizada de Nginx para manejar el routing de la SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
