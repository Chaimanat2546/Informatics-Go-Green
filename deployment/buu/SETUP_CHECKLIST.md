# 🎓 สรุปขั้นตอนให้ทีม IT มหาวิทยาลัยบูรพาทำ

## 📋 ข้อมูลระบบ
- **Domain**: `if-go-green.informatics.buu.ac.th`
- **Web Port**: 9060
- **API Port**: 9061
- **Source**: https://github.com/Chaimanat2546/Informatics-Go-Green (branch: `develop`)

---

## ✅ ขั้นตอนที่ 1: เตรียมเครื่อง Server

```bash
# 1.1 ติดตั้ง Docker และ Docker Compose
sudo apt update
sudo apt install -y docker.io docker-compose-v2 git
sudo systemctl enable docker
sudo systemctl start docker

# 1.2 Clone โปรเจค
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
POSTGRES_PASSWORD=[ตั้งรหัสผ่านเอง]
POSTGRES_DB=informatics_go_green

# Backend
API_URL=https://if-go-green.informatics.buu.ac.th/api
FRONTEND_URL=https://if-go-green.informatics.buu.ac.th
JWT_SECRET=[ตั้งรหัสยาวๆ เอง]
JWT_EXPIRES_IN_SECONDS=604800

# Frontend
NEXT_PUBLIC_API_URL=https://if-go-green.informatics.buu.ac.th/api

# Google OAuth (ถ้าใช้)
GOOGLE_CLIENT_ID=[ไปเอาจาก Google Cloud Console]
GOOGLE_CLIENT_SECRET=[ไปเอาจาก Google Cloud Console]
GOOGLE_CALLBACK_URL=https://if-go-green.informatics.buu.ac.th/api/auth/google/callback

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=[อีเมลมหาลัย]
SMTP_PASS=[app password]
```

⚠️ **ต้องเปลี่ยน:**
- `POSTGRES_PASSWORD` → รหัสผ่านที่ปลอดภัย
- `JWT_SECRET` → random string ยาว 32+ ตัวอักษร
- `GOOGLE_CLIENT_ID/SECRET` → ถ้าใช้ Google Login

---

## ✅ ขั้นตอนที่ 3: ตั้งค่า Nginx

```bash
# 3.1 สร้างไฟล์ config
sudo nano /etc/nginx/sites-available/if-go-green
```

**เนื้อหาไฟล์:**

```nginx
server {
    listen 80;
    server_name if-go-green.informatics.buu.ac.th;

    # Frontend (Port 9060)
    location / {
        proxy_pass http://localhost:9060;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API (Port 9061)
    location /api/ {
        proxy_pass http://localhost:9061/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 10M;
    }

    # Uploads
    location /uploads/ {
        proxy_pass http://localhost:9061/uploads/;
        client_max_body_size 10M;
    }

    # /api/uploads/ → rewrite
    location /api/uploads/ {
        rewrite ^/api/uploads/(.*)$ /uploads/$1 break;
        proxy_pass http://localhost:9061/;
        client_max_body_size 10M;
    }
}
```

```bash
# 3.2 Enable config
sudo ln -sf /etc/nginx/sites-available/if-go-green /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

---

## ✅ ขั้นตอนที่ 4: Build และรัน Docker

```bash
cd /opt/Informatics-Go-Green

# 4.1 Build และรัน containers
sudo docker compose -f docker-compose.prod.yml up --build -d

# 4.2 รอให้พร้อม
sleep 30

# 4.3 ตรวจสอบว่ารันสำเร็จ
sudo docker ps -a
```

ควรเห็น 3 containers:
- `informatics-go-green-db-prod` ✅
- `informatics-go-green-backend-prod` ✅
- `informatics-go-green-frontend-prod` ✅

---

## ✅ ขั้นตอนที่ 5: สร้าง Admin User

```bash
# เข้าไปใน database
sudo docker exec -it informatics-go-green-db-prod psql -U goapp -d informatics_go_green
```

**รัน SQL:**

```sql
INSERT INTO users (id, email, password, "firstName", "lastName", "phoneNumber", province, role, "isActive", provider, "createdAt", "updatedAt")
VALUES (
  uuid_generate_v4(),
  'admin@buu.ac.th',
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

---

## ✅ ขั้นตอนที่ 6: ตั้งค่า Google OAuth (ถ้าใช้)

1. ไปที่ https://console.cloud.google.com/apis/credentials
2. สร้างโปรเจค → เปิดใช้งาน Google+ API
3. สร้าง OAuth client ID:
   - Application type: Web application
   - Authorized JavaScript origins: `https://if-go-green.informatics.buu.ac.th`
   - Authorized redirect URIs: `https://if-go-green.informatics.buu.ac.th/api/auth/google/callback`
4. นำ Client ID และ Secret ใส่ในไฟล์ `.env`
5. Restart backend:
```bash
sudo docker compose -f /opt/Informatics-Go-Green/docker-compose.prod.yml restart backend
```

---

## ✅ ขั้นตอนที่ 7: ตั้งค่า HTTPS (ถ้าต้องการ)

```bash
# ติดตั้ง Certbot
sudo apt install -y certbot python3-certbot-nginx

# ขอ SSL certificate
sudo certbot --nginx -d if-go-green.informatics.buu.ac.th
```

---

## 🧪 ทดสอบระบบ

```bash
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

# Restart
sudo docker compose -f docker-compose.prod.yml restart

# Rebuild frontend
sudo docker compose -f docker-compose.prod.yml build --no-cache frontend
sudo docker compose -f docker-compose.prod.yml up -d frontend

# Stop all
sudo docker compose -f docker-compose.prod.yml down

# Start all
sudo docker compose -f docker-compose.prod.yml up -d
```

---

## ❓ ถ้ามีปัญหา

| ปัญหา | แก้ไข |
|-------|--------|
| เว็บไม่ขึ้น | `sudo docker logs informatics-go-green-frontend-prod` |
| API ไม่ตอบ | `sudo docker logs informatics-go-green-backend-prod` |
| อัพโหลดไม่ได้ | `sudo docker exec informatics-go-green-backend-prod ls -la /app/uploads/` |
| Memory ไม่พอ | เพิ่ม Swap 2GB |

---

**จัดทำโดย:** Nova (AI Assistant)  
**สำหรับ:** คณะวิทยาการสารสนเทศ มหาวิทยาลัยบูรพา
