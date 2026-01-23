# Docker Setup Guide

## Overview

โปรเจกต์นี้มี Docker Compose 2 ชุดสำหรับใช้งานต่างกัน:

| File | Purpose | Use Case |
|------|---------|----------|
| `docker-compose.dev.yml` | Development | พัฒนาและ test ใน local |
| `docker-compose.prod.yml` | Production | Deploy ขึ้น server จริง |

---

## 🔧 Development

### Quick Start

```bash
# Build และ run ทั้งหมด
docker-compose -f docker-compose.dev.yml up --build

# Run แบบ background
docker-compose -f docker-compose.dev.yml up --build -d

# ดู logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop ทั้งหมด
docker-compose -f docker-compose.dev.yml down
```

### Features

- ✅ **Hot Reload** - แก้ไข code แล้วเห็นผลทันที
- ✅ **Source code mounting** - Mount เฉพาะ `src/` และ `app/`
- ✅ **node_modules ใน container** - ไม่มีปัญหา dependencies หาย
- ✅ **Watch mode** - รองรับ `docker compose watch`

### Ports

| Service | Port | URL |
|---------|------|-----|
| Frontend | 3000 | http://localhost:3000 |
| Backend | 3001 | http://localhost:3001 |
| PostgreSQL | 5432 | localhost:5432 |

---

## 🚀 Production

### Quick Start

```bash
# Build และ run ทั้งหมด
docker-compose -f docker-compose.prod.yml up --build -d

# ดู logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop ทั้งหมด
docker-compose -f docker-compose.prod.yml down
```

### With Nginx (Optional)

```bash
# สร้าง nginx config ก่อน (ดูตัวอย่างด้านล่าง)
docker-compose -f docker-compose.prod.yml --profile with-nginx up --build -d
```

### Features

- ✅ **Multi-stage builds** - Image ขนาดเล็ก
- ✅ **No volume mounts** - ไม่ต้องมี source code บน server
- ✅ **Security** - Run as non-root user
- ✅ **Health checks** - ตรวจสอบ service อัตโนมัติ
- ✅ **Network isolation** - แยก internal/web networks

---

## 📁 Files Structure

```
├── docker-compose.dev.yml     # Development compose
├── docker-compose.prod.yml    # Production compose
├── docker-compose.yml         # Original (deprecated)
├── backend/
│   ├── Dockerfile.dev         # Dev dockerfile
│   └── Dockerfile.prod        # Prod dockerfile (multi-stage)
└── frontend/
    ├── Dockerfile.dev         # Dev dockerfile
    └── Dockerfile.prod        # Prod dockerfile (multi-stage)
```

---

## ⚠️ Common Issues

### หลัง clone แล้ว node_modules ไม่ติดตั้ง

**ปัญหา**: Volume mount ทับ node_modules ใน container

**วิธีแก้**: ใช้ `docker-compose.dev.yml` ที่ mount เฉพาะ source code

```bash
# ลบ containers และ volumes เก่า
docker-compose -f docker-compose.dev.yml down -v

# Build ใหม่จาก scratch
docker-compose -f docker-compose.dev.yml up --build
```

### Build fails หลังจาก update package.json

```bash
# Force rebuild without cache
docker-compose -f docker-compose.dev.yml build --no-cache
docker-compose -f docker-compose.dev.yml up
```

---

## 🔐 Environment Variables

สร้างไฟล์ `.env` จาก `.env.example`:

```bash
cp .env.example .env
```

### Required for Production

```env
POSTGRES_USER=your_user
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=informatics_go_green
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```
