# 🎓 สรุปขั้นตอนให้ทีม IT มหาวิทยาลัยบูรพาทำ

## 📋 ข้อมูลระบบ
- **Domain**: `if-go-green.informatics.buu.ac.th`
- **Web Port**: 9060
- **API Port**: 9061
- **Source**: https://github.com/Chaimanat2546/Informatics-Go-Green (branch: `main`)

---

## ✅ ขั้นตอนที่ 1: เตรียมเครื่อง Server

```bash
# 1.1 ติดตั้ง Docker และ Docker Compose
sudo apt update
sudo apt install -y docker.io docker-compose-v2 git nginx
sudo systemctl enable docker
sudo systemctl start docker

# 1.2 เพิ่ม Swap (แนะนำ 2GB ขึ้นไป ถ้า RAM ไม่เกิน 4GB)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# 1.3 Clone โปรเจค
cd /opt
sudo git clone https://github.com/Chaimanat2546/Informatics-Go-Green.git
cd Informatics-Go-Green
sudo git checkout develop
```

---

## ✅ ขั้นตอนที่ 2: ตั้งค่า Environment

```bash
# 2.1 สร้างไฟล์ .env
cd /opt/Informatics-Go-Green
sudo nano .env
```

**เนื้อหาไฟล์ .env:**

```env
NODE_ENV=production

# Database
POSTGRES_USER=goapp
POSTGRES_PASSWORD=[ตั้งรหัสผ่านที่ปลอดภัย]
POSTGRES_DB=informatics_go_green

# Backend
API_URL=https://if-go-green.informatics.buu.ac.th
FRONTEND_URL=https://if-go-green.informatics.buu.ac.th
JWT_SECRET=[ตั้ง random string ยาว 64 ตัวอักษรขึ้นไป]
JWT_EXPIRES_IN_SECONDS=604800

# Frontend
NEXT_PUBLIC_API_URL=https://if-go-green.informatics.buu.ac.th/api

# Google OAuth (ถ้าใช้)
GOOGLE_CLIENT_ID=[ไปเอาจาก Google Cloud Console]
GOOGLE_CLIENT_SECRET=[ไปเอาจาก Google Cloud Console]
GOOGLE_CALLBACK_URL=https://if-go-green.informatics.buu.ac.th/api/auth/google/callback

# SMTP (ถ้าใช้ส่ง email reset password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=[อีเมลที่ใช้ส่ง]
SMTP_PASS=[app password จาก Google]

# Waste Reaction Settings
WASTE_DISLIKE_THRESHOLD=50
NEXT_PUBLIC_WASTE_DISLIKE_THRESHOLD=50
```

⚠️ **ต้องเปลี่ยน:**
- `POSTGRES_PASSWORD` → รหัสผ่านที่ปลอดภัย (ใช้ `openssl rand -hex 32` เพื่อสร้าง)
- `JWT_SECRET` → random string ยาว 64+ ตัวอักษร (ใช้ `openssl rand -hex 32` เพื่อสร้าง)
- `GOOGLE_CLIENT_ID/SECRET` → ถ้าใช้ Google Login
- `SMTP_USER/SMTP_PASS` → ถ้าใช้ฟีเจอร์ reset password ทาง email

---

## ✅ ขั้นตอนที่ 3: ตั้งค่า Nginx

```bash
# 3.1 คัดลอก config จากโปรเจค (หรือสร้างเอง)
sudo cp /opt/Informatics-Go-Green/deployment/buu/nginx-buu.conf /etc/nginx/sites-available/if-go-green

# 3.2 Enable config
sudo ln -sf /etc/nginx/sites-available/if-go-green /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

> ℹ️ ไฟล์ `nginx-buu.conf` พร้อมใช้งานอยู่ใน `/opt/Informatics-Go-Green/deployment/buu/nginx-buu.conf`

---

## ✅ ขั้นตอนที่ 4: Build และรัน Docker

```bash
cd /opt/Informatics-Go-Green

# 4.1 ตั้งค่า permission ให้ deploy script
sudo chmod +x deploy.sh backup.sh

# 4.2 Build และรัน containers
sudo docker compose -f docker-compose.prod.yml up --build -d

# 4.3 รอให้พร้อม (ประมาณ 30-60 วินาที)
sleep 30

# 4.4 ตรวจสอบว่ารันสำเร็จ
sudo docker ps -a

