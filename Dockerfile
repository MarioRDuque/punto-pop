### Etapa de build ###
FROM node:22-alpine AS build
WORKDIR /build

COPY package.json package-lock.json ./
COPY patches patches
RUN npm ci

COPY . .
RUN npm run build

### Etapa de runtime ###
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /build/dist/punto-pop/browser /usr/share/nginx/html

EXPOSE 80
