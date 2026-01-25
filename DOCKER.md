# 🐳 Docker Guide for Informatics Go Green

คู่มือการใช้งาน Docker สำหรับโปรเจคนี้ ครอบคลุมการรันสำหรับ Development, Production และการแก้ไขปัญหาทั่วไป

## 🛠️ Development Mode (แนะนำ)

ใช้ไฟล์ `docker-compose.dev.yml` ซึ่งออกแบบมาเพื่อการพัฒนา (Hot Reload + Volume Mounting)

### คำสั่งพื้นฐาน

```bash
# 1. Start Containers (ครั้งแรก หรือเมื่อมีการแก้ package.json ให้เพิ่ม --build)
docker-compose -f docker-compose.dev.yml up --build -d

# 2. Start Containers (ปกติ)
docker-compose -f docker-compose.dev.yml up -d

# 3. Stop Containers
docker-compose -f docker-compose.dev.yml down

# 4. View Logs (Real-time)
docker-compose -f docker-compose.dev.yml logs -f

# 5. Restart Backend (เช่น เมื่อแก้ไฟล์ .env หรือ code backend ค้าง)
docker-compose -f docker-compose.dev.yml restart backend
```

### การเชื่อมต่อ Database

```bash
docker-compose -f docker-compose.dev.yml exec postgres psql -U postgres -d informatics_go_green
```

---

## 🚢 Production Mode

ใช้ไฟล์ `docker-compose.yml` สำหรับการ Test เสมือนจริง หรือ Deploy (ไม่มี Hot Reload)

```bash
docker-compose up --build -d
```

---

## ⚠️ Troubleshooting (ปัญหาที่พบบ่อย)

### 1. `bcrypt` / `bcryptjs` Error (Exec format error)
**อาการ**: Container Backend รันไม่ขึ้น มี error เกี่ยวกับ `bcrypt_lib.node`
**สาเหตุ**: `bcrypt` ที่ compile บน Windows ไม่สามารถรันบน Linux Container ได้
**วิธีแกั**:
- เราได้เปลี่ยนมาใช้ `bcryptjs` (pure JS) แทน `bcrypt` แล้ว
- หากยังเจอ ให้ลองลบ `node_modules` และ `package-lock.json` ในเครื่อง local แล้วรัน `npm install` ใหม่ (ถ้า environment local ไม่ตรง) **แต่ดีที่สุดคือรันผ่าน Docker**
- สั่ง rebuild: `docker-compose -f docker-compose.dev.yml up --build -d backend`

### 2. Dependency Conflict (`npm ci` failed)
**อาการ**: Build Docker ไม่ผ่าน ขึ้น error ERESOLVE เกี่ยวกับ dependency conflicts
**วิธีแก้**:
- ใน `Dockerfile.dev` เราใช้ `npm install --legacy-peer-deps` แทน `npm ci` แล้วเพื่อป้องกันปัญหานี้
- ถ้าแก้ไข `package.json` แล้ว build ไม่ผ่าน ให้เช็ค version ของ library ที่เพิ่มเข้าไป

### 3. Hot Reload ไม่ทำงาน
**สาเหตุ**: Volume mounting อาจมีปัญหาใน Windows (Docker Desktop)
**วิธีเช็ค**:
- ตรวจสอบว่าใน `docker-compose.dev.yml` มีการ mount volumes ถูกต้อง:
  ```yaml
  volumes:
    - ./backend/src:/app/src:ro  # Backend
    - ./frontend/app:/app/app:ro # Frontend
  ```
- ถ้ายังไม่ได้ ให้ลอง restart Docker Desktop

### 4. Database Connection Refused
**สาเหตุ**: Container `postgres` ยังไม่พร้อมใช้งานตอนที่ backend พยายาม connect (แม้จะมี depends_on)
**วิธีแก้**:
- ระบบมี Healthcheck configured แล้ว แต่ถ้ารอนานผิดปกติ ให้: `docker-compose -f docker-compose.dev.yml restart backend`

---

## ⚙️ Docker Configuration Files

- **`docker-compose.dev.yml`**: ไฟล์หลักสำหรับ Dev มีการ mount source code และใช้ `Dockerfile.dev`
- **`backend/Dockerfile.dev`**: ใช้ Image `node:20-alpine`, ติดตั้ง dependencies และรัน `npm run start:dev`
- **`frontend/Dockerfile.dev`**: ใช้ Image `node:20-alpine`, ติดตั้ง dependencies และรัน `npm run dev`