# 4.5 ตรวจสอบ Health Check
curl http://localhost:9061/api/health
```

ควรเห็น 3 containers:
- `informatics-go-green-db-prod` ✅
- `informatics-go-green-backend-prod` ✅
- `informatics-go-green-frontend-prod` ✅

Health check ควรตอบกลับ:
```json
{"status":"ok","uptime":...,"timestamp":"...","environment":"production"}
```

---

## ✅ ขั้นตอนที่ 5: Seed ข้อมูลเริ่มต้น (ถ้าจำเป็น)

```bash
# 5.1 Seed ข้อมูลพื้นฐาน (ประเภทขยะ, วัสดุ, วิธีจัดการ)
sudo docker exec informatics-go-green-backend-prod node /app/dist/database/run-seed.js
```

> ℹ️ Migrations จะรันอัตโนมัติเมื่อ backend start ไม่ต้องรัน migration แยก

---

## ✅ ขั้นตอนที่ 6: สร้าง Admin User

```bash
# เข้าไปใน database
sudo docker exec -it informatics-go-green-db-prod psql -U goapp -d informatics_go_green
```

**รัน SQL:**

```sql
-- ตรวจสอบว่า uuid extension พร้อมใช้
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

INSERT INTO users (id, email, password, "firstName", "lastName", "phoneNumber", province, role, "isActive", provider, "createdAt", "updatedAt")
VALUES (
  uuid_generate_v4(),
  'admin@buu.ac.th',
  -- รหัสผ่าน: admin123 (bcrypt hash)
  '$2a$10$TRE7.9QS5RbwZ6kP0dcRveqOGRMi/VpsLTnJMolRJphSpECwUnKgK',
  'Admin',
  'BUU',
  '038393027',
  'ชลบุรี',
  'admin',
  true,
  'local',
  NOW(),
  NOW()
);

\q
```

**Admin Login:**
- Email: `admin@buu.ac.th`
- Password: `admin123`

⚠️ **อย่าลืมเปลี่ยนรหัสผ่าน Admin ทันทีหลังจากเข้าใช้งานครั้งแรก!**

---

## ✅ ขั้นตอนที่ 7: ตั้งค่า Google OAuth (ถ้าใช้)

1. ไปที่ https://console.cloud.google.com/apis/credentials
2. สร้างโปรเจค → เปิดใช้งาน **Google+ API** (หรือ People API)
3. สร้าง OAuth client ID:
   - Application type: **Web application**
   - Authorized JavaScript origins: `https://if-go-green.informatics.buu.ac.th`
   - Authorized redirect URIs: `https://if-go-green.informatics.buu.ac.th/api/auth/google/callback`
4. นำ Client ID และ Secret ใส่ในไฟล์ `.env`
5. Restart backend:
```bash
sudo docker compose -f /opt/Informatics-Go-Green/docker-compose.prod.yml restart backend
```

---

## ✅ ขั้นตอนที่ 8: ตั้งค่า HTTPS (แนะนำ)

```bash
# ติดตั้ง Certbot
sudo apt install -y certbot python3-certbot-nginx

# ขอ SSL certificate
sudo certbot --nginx -d if-go-green.informatics.buu.ac.th

# ตรวจสอบว่า auto-renew ทำงาน
sudo systemctl status certbot.timer
```

---

## ✅ ขั้นตอนที่ 9: ตั้งค่า Backup อัตโนมัติ (แนะนำ)

```bash
# 9.1 ทดสอบ backup script
cd /opt/Informatics-Go-Green
sudo ./backup.sh

# 9.2 ตั้ง cron job ให้ backup ทุกวัน ตอนตี 3
sudo crontab -e
```

เพิ่มบรรทัดนี้:
```cron
0 3 * * * cd /opt/Informatics-Go-Green && ./backup.sh >> /var/log/gogreen-backup.log 2>&1
```

---

## 🧪 ทดสอบระบบ

```bash
# Test Health Check
curl https://if-go-green.informatics.buu.ac.th/api/health

# Test API
curl https://if-go-green.informatics.buu.ac.th/api/

# Test Dashboard
curl "https://if-go-green.informatics.buu.ac.th/api/waste/cards-summary?type=daily&date=2026-03-22"
```

เปิด browser: `https://if-go-green.informatics.buu.ac.th`

---

## 🔧 คำสั่งที่ใช้บ่อย

