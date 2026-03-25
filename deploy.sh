#!/bin/bash
# ============================================================
# deploy.sh - Informatics Go Green Production Deployment Script
# ============================================================
# Usage: ./deploy.sh [--seed] [--backup]
#   --seed    : Run database seeder after deployment
#   --backup  : Backup database before deployment
# ============================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.prod.yml"
BACKEND_CONTAINER="informatics-go-green-backend-prod"
DB_CONTAINER="informatics-go-green-db-prod"
BACKUP_DIR="./backups"

# Parse arguments
RUN_SEED=false
RUN_BACKUP=false
for arg in "$@"; do
  case $arg in
    --seed)   RUN_SEED=true ;;
    --backup) RUN_BACKUP=true ;;
    *)        echo -e "${RED}Unknown argument: $arg${NC}"; exit 1 ;;
  esac
done

echo -e "${BLUE}============================================================${NC}"
echo -e "${BLUE}  🚀 Informatics Go Green - Production Deployment${NC}"
echo -e "${BLUE}============================================================${NC}"
echo ""

# 1. Check if .env file exists
echo -e "${YELLOW}📋 Step 1: Checking environment configuration...${NC}"
if [ ! -f ".env" ]; then
  echo -e "${RED}❌ .env file not found! Copy .env.example and configure it.${NC}"
  echo -e "${RED}   cp .env.example .env${NC}"
  exit 1
fi
echo -e "${GREEN}✅ .env file found${NC}"
echo ""

# 2. Pull latest code
echo -e "${YELLOW}📥 Step 2: Pulling latest code from repository...${NC}"
git pull origin "$(git rev-parse --abbrev-ref HEAD)" || {
  echo -e "${YELLOW}⚠️  Git pull failed. Continuing with current code...${NC}"
}
echo -e "${GREEN}✅ Code is up to date${NC}"
echo ""

# 3. Backup database (if requested)
if [ "$RUN_BACKUP" = true ]; then
  echo -e "${YELLOW}💾 Step 3: Backing up database...${NC}"
  ./backup.sh || {
    echo -e "${RED}❌ Backup failed! Aborting deployment.${NC}"
    exit 1
  }
  echo -e "${GREEN}✅ Database backed up${NC}"
  echo ""
else
  echo -e "${YELLOW}⏭️  Step 3: Skipping database backup (use --backup to enable)${NC}"
  echo ""
fi

# 4. Build Docker images
echo -e "${YELLOW}🔨 Step 4: Building Docker images...${NC}"
docker compose -f "$COMPOSE_FILE" build --no-cache
echo -e "${GREEN}✅ Docker images built successfully${NC}"
echo ""

# 5. Stop existing containers
echo -e "${YELLOW}🛑 Step 5: Stopping existing containers...${NC}"
docker compose -f "$COMPOSE_FILE" down || true
echo -e "${GREEN}✅ Containers stopped${NC}"
echo ""

# 6. Start containers (migrations will run automatically via migrationsRun: true)
echo -e "${YELLOW}🚀 Step 6: Starting containers...${NC}"
docker compose -f "$COMPOSE_FILE" up -d
echo -e "${GREEN}✅ Containers started${NC}"
echo ""

# 7. Wait for backend to be healthy
echo -e "${YELLOW}⏳ Step 7: Waiting for backend health check...${NC}"
MAX_RETRIES=30
RETRY_COUNT=0
until docker exec "$BACKEND_CONTAINER" wget -q --spider http://localhost:3001/api/health 2>/dev/null; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [ "$RETRY_COUNT" -ge "$MAX_RETRIES" ]; then
    echo -e "${RED}❌ Backend failed to start after ${MAX_RETRIES} attempts.${NC}"
    echo -e "${RED}   Check logs: docker logs ${BACKEND_CONTAINER}${NC}"
    exit 1
  fi
  echo -e "  Attempt ${RETRY_COUNT}/${MAX_RETRIES}..."
  sleep 5
done
echo -e "${GREEN}✅ Backend is healthy!${NC}"
echo ""

# 8. Run seed (if requested)
if [ "$RUN_SEED" = true ]; then
  echo -e "${YELLOW}🌱 Step 8: Running database seeder...${NC}"
  docker exec "$BACKEND_CONTAINER" node /app/dist/database/run-seed.js
  echo -e "${GREEN}✅ Database seeded successfully${NC}"
  echo ""
else
  echo -e "${YELLOW}⏭️  Step 8: Skipping database seeder (use --seed to enable)${NC}"
  echo ""
fi

# 9. Show status
echo -e "${BLUE}============================================================${NC}"
echo -e "${GREEN}  ✅ Deployment completed successfully!${NC}"
echo -e "${BLUE}============================================================${NC}"
echo ""
docker compose -f "$COMPOSE_FILE" ps
echo ""
echo -e "${BLUE}📋 Useful commands:${NC}"
echo -e "  View logs:     docker compose -f $COMPOSE_FILE logs -f"
echo -e "  Backend logs:  docker logs -f $BACKEND_CONTAINER"
echo -e "  DB logs:       docker logs -f $DB_CONTAINER"
echo -e "  Stop:          docker compose -f $COMPOSE_FILE down"
echo -e "  Backup DB:     ./backup.sh"
echo ""
