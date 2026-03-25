#!/bin/bash
# ============================================================
# backup.sh - Database Backup Script
# ============================================================
# Usage: ./backup.sh
# Creates a timestamped pg_dump backup in ./backups/
# ============================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
DB_CONTAINER="informatics-go-green-db-prod"
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Load env vars
if [ -f ".env" ]; then
  export $(grep -E '^(POSTGRES_USER|POSTGRES_DB)=' .env | xargs)
fi

DB_USER="${POSTGRES_USER:-postgres}"
DB_NAME="${POSTGRES_DB:-informatics_go_green}"
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_${TIMESTAMP}.sql.gz"

echo -e "${YELLOW}💾 Starting database backup...${NC}"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Check if container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${DB_CONTAINER}$"; then
  echo -e "${RED}❌ Database container '${DB_CONTAINER}' is not running.${NC}"
  exit 1
fi

# Run pg_dump inside the container and compress
echo -e "  Database: ${DB_NAME}"
echo -e "  User:     ${DB_USER}"
echo -e "  Output:   ${BACKUP_FILE}"
echo ""

docker exec "$DB_CONTAINER" pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_FILE"

# Verify backup
BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo -e "${GREEN}✅ Backup completed successfully!${NC}"
echo -e "   File: ${BACKUP_FILE}"
echo -e "   Size: ${BACKUP_SIZE}"
echo ""

# Clean up old backups (keep last 10)
BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/*.sql.gz 2>/dev/null | wc -l)
if [ "$BACKUP_COUNT" -gt 10 ]; then
  echo -e "${YELLOW}🧹 Cleaning up old backups (keeping last 10)...${NC}"
  ls -1t "$BACKUP_DIR"/*.sql.gz | tail -n +11 | xargs rm -f
  echo -e "${GREEN}✅ Old backups removed${NC}"
fi
