# 🚀 คู่มือ Deploy บน PREPRO (Subpath Deployment)

> **URL เป้าหมาย:** `https://prepro.informatics.buu.ac.th/if-go-green/`
> **API เป้าหมาย:** `https://prepro.informatics.buu.ac.th/if-go-green-api/api`

---

## 📋 สารบัญ

1. [Overview](#-overview)
2. [สิ่งที่ได้แก้ไขในโปรเจค](#-สิ่งที่ได้แก้ไขในโปรเจค)
3. [ขั้นตอนการ Deploy](#-ขั้นตอนการ-deploy)
4. [Nginx Config ฝั่งมหาวิทยาลัย](#-nginx-config-ฝั่งมหาวิทยาลัย)
5. [Environment Variables](#-environment-variables)
6. [การตรวจสอบหลัง Deploy](#-การตรวจสอบหลัง-deploy)
7. [แก้ไขปัญหาเบื้องต้น](#-แก้ไขปัญหาเบื้องต้น)

---

## 🎯 Overview

โปรเจคนี้ deploy เป็น **subpath** ของ domain มหาวิทยาลัย ไม่ใช่ subdomain หรือ root path

```
https://prepro.informatics.buu.ac.th/if-go-green/          ← Frontend (Next.js)
https://prepro.informatics.buu.ac.th/if-go-green-api/api   ← Backend API (NestJS)
```

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  User Browser                                               │
│  https://prepro.informatics.buu.ac.th/if-go-green/         │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│  Nginx (มหาวิทยาลัย - Managed by IT)                        │
│  location /if-go-green/  →  proxy_pass  →  if-go-green-web1│
│  location /if-go-green-api/api  →  proxy_pass → if-go-green-api1│
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        ▼                             ▼
┌───────────────┐            ┌─────────────────┐
│  Frontend     │            │  Backend        │
│  Container    │            │  Container      │
│  :9060        │            │  :9061          │
│  Next.js      │            │  NestJS         │
│  basePath:    │            │  prefix:        │
│  /if-go-green │            │  if-go-green-api/api│
└───────────────┘            └─────────────────┘
        │                             │
        └──────────────┬──────────────┘
                       ▼
              ┌─────────────────┐
              │  PostgreSQL     │
              │  :5432          │
              └─────────────────┘
```

---

## 🔧 สิ่งที่ได้แก้ไขในโปรเจค

### 1. Frontend (`frontend/next.config.ts`)

เพิ่ม `basePath` และ `assetPrefix` เพื่อให้ Next.js รองรับการรันที่ subpath:

```typescript
basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || "",
```

### 2. Frontend Dockerfile (`frontend/Dockerfile.prod`)

เพิ่ม build argument สำหรับ `NEXT_PUBLIC_BASE_PATH`:

```dockerfile
ARG NEXT_PUBLIC_BASE_PATH
ENV NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH
```

### 3. Backend (`backend/src/main.ts`)

ทำให้ API prefix ปรับได้ผ่าน environment variable:

```typescript
const apiPrefix = process.env.API_PREFIX || 'api';
app.setGlobalPrefix(apiPrefix);
```

### 4. เพิ่มไฟล์ใหม่

| ไฟล์ | รายละเอียด |
|------|------------|
| `.env.prepro` | Environment variables สำหรับ prepro |
| `docker-compose.prepro.yml` | Docker Compose override สำหรับ prepro |
| `DEPLOY_PREPRO.md` | คู่มือนี้ |

---

## 🚀 ขั้นตอนการ Deploy

### Step 1: SSH เข้าเครื่อง PREPRO

```bash
ssh user@prepro.informatics.buu.ac.th
```

### Step 2: Clone หรือ Pull โปรเจค

```bash
cd ~
git clone https://github.com/Chaimanat2546/Informatics-Go-Green.git
cd Informatics-Go-Green
git checkout deploy/prepro
```

หรือถ้ามีอยู่แล้ว:

```bash
cd ~/Informatics-Go-Green
git pull origin deploy/prepro
```

### Step 3: ตั้งค่า Environment

```bash
# คัดลอกไฟล์ environment สำหรับ prepro
cp .env.prepro .env

# แก้ไขค่าตามต้องการ (โดยเฉพาะ password และ secrets)
nano .env
```

> ⚠️ **สำคัญ:** ต้องเปลี่ยน `JWT_SECRET` และ `POSTGRES_PASSWORD` ให้เป็น secure random string ใน production!

### Step 4: Build & Start Containers

```bash
# Stop และลบ containers เก่า (ถ้ามี)
docker compose -f docker-compose.yml -f docker-compose.prepro.yml down

# Build และ start ใหม่
docker compose -f docker-compose.yml -f docker-compose.prepro.yml up --build -d
```

หรือใช้ script ที่มีอยู่:

```bash
# ถ้าต้องการใช้ deploy-full.sh ที่มีอยู่ ให้ปรับตามคู่มือนี้
```

### Step 5: รอให้ Services พร้อม

```bash
# ตรวจสอบสถานะ containers
docker compose -f docker-compose.yml -f docker-compose.prepro.yml ps

# ดู logs
# Frontend
docker logs -f if-go-green-web1

# Backend
docker logs -f if-go-green-api1

# Database
docker logs -f if-go-green-db-prepro
```

### Step 6: Seed ข้อมูลเริ่มต้น (ถ้าต้องการ)

```bash
# ตรวจสอบ IP ของ database container
DB_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' if-go-green-db-prepro)

# รัน seeder จาก host (ต้องมี Node.js และ npm บน host)
cd backend
export $(grep -v '^#' ../.env | xargs)
export DATABASE_HOST=$DB_IP
npx ts-node src/database/run-seed.ts
```

> **หมายเหตุ:** ถ้าไม่มี Node.js บน host ให้รัน seeder ผ่าน container:
> ```bash
> docker compose -f docker-compose.yml -f docker-compose.prepro.yml exec backend sh -c "cd /app && npx typeorm migration:run -d dist/data-source.js"
> ```
> จากนั้นอาจต้องสร้าง script seed แยกสำหรับ production (เพราะ ts-node ไม่มีใน prod image)

---

## 🌐 Nginx Config ฝั่งมหาวิทยาลัย

### Config ที่อาจารย์ส่งมา (ใช้ได้แล้ว)

```nginx
### if go green by AJ.Athita
location /if-go-green/ {
    proxy_pass http://if-go-green-web1/if-go-green;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
    client_max_body_size 500M;
    add_header Access-Control-Allow-Origin *;
}

location /if-go-green-api/api {
    proxy_pass http://if-go-green-api1;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_redirect off;
    proxy_cache_bypass $http_upgrade;
    client_max_body_size 500M;
    add_header Access-Control-Allow-Origin *;
}
#######End if-go-green by Aj.Athita
```

### ⚠️ จุดที่ต้องระวัง

1. **Frontend proxy_pass:** `http://if-go-green-web1/if-go-green` (ไม่มี slash ท้าย)
   - หมายความว่า upstream ต้องรัน Next.js ที่ `basePath: '/if-go-green'`
   - ตัวอย่าง: `/if-go-green/login` → ไปที่ `http://if-go-green-web1/if-go-green/login`

2. **Backend proxy_pass:** `http://if-go-green-api1` (ไม่มี trailing slash)
   - หมายความว่า original URI `/if-go-green-api/api/...` จะถูกส่งต่อไปยัง backend แบบเต็มๆ
   - ดังนั้น backend ต้อง set `API_PREFIX=if-go-green-api/api` เพื่อให้รองรับ path นี้

---

## 🔑 Environment Variables

### `.env.prepro` สำคัญ

| ตัวแปร | ค่าใน Prepro | รายละเอียด |
|--------|--------------|------------|
| `NEXT_PUBLIC_BASE_PATH` | `/if-go-green` | Subpath ของ frontend |
| `NEXT_PUBLIC_API_URL` | `https://prepro.informatics.buu.ac.th/if-go-green-api/api` | URL ที่ browser เรียก API |
| `API_PREFIX` | `if-go-green-api/api` | Prefix ที่ backend รองรับ |
| `FRONTEND_URL` | `https://prepro.informatics.buu.ac.th` | ใช้สำหรับ CORS |
| `GOOGLE_CALLBACK_URL` | `https://prepro.informatics.buu.ac.th/if-go-green-api/api/auth/google/callback` | OAuth callback |

### การสร้าง JWT Secret ที่ปลอดภัย

```bash
openssl rand -base64 32
# หรือ
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

นำค่าที่ได้ไปใส่ใน `JWT_SECRET=` ในไฟล์ `.env`

---

## ✅ การตรวจสอบหลัง Deploy

### 1. ตรวจสอบ Containers

```bash
docker compose -f docker-compose.yml -f docker-compose.prepro.yml ps
```

ควรเห็นสถานะ `healthy`:

```
NAME                    STATUS                            PORTS
if-go-green-web1        Up 2 minutes (healthy)            0.0.0.0:9060->3000/tcp
if-go-green-api1        Up 2 minutes (healthy)            0.0.0.0:9061->3001/tcp
if-go-green-db-prepro   Up 2 minutes (healthy)            5432/tcp
```

### 2. ทดสอบ API (จากเครื่อง prepro)

```bash
# Health check
curl http://localhost:9061/if-go-green-api/api/health

# หรือถ้าไม่มี health endpoint ให้ลอง:
curl http://localhost:9061/if-go-green-api/api
```

### 3. ทดสอบ Frontend (จากเครื่อง prepro)

```bash
curl -I http://localhost:9060/if-go-green
```

### 4. ทดสอบจาก Browser

เปิด URL ต่อไปนี้:

| URL | ควรเห็น |
|-----|---------|
| `https://prepro.informatics.buu.ac.th/if-go-green/` | หน้า Login |
| `https://prepro.informatics.buu.ac.th/if-go-green/login` | หน้า Login |
| `https://prepro.informatics.buu.ac.th/if-go-green-api/api` | API JSON response |

---

## 🐛 แก้ไขปัญหาเบื้องต้น

### ปัญหา 1: 404 Not Found ที่ `/if-go-green/`

**สาเหตุ:** Next.js ไม่ได้ build ด้วย `basePath`

**แก้ไข:**
```bash
# ตรวจสอบว่า build ด้วย env ถูกต้อง
docker compose -f docker-compose.yml -f docker-compose.prepro.yml build --no-cache frontend
docker compose -f docker-compose.yml -f docker-compose.prepro.yml up -d frontend
```

### ปัญหา 2: API 404 ที่ `/if-go-green-api/api/...`

**สาเหตุ:** Backend ไม่ได้ set prefix ให้รองรับ `if-go-green-api/api`

**แก้ไข:**
```bash
# ตรวจสอบ env ใน container
docker exec if-go-green-api1 env | grep API_PREFIX
# ควรเห็น: API_PREFIX=if-go-green-api/api

# ถ้าไม่ถูกต้อง ให้ rebuild
docker compose -f docker-compose.yml -f docker-compose.prepro.yml up -d --build backend
```

### ปัญหา 3: CORS Error

**สาเหตุ:** `FRONTEND_URL` ไม่ตรงกับ URL ที่ browser เรียก

**แก้ไข:**
แก้ไข `.env` ให้ `FRONTEND_URL` ตรงกับ domain จริง แล้ว restart backend:

```bash
docker compose -f docker-compose.yml -f docker-compose.prepro.yml restart backend
```

### ปัญหา 4: Google OAuth ไม่ทำงาน

**สาเหตุ:** `GOOGLE_CALLBACK_URL` ไม่ตรง

**แก้ไข:**
1. แก้ไข `GOOGLE_CALLBACK_URL` ใน `.env`
2. ไปที่ [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials
3. เพิ่ม Authorized redirect URI:
   ```
   https://prepro.informatics.buu.ac.th/if-go-green-api/api/auth/google/callback
   ```
4. Restart backend

### ปัญหา 5: Database connection failed

**แก้ไข:**
```bash
# ตรวจสอบว่า DB รันอยู่
docker logs if-go-green-db-prepro

# ตรวจสอบว่า backend ต่อถูก host
docker exec if-go-green-api1 env | grep DATABASE_HOST
# ควรเห็น: DATABASE_HOST=postgres (ชื่อ service ใน docker network)
```

---

## 📞 ติดต่อสอบถาม

หากพบปัญหาที่ไม่สามารถแก้ไขได้ตามคู่มือนี้ กรุณาตรวจสอบ logs และส่งมาพร้อมกับ:

1. ผลลัพธ์ของ `docker compose ps`
2. Logs ที่เกี่ยวข้อง (`docker logs <container_name>`)
3. ส่วนของ `.env` ที่แก้ไข (ซ่อน password)

---

**จัดทำเมื่อ:** 2025-04-18
**เวอร์ชัน:** 1.0
**สำหรับ:** Informatics Go Green - Prepro Deployment
