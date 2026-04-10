#!/bin/bash
# ============================================================
# deploy-full.sh - Complete Deployment with Nginx Update
# ============================================================
# Usage: ./deploy-full.sh [--nginx-only] [--app-only] [--backup]
#   --nginx-only  : Update only Nginx configuration
#   --app-only    : Deploy only application (skip nginx)
#   --backup      : Backup database before deployment
# ============================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
COMPOSE_FILE="docker-compose.prod.yml"
BACKEND_CONTAINER="informatics-go-green-backend-prod"
DB_CONTAINER="informatics-go-green-db-prod"
NGINX_CONF="./deployment/buu/nginx-buu.conf"
NGINX_SITE="/etc/nginx/sites-available/if-go-green"

# Parse arguments
NGINX_ONLY=false
APP_ONLY=false
RUN_BACKUP=false

for arg in "$@"; do
  case $arg in
    --nginx-only) NGINX_ONLY=true ;;
    --app-only)   APP_ONLY=true ;;
    --backup)     RUN_BACKUP=true ;;
    *)            echo -e "${RED}❌ Unknown argument: $arg${NC}"; exit 1 ;;
  esac
done

echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     🚀 Informatics Go Green - Full Deployment           ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# ============================================================
# FUNCTION: Deploy Application
# ============================================================
deploy_app() {
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${CYAN}  📦 PHASE 1: Application Deployment${NC}"
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""

  # 1. Check .env
  echo -e "${YELLOW}📋 Checking environment...${NC}"
  if [ ! -f ".env" ]; then
    echo -e "${RED}❌ .env file not found! Run: cp .env.example .env${NC}"
    exit 1
  fi
  echo -e "${GREEN}✅ Environment configured${NC}"
  echo ""

  # 2. Git pull
  echo -e "${YELLOW}📥 Pulling latest code...${NC}"
  git pull origin "$(git rev-parse --abbrev-ref HEAD)" 2>/dev/null || {
    echo -e "${YELLOW}⚠️  Git pull failed (maybe local changes). Continuing...${NC}"
  }
  echo -e "${GREEN}✅ Code updated${NC}"
  echo ""

  # 3. Backup (optional)
  if [ "$RUN_BACKUP" = true ]; then
    echo -e "${YELLOW}💾 Backing up database...${NC}"
    ./backup.sh || echo -e "${YELLOW}⚠️  Backup skipped or failed${NC}"
    echo ""
  fi

  # 4. Build & Deploy
  echo -e "${YELLOW}🔨 Building Docker images...${NC}"
  docker compose -f "$COMPOSE_FILE" build --no-cache
  echo -e "${GREEN}✅ Images built${NC}"
  echo ""

  echo -e "${YELLOW}🛑 Stopping old containers...${NC}"
  docker compose -f "$COMPOSE_FILE" down 2>/dev/null || true
  echo -e "${GREEN}✅ Old containers stopped${NC}"
  echo ""

  echo -e "${YELLOW}🚀 Starting new containers...${NC}"
  docker compose -f "$COMPOSE_FILE" up -d
  echo -e "${GREEN}✅ Containers started${NC}"
  echo ""

  # 5. Health check
  echo -e "${YELLOW}⏳ Waiting for backend health check...${NC}"
  MAX_RETRIES=30
  RETRY_COUNT=0
  until docker exec "$BACKEND_CONTAINER" wget -q --spider http://localhost:3001/api/health 2>/dev/null; do
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ "$RETRY_COUNT" -ge "$MAX_RETRIES" ]; then
      echo -e "${RED}❌ Backend failed to start!${NC}"
      echo -e "${RED}   Logs: docker logs $BACKEND_CONTAINER${NC}"
      exit 1
    fi
    echo -e "  Check $RETRY_COUNT/$MAX_RETRIES..."
    sleep 3
  done
  echo -e "${GREEN}✅ Backend is healthy!${NC}"
  echo ""
}

