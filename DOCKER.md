# 🐳 Docker Guide

คู่มือการใช้งาน Docker สำหรับโปรเจค Informatics Go Green

---

## 📋 Table of Contents

- [Architecture Overview](#-architecture-overview)
- [Development Mode](#-development-mode)
- [Production Mode](#-production-mode)
- [Useful Commands](#-useful-commands)
- [Environment Variables](#-environment-variables)
- [Troubleshooting](#-troubleshooting)
- [Configuration Files](#-configuration-files)

---

## 🏗 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Network                           │
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │  Frontend   │───▶│   Backend   │───▶│  PostgreSQL │     │
│  │  (Next.js)  │    │  (NestJS)   │    │    (DB)     │     │
│  │  Port:3000  │    │  Port:3001  │    │  Port:5432  │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

| Service | Container Name | Port | Image |
|---------|---------------|------|-------|
| Frontend | `informatics-go-green-frontend-dev` | 3000 | node:20-alpine |
| Backend | `informatics-go-green-backend-dev` | 3001 | node:20-alpine |
| Database | `informatics-go-green-db-dev` | 5432 | postgres:16-alpine |

---

## 🛠 Development Mode

ใช้ไฟล์ `docker-compose.dev.yml` สำหรับการพัฒนา — รองรับ **Hot Reload** และ **Volume Mounting**

### Start Development Environment

```bash
# Start ครั้งแรก หรือหลังแก้ไข package.json
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d

# Start ปกติ
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Start พร้อม Hot Reload Watch Mode (แนะนำ)
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build --watch
```

### Hot Reload Configuration

ระบบรองรับ Hot Reload เมื่อ save ไฟล์:

| Service | Method | Files |
|---------|--------|-------|
| **Frontend** | Next.js Fast Refresh | `frontend/app/**/*` |
| **Backend** | NestJS Watch Mode | `backend/src/**/*` |

> **Tip**: ใช้ `--watch` flag เพื่อให้ Docker Compose Watch sync ไฟล์อัตโนมัติ

---

## 🚢 Production Mode

ใช้ไฟล์ `docker-compose.prod.yml` สำหรับ Production — optimized build ไม่มี Hot Reload

```bash
# Build และ Start Production
docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d

# หรือใช้ docker-compose.yml (default)
docker-compose up --build -d
```

---

## 📝 Useful Commands

### Container Management

| Command | Description |
|---------|-------------|
| `docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d` | Start containers (background) |
| `docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d` | Rebuild และ start |
| `docker compose -f docker-compose.yml -f docker-compose.dev.yml down` | Stop และลบ containers |
| `docker compose -f docker-compose.yml -f docker-compose.dev.yml restart` | Restart ทุก containers |
| `docker compose -f docker-compose.yml -f docker-compose.dev.yml restart backend` | Restart เฉพาะ backend |

### Logs & Debugging

| Command | Description |
|---------|-------------|
| `docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f` | ดู logs ทั้งหมด (real-time) |
| `docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f backend` | ดู logs เฉพาะ backend |
| `docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f frontend` | ดู logs เฉพาะ frontend |
| `docker compose -f docker-compose.yml -f docker-compose.dev.yml ps` | แสดง status ของ containers |

### Database Operations

| Command | Description |
|---------|-------------|
| `docker compose -f docker-compose.yml -f docker-compose.dev.yml exec postgres psql -U postgres -d informatics_go_green` | เข้า PostgreSQL CLI |
| `docker compose -f docker-compose.yml -f docker-compose.dev.yml exec postgres pg_dump -U postgres informatics_go_green > backup.sql` | Backup database |

### Container Access

| Command | Description |
|---------|-------------|
| `docker compose -f docker-compose.yml -f docker-compose.dev.yml exec backend sh` | เข้า shell ใน backend |
| `docker compose -f docker-compose.yml -f docker-compose.dev.yml exec frontend sh` | เข้า shell ใน frontend |

---

## 🔧 Environment Variables

### Required Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `POSTGRES_USER` | Database username | `postgres` |
| `POSTGRES_PASSWORD` | Database password | `postgres` |
| `POSTGRES_DB` | Database name | `informatics_go_green` |
| `JWT_SECRET` | Secret key for JWT | - |

### Optional Variables (OAuth)

| Variable | Description |
|----------|-------------|
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret |
| `GOOGLE_CALLBACK_URL` | OAuth Callback URL |

> Copy `.env.example` เป็น `.env` และแก้ไขค่าตามต้องการ

---

## ⚠️ Troubleshooting

### Common Issues

| Problem | Cause | Solution |
|---------|-------|----------|
| **bcrypt Error** | `bcrypt` compiled on Windows ไม่ทำงานบน Linux Container | ใช้ `bcryptjs` แทน (แก้ไขแล้ว) หรือ rebuild: `docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d backend` |
| **413 Payload Too Large** | ขนาดไฟล์รูปภาพที่อัปโหลดใหญ่เกินขีดจำกัด | เพิ่ม `client_max_body_size 50M;` ใน Nginx และตั้งค่า `fileSize` ใน `FilesInterceptor` (Backend) |
| **Dependency Conflict** | npm ci failed เนื่องจาก version conflict | ใช้ `npm install --legacy-peer-deps` (ตั้งค่าใน Dockerfile.dev แล้ว) |
| **Hot Reload ไม่ทำงาน** | Volume mounting มีปัญหาบน Windows | ลอง restart Docker Desktop หรือใช้ `--watch` flag |
| **Database Connection Refused** | PostgreSQL ยังไม่พร้อม | รอสักครู่หรือ `docker compose -f docker-compose.yml -f docker-compose.dev.yml restart backend` |
| **Port Already in Use** | Port 3000/3001/5432 ถูกใช้งานอยู่ | หยุด process ที่ใช้ port นั้น หรือเปลี่ยน port ใน docker-compose |

### Reset Everything

```bash
# Stop ทั้งหมด
docker compose -f docker-compose.yml -f docker-compose.dev.yml down

# ลบ volumes (ระวัง: ลบข้อมูล database ด้วย!)
docker compose -f docker-compose.yml -f docker-compose.dev.yml down -v

# Rebuild จาก scratch
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d
```

---

## ⚙️ Configuration Files

| File | Purpose |
|------|---------|
| `docker-compose.dev.yml` | Development config (Hot Reload, Volume Mount) |
| `docker-compose.prod.yml` | Production config (Optimized Build) |
| `docker-compose.yml` | Default/Legacy config |
| `backend/Dockerfile.dev` | Backend Dev image |
| `backend/Dockerfile.prod` | Backend Production image |
| `frontend/Dockerfile.dev` | Frontend Dev image |
| `frontend/Dockerfile.prod` | Frontend Production image |

---

<p align="center">
  Need help? Check the <a href="DEVELOPER_GUIDE.md">Developer Guide</a> or open an issue.
</p>
