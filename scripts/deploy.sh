#!/bin/bash

# --- HY-AQMS: One-Click Production Deployment ---
# This script handles the initial setup and SSL certification on a Linux VPS.

set -e

# 1. Colors for output
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${GREEN}🚀 Beginning Production Deployment for HY-AQMS...${NC}"

# 2. Check for .env file
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found. Copying .env.example to .env..."
    cp .env.example .env
    echo "⚠️  CRITICAL: Edit the '.env' file with your DOMAIN and SECURE passwords before running again."
    exit 1
fi

# Load variables
export $(grep -v '^#' .env | xargs)

if [ -z "$DOMAIN" ]; then
    echo "❌ Error: DOMAIN is not set in your .env file."
    exit 1
fi

# 3. Pull/Build Production Stack
echo "📦 Pulling and Building the Production Stack..."
docker compose -f docker-compose.prod.yml build

# 4. Starting for Initial SSL Challenge (HTTP-01)
echo "🛡️  Starting Nginx for ACME challenge..."
docker compose -f docker-compose.prod.yml up -d frontend

# 5. Request SSL Certificate (Let's Encrypt)
# Only run if certificate doesn't already exist
if [ ! -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    echo "📜 Generating Let's Encrypt SSL certificates for $DOMAIN..."
    docker run --rm -v "certbot-certs:/etc/letsencrypt" -v "certbot-www:/var/www/certbot" \
        certbot/certbot certonly --webroot -w /var/www/certbot \
        --email $EMAIL --agree-tos --no-eff-email \
        -d $DOMAIN
fi

# 6. Final Launch (All Services)
echo "🌟 Launching full HY-AQMS stack..."

# Inject DOMAIN into Mosquitto config (replaces the placeholder)
sed -i "s/\${DOMAIN}/$DOMAIN/g" ./mosquitto/mosquitto.conf

docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml restart frontend mosquitto

echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo "🌐 Your dashboard is now live at: https://$DOMAIN"
echo "🔐 SSL will auto-renew every 12 hours via the certbot sidecar."
