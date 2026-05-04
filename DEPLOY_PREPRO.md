# Deployment Pre-production
```bash
ใช้ branch deploy/prepro ในการ deploy
```
## 1. ตั้งค่า .env
สร้างไฟล์ `.env` และใส่ค่าดังนี้:

```env
NODE_ENV=production

# PostgreSQL Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=informatics_go_green

# Backend Configuration
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=informatics_go_green

# API Prefix for subpath deployment
API_PREFIX=if-go-green-api/api

# App URLs (used by backend for CORS & redirects)
FRONTEND_URL=https://prepro.informatics.buu.ac.th
API_URL=https://prepro.informatics.buu.ac.th/if-go-green-api/api

# Frontend Public API URL (build-time env)
NEXT_PUBLIC_API_URL=https://prepro.informatics.buu.ac.th/if-go-green-api/api
NEXT_PUBLIC_BASE_PATH=/if-go-green

# JWT Configuration
JWT_SECRET=YOUR_JWT_SECRET_HERE
JWT_EXPIRES_IN_SECONDS=604800

# Google OAuth
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
GOOGLE_CALLBACK_URL=https://prepro.informatics.buu.ac.th/if-go-green-api/api/auth/google/callback
```

## 2. รัน Docker Compose
```bash
docker compose -f docker-compose.yml -f docker-compose.prepro.yml up --build -d
```

## 3. รัน Seed ข้อมูล
```bash
docker exec if-go-green-api1 node dist/database/run-seed.js
```
