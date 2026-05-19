# Stage 1: Build React Dashboard
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx + SSL Logic
FROM nginx:alpine
RUN apk add --no-cache openssl

# Copy the built React app to Nginx default public directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy our custom Nginx config for SSL/API/WS (as a template for environment variables)
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Copy entrypoint script for automatic SSL generation
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 80
EXPOSE 443

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
