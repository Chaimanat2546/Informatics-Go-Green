# 🎓 Informatics Go Green - BUU Configuration

สำหรับ: มหาวิทยาลัยบูรพา (Burapha University)  
Domain: `if-go-green.informatics.buu.ac.th`  
Ports: Web (9060), API (9061)

---

## 📦 ไฟล์ในแพ็คเกจนี้

| ไฟล์ | รายละเอียด |
|------|-----------|
| `.env.production` | Environment variables config |
| `nginx-buu.conf` | Nginx config สำหรับมหาลัย |
| `README.md` | คู่มือนี้ |

---

## 🚀 ขั้นตอนการ Deploy (Manual)

### 1. ติดตั้ง Docker และ Docker Compose

```bash
sudo apt update
sudo apt install -y docker.io docker-compose-v2 git
sudo systemctl enable docker
sudo systemctl start docker
```

### 2. Clone โปรเจค

```bash
cd /opt
sudo git clone https://github.com/Chaimanat2546/Informatics-Go-Green.git
cd Informatics-Go-Green
sudo git checkout develop
```

### 3. ตั้งค่า Environment

```bash
# คัดลอกไฟล์ config ที่ให้ไป
sudo cp /path/to/.env.production /opt/Informatics-Go-Green/.env

# แก้ไขค่าที่จำเป็น
sudo nano /opt/Informatics-Go-Green/.env
```

**ต้องเปลี่ยน:**
- `POSTGRES_PASSWORD` → รหัสผ่านที่ปลอดภัย
- `JWT_SECRET` → random string ยาว ๆ
- `GOOGLE_CLIENT_ID` → จาก Google Cloud Console
- `GOOGLE_CLIENT_SECRET` → จาก Google Cloud Console

### 4. ตั้งค่า Nginx

```bash
# คัดลอก config
sudo cp /path/to/nginx-buu.conf /etc/nginx/sites-available/if-go-green

# Enable site
sudo ln -sf /etc/nginx/sites-available/if-go-green /etc/nginx/sites-enabled/

# ลบ default ถ้ามี
sudo rm -f /etc/nginx/sites-enabled/default

# Test config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 5. Build และรัน Docker

```bash
cd /opt/Informatics-Go-Green

# Build และรัน
sudo docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d

# รอให้พร้อม (ประมาณ 30-60 วินาที)
sleep 30

# ตรวจสอบว่า containers รันสำเร็จ
sudo docker ps -a
```

ควรเห็น 3 containers:
- `informatics-go-green-db-prod` ✅
- `informatics-go-green-backend-prod` ✅  
- `informatics-go-green-frontend-prod` ✅

### 6. สร้าง Admin User

```bash
# เข้าไปใน PostgreSQL container
sudo docker exec -it informatics-go-green-db-prod psql -U goapp -d informatics_go_green
```

รัน SQL:
```sql
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

-- ออก
\q
```

### 7. ตั้งค่า Google OAuth (ถ้าใช้)

ดูคู่มือเพิ่มเติมที่ด้านล่าง

---

## 🔧 ตั้งค่า Google OAuth

### ขั้นตอน

1. ไปที่ https://console.cloud.google.com/apis/credentials
2. สร้างโปรเจคใหม่ → เปิดใช้งาน Google+ API
3. สร้าง **OAuth client ID**
   - Application type: Web application
   - Authorized JavaScript origins: `https://if-go-green.informatics.buu.ac.th`
   - Authorized redirect URIs: `https://if-go-green.informatics.buu.ac.th/api/auth/google/callback`
4. บันทึก **Client ID** และ **Client Secret**
5. ใส่ในไฟล์ `.env`
6. Restart backend:
```bash
sudo docker compose -f /opt/Informatics-Go-Green/docker-compose.yml -f /opt/Informatics-Go-Green/docker-compose.prod.yml restart backend
```

---

## 🔒 ตั้งค่า HTTPS (SSL Certificate)

ถ้าต้องการ HTTPS:

```bash
# ติดตั้ง Certbot
sudo apt install -y certbot python3-certbot-nginx

# ขอ SSL certificate
sudo certbot --nginx -d if-go-green.informatics.buu.ac.th

# ตรวจสอบ auto-renew
sudo systemctl status certbot.timer
```

---

## 🧪 ทดสอบระบบ

### 1. ตรวจสอบ Containers
```bash
sudo docker ps -a
```

### 2. ทดสอบ API
```bash
curl https://if-go-green.informatics.buu.ac.th/api/
curl "https://if-go-green.informatics.buu.ac.th/api/waste/cards-summary?type=daily&date=2026-03-22"
```