# ============================================================
# FUNCTION: Deploy Nginx
# ============================================================
deploy_nginx() {
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${CYAN}  🌐 PHASE 2: Nginx Configuration${NC}"
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""

  # Check if running as root or with sudo
  if [ "$EUID" -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Nginx update requires root privileges${NC}"
    echo -e "${YELLOW}   Will attempt with sudo...${NC}"
    SUDO="sudo"
  else
    SUDO=""
  fi

  # Check if nginx config exists
  if [ ! -f "$NGINX_CONF" ]; then
    echo -e "${RED}❌ Nginx config not found at: $NGINX_CONF${NC}"
    exit 1
  fi

  # Show changes
  echo -e "${YELLOW}📄 Checking current Nginx config...${NC}"
  if [ -f "$NGINX_SITE" ]; then
    echo -e "${BLUE}   Current: $NGINX_SITE${NC}"
    echo -e "${BLUE}   New:     $NGINX_CONF${NC}"
    
    # Show diff of client_max_body_size
    echo ""
    echo -e "${YELLOW}📊 Upload limit comparison:${NC}"
    CURRENT_LIMIT=$(grep -o "client_max_body_size [0-9]*M" "$NGINX_SITE" | head -1 || echo "Not found")
    NEW_LIMIT=$(grep -o "client_max_body_size [0-9]*M" "$NGINX_CONF" | head -1 || echo "Not found")
    echo -e "   Current: ${CYAN}$CURRENT_LIMIT${NC}"
    echo -e "   New:     ${GREEN}$NEW_LIMIT${NC}"
  fi

  echo ""
  echo -e "${YELLOW}📝 Deploying Nginx config...${NC}"
  
  # Copy config
  $SUDO cp "$NGINX_CONF" "$NGINX_SITE" || {
    echo -e "${RED}❌ Failed to copy Nginx config${NC}"
    echo -e "${RED}   Make sure you have sudo access${NC}"
    exit 1
  }

  # Test config
  echo -e "${YELLOW}🔍 Testing Nginx configuration...${NC}"
  $SUDO nginx -t || {
    echo -e "${RED}❌ Nginx config test failed!${NC}"
    echo -e "${RED}   Restoring backup...${NC}"
    $SUDO cp "$NGINX_SITE.bak" "$NGINX_SITE" 2>/dev/null || true
    exit 1
  }

  # Reload nginx
  echo -e "${YELLOW}🔄 Reloading Nginx...${NC}"
  $SUDO systemctl reload nginx || $SUDO service nginx reload || {
    echo -e "${RED}❌ Failed to reload Nginx${NC}"
    exit 1
  }

  echo -e "${GREEN}✅ Nginx updated successfully!${NC}"
  echo ""
}

# ============================================================
# MAIN EXECUTION
# ============================================================

# Run based on flags
if [ "$NGINX_ONLY" = true ]; then
  deploy_nginx
elif [ "$APP_ONLY" = true ]; then
  deploy_app
else
  # Full deployment
  deploy_app
  deploy_nginx
fi

# ============================================================
# SUMMARY
# ============================================================
echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║              ✅ Deployment Complete!                     ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

if [ "$NGINX_ONLY" != true ]; then
  echo -e "${CYAN}📦 Application Status:${NC}"
  docker compose -f "$COMPOSE_FILE" ps
  echo ""
fi

echo -e "${CYAN}🌐 Services:${NC}"
echo -e "   Frontend: http://localhost:9060"
echo -e "   Backend:  http://localhost:9061/api"
echo ""

echo -e "${CYAN}📋 Useful Commands:${NC}"
echo -e "   ${YELLOW}View logs:${NC}     docker compose -f $COMPOSE_FILE logs -f"
echo -e "   ${YELLOW}Backend:${NC}       docker logs -f $BACKEND_CONTAINER"
echo -e "   ${YELLOW}Database:${NC}      docker logs -f $DB_CONTAINER"
echo -e "   ${YELLOW}Stop all:${NC}      docker compose -f $COMPOSE_FILE down"
echo -e "   ${YELLOW}Backup:${NC}        ./backup.sh"
echo ""

echo -e "${GREEN}🎉 Deployment finished successfully!${NC}"
