FROM node:18 AS build-step
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Setup the NGINX server
FROM nginx:alpine
COPY --from=build-step /app/dist/weather-frontend /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

