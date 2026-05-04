# 🌿 Informatics Go Green

**Informatics Go Green** เป็นระบบ Web Application แบบ Full-stack Modern ที่พัฒนาขึ้นเพื่อสนับสนุนการจัดการสิ่งแวดล้อมภายในคณะเทคโนโลยีสารสนเทศ มหาวิทยาลัยบูรพา โดยเน้นการติดตามการคัดแยกขยะและการคำนวณ Carbon Footprint

---

## 🚀 ทางลัดสำหรับการใช้งาน (Quick Start)

### การพัฒนาบนเครื่อง Local (Docker)
```bash
cp .env.example .env
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

### การ Deploy บนเครื่องมหาวิทยาลัย (PREPRO)
```bash
git checkout deploy/prepro
git pull origin deploy/prepro
cp .env.prepro .env
docker compose -f docker-compose.yml -f docker-compose.prepro.yml up --build -d
```

---

## 🛠 เทคโนโลยีที่ใช้ (Tech Stack)

### **Frontend**
- **Framework:** [Next.js 15 (App Router)](https://nextjs.org/)
- **Styling:** Tailwind CSS & shadcn/ui
- **Icons:** Lucide React & Tabler Icons
- **State Management:** React Hooks & LocalStorage

### **Backend**
- **Framework:** [NestJS 11](https://nestjs.com/)
- **Language:** TypeScript
- **Database:** PostgreSQL 16
- **ORM:** TypeORM
- **Authentication:** Passport.js (JWT & Google OAuth 2.0)

### **Infrastructure**
- **Containerization:** Docker & Docker Compose
- **Deployment:** Nginx Proxy (Subpath Deployment)

---

## 📂 โครงสร้างโปรเจกต์ (Project Structure)

```text
Informatics-Go-Green/
├── 📂 backend/           # ระบบ API (NestJS)
├── 📂 frontend/          # ระบบ UI (Next.js)
├── 📂 deployment/        # ไฟล์คอนฟิกสำหรับการ Deploy (Nginx)
├── 📄 docker-compose.yml  # คอนฟิกหลักของ Docker
├── 📄 .env.prepro        # ค่าตัวแปรสภาพแวดล้อมสำหรับเซิร์ฟเวอร์มหาวิทยาลัย
└── 📄 DEPLOY_PREPRO.md   # คู่มือการ Deploy บนระบบมหาวิทยาลัยอย่างละเอียด
```

---

## ✨ ฟีเจอร์หลัก (Key Features)

- 🔐 **ระบบสมาชิก:** สมัครสมาชิก, เข้าสู่ระบบปกติ และ Google Login
- 👤 **โปรไฟล์ผู้ใช้:** จัดการข้อมูลส่วนตัวและรูปถ่าย (Base64 Optimized)
- ♻️ **ระบบจัดการขยะ:** สแกนบาร์โค้ดขยะ, บันทึกการคัดแยกวัสดุ
- 🌳 **Carbon Footprint:** คำนวณการลดก๊าซเรือนกระจกและแสดงสถิติแบบ Real-time
- 🛡️ **ระบบ Admin:** จัดการผู้ใช้งาน, จัดการข้อมูลวัสดุขยะ และค่า Emission Factors

---

## 📖 เอกสารเพิ่มเติม (Documentation)

- [💻 คู่มือการพัฒนา (DEVELOPER_GUIDE.md)](DEVELOPER_GUIDE.md)
- [🐳 คู่มือ Docker (DOCKER.md)](DOCKER.md)
- [🚀 คู่มือการ Deploy บน PREPRO (DEPLOY_PREPRO.md)](DEPLOY_PREPRO.md)
- [🔧 Backend API Docs (backend/README.md)](backend/README.md)
- [🎨 Frontend Docs (frontend/README.md)](frontend/README.md)

---

<p align="center">
  พัฒนาโดยทีม <strong>Informatics Go Green</strong> มหาวิทยาลัยบูรพา
</p>