### 3. ทดสอบเว็บไซต์
เปิด browser ไปที่: `https://if-go-green.informatics.buu.ac.th`

---

## 👤 ข้อมูล Login เริ่มต้น

| บทบาท | Email | Password |
|-------|-------|----------|
| Admin | admin@buu.ac.th | admin123 |

⚠️ **อย่าลืมเปลี่ยนรหัสผ่านหลังจากเข้าใช้งานครั้งแรก!**

---

## 🐳 คำสั่งที่ใช้บ่อย

```bash
cd /opt/Informatics-Go-Green

# ดู logs
sudo docker logs -f informatics-go-green-backend-prod
sudo docker logs -f informatics-go-green-frontend-prod
sudo docker logs -f informatics-go-green-db-prod

# Restart services
sudo docker compose -f docker-compose.yml -f docker-compose.prod.yml restart

# Restart เฉพาะ backend
sudo docker compose -f docker-compose.yml -f docker-compose.prod.yml restart backend

# Rebuild frontend (ถ้าแก้โค้ด)
sudo docker compose -f docker-compose.yml -f docker-compose.prod.yml build --no-cache frontend
sudo docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d frontend

# ดู status
sudo docker ps -a

# Backup database
sudo docker exec informatics-go-green-db-prod pg_dump -U goapp informatics_go_green > backup-$(date +%Y%m%d).sql

# Stop all
sudo docker compose -f docker-compose.yml -f docker-compose.prod.yml down

# Start all
sudo docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

## 🌐 URLs

| ระบบ | URL |
|------|-----|
| เว็บไซต์ | https://if-go-green.informatics.buu.ac.th |
| API | https://if-go-green.informatics.buu.ac.th/api/ |
| Login | https://if-go-green.informatics.buu.ac.th/auth/login |
| Admin | https://if-go-green.informatics.buu.ac.th/admin |

---

## 🛠️ แก้ไขปัญหา

### 1. เว็บไม่ขึ้น
```bash
# ตรวจสอบ containers
sudo docker ps -a

# ดู logs
sudo docker logs informatics-go-green-frontend-prod

# Restart
sudo docker compose -f docker-compose.yml -f docker-compose.prod.yml restart frontend
```

### 2. API ไม่ตอบสนอง
```bash
sudo docker logs informatics-go-green-backend-prod
sudo docker logs informatics-go-green-db-prod
```

### 3. อัพโหลดรูปไม่ได้
```bash
# เช็ค permission
sudo docker exec informatics-go-green-backend-prod ls -la /app/uploads/

# เช็ค Nginx
curl -I https://if-go-green.informatics.buu.ac.th/uploads/test.jpg
```

### 4. Google Login ไม่ทำงาน
```bash
# เช็ค .env
cat /opt/Informatics-Go-Green/.env | grep GOOGLE

# Restart backend
sudo docker compose -f docker-compose.yml -f docker-compose.prod.yml restart backend
```

### 5. Memory ไม่พอตอน build
```bash
# เพิ่ม Swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## 📋 Checklist ก่อนเปิดใช้งาน

- [ ] Docker และ Docker Compose ติดตั้งสำเร็จ
- [ ] Clone โปรเจคสำเร็จ
- [ ] ไฟล์ `.env` ตั้งค่าถูกต้อง (เปลี่ยนรหัสผ่านแล้ว)
- [ ] Nginx config ตั้งค่าถูกต้อง
- [ ] Domain ชี้มาที่เซิร์ฟเวอร์ถูกต้อง
- [ ] Containers รันทั้งหมด (docker ps)
- [ ] Admin user สร้างสำเร็จ
- [ ] ทดสอบ login ได้
- [ ] ทดสอบอัพโหลดรูปได้
- [ ] ทดสอบสร้างข้อมูลขยะได้
- [ ] Google OAuth ตั้งค่าเสร็จ (ถ้าใช้)
- [ ] SSL Certificate ติดตั้ง (ถ้าใช้ HTTPS)

---

## 📞 ข้อมูลโปรเจค

- **GitHub**: https://github.com/Chaimanat2546/Informatics-Go-Green
- **Branch**: `develop`
- **Docker Compose**: `docker-compose.prod.yml`
- **Database**: PostgreSQL 16
- **Backend**: NestJS (Port 9061)
- **Frontend**: Next.js (Port 9060)

---

จัดทำโดย: Nova (AI Assistant)  
วันที่: 22 มีนาคม 2026  
สำหรับ: คณะวิทยาการสารสนเทศ มหาวิทยาลัยบูรพา