```bash
cd /opt/Informatics-Go-Green

# ดู logs
sudo docker logs -f informatics-go-green-backend-prod
sudo docker logs -f informatics-go-green-frontend-prod
sudo docker logs -f informatics-go-green-db-prod

# Health check
curl http://localhost:9061/api/health

# Restart all
sudo docker compose -f docker-compose.prod.yml restart

# Restart เฉพาะ backend
sudo docker compose -f docker-compose.prod.yml restart backend

# Rebuild frontend (ถ้าแก้โค้ด)
sudo docker compose -f docker-compose.prod.yml build --no-cache frontend
sudo docker compose -f docker-compose.prod.yml up -d frontend

# Deploy อัปเดตใหม่
sudo ./deploy.sh

# Deploy อัปเดตพร้อม backup ก่อน
sudo ./deploy.sh --backup

# Backup database (manual)
sudo ./backup.sh

# Stop all
sudo docker compose -f docker-compose.prod.yml down

# Start all
sudo docker compose -f docker-compose.prod.yml up -d
```

---

## ❓ ถ้ามีปัญหา

| ปัญหา | วิธีแก้ |
|-------|---------|
| เว็บไม่ขึ้น | `sudo docker logs informatics-go-green-frontend-prod` |
| API ไม่ตอบ | `sudo docker logs informatics-go-green-backend-prod` |
| Health check ไม่ตอบ | ตรวจสอบว่า backend container running: `sudo docker ps` |
| อัพโหลดไม่ได้ | `sudo docker exec informatics-go-green-backend-prod ls -la /app/uploads/` |
| Google Login ไม่ทำงาน | ตรวจสอบ `GOOGLE_CLIENT_ID` ใน `.env` แล้ว restart backend |
| Database เต็ม | ตรวจสอบ disk space: `df -h` |
| Memory ไม่พอ build | เพิ่ม Swap (ดูขั้นตอนที่ 1.2) |
| Migration ล้มเหลว | `sudo docker logs informatics-go-green-backend-prod` ดู error |

---

## 📋 Checklist ก่อนเปิดใช้งาน

- [ ] Docker และ Docker Compose ติดตั้งสำเร็จ
- [ ] Nginx ติดตั้งสำเร็จ
- [ ] Swap เพิ่มเรียบร้อย (ถ้า RAM น้อย)
- [ ] Clone โปรเจคสำเร็จ (branch: `develop`)
- [ ] ไฟล์ `.env` ตั้งค่าถูกต้อง (เปลี่ยนรหัสผ่านแล้ว)
- [ ] `POSTGRES_PASSWORD` เปลี่ยนจากค่าเริ่มต้น
- [ ] `JWT_SECRET` ตั้งค่าเป็น random string ยาว 64+ ตัว
- [ ] Nginx config ตั้งค่าถูกต้อง
- [ ] Domain ชี้มาที่เซิร์ฟเวอร์ถูกต้อง
- [ ] Containers รันทั้ง 3 ตัว (`docker ps`)
- [ ] Health check ตอบกลับ (`curl localhost:9061/api/health`)
- [ ] Seed ข้อมูลพื้นฐานสำเร็จ
- [ ] Admin user สร้างสำเร็จ
- [ ] ทดสอบ login ได้
- [ ] ทดสอบ login แล้วเปลี่ยนรหัส admin
- [ ] ทดสอบอัพโหลดรูปได้
- [ ] ทดสอบสร้างข้อมูลขยะได้
- [ ] Google OAuth ตั้งค่าเสร็จ (ถ้าใช้)
- [ ] SSL Certificate ติดตั้ง (ถ้าใช้ HTTPS)
- [ ] Cron backup ทำงาน (ถ้าตั้ง)

---

## 🌐 URLs

| ระบบ | URL |
|------|-----|
| เว็บไซต์ | https://if-go-green.informatics.buu.ac.th |
| API | https://if-go-green.informatics.buu.ac.th/api/ |
| Health Check | https://if-go-green.informatics.buu.ac.th/api/health |
| Login | https://if-go-green.informatics.buu.ac.th/auth/login |
| Admin | https://if-go-green.informatics.buu.ac.th/admin |

---

## 📞 ข้อมูลโปรเจค

- **GitHub**: https://github.com/Chaimanat2546/Informatics-Go-Green
- **Branch**: `develop`
- **Docker Compose**: `docker-compose.prod.yml`
- **Database**: PostgreSQL 16 (migrations รันอัตโนมัติ)
- **Backend**: NestJS (Port 9061)
- **Frontend**: Next.js (Port 9060)

---

จัดทำโดย: Informatics Go Green Team  
อัปเดตล่าสุด: 25 มีนาคม 2026  
สำหรับ: คณะวิทยาการสารสนเทศ มหาวิทยาลัยบูรพา
