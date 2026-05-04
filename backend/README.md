# 🔧 Backend API (NestJS)

ระบบให้บริการข้อมูล (API) สำหรับโปรเจกต์ **Informatics Go Green** พัฒนาด้วย NestJS พร้อมสถาปัตยกรรมที่รองรับการปรับขยายและมีความปลอดภัยสูง

---

## 🛠 Tech Stack & Tools

- **Framework:** NestJS 11
- **Database:** PostgreSQL 16
- **ORM:** TypeORM
- **Auth:** JWT (Passport.js) & Google OAuth 2.0
- **Validation:** Class-validator & Class-transformer
- **Email:** Nodemailer (SMTP)
- **File Upload:** Multer (Optimized for Base64 storage)

---

## 🚀 คำสั่งที่ใช้บ่อย (Available Scripts)

| คำสั่ง | รายละเอียด |
|--------|-------------|
| `npm run start:dev` | เริ่มระบบพัฒนา (Watch Mode) |
| `npm run build` | คอมไพล์โค้ดเป็น JavaScript |
| `npm run start:prod` | เริ่มระบบ Production (หลัง Build) |
| `npm run lint` | ตรวจสอบคุณภาพโค้ด (Linting) |
| `npm run db:seed` | นำเข้าข้อมูลเริ่มต้น (Seeding) |
| `npm run migration:run` | รัน Migration เพื่ออัปเดตตารางฐานข้อมูล |

---

## 🔌 API Endpoints (ย่อ)

### **Authentication**
- `POST /auth/login` - เข้าสู่ระบบ
- `POST /auth/register` - สมัครสมาชิก
- `GET /auth/me` - ดึงข้อมูลโปรไฟล์ผู้ใช้ปัจจุบัน
- `PATCH /auth/profile` - อัปเดตข้อมูลโปรไฟล์

### **Waste Management**
- `GET /waste` - ดึงรายการขยะทั้งหมด
- `GET /waste/barcode/:code` - ค้นหาขยะด้วยบาร์โค้ด
- `POST /waste-history` - บันทึกประวัติการคัดแยกขยะ

### **Admin Services**
- `GET /admin/users` - รายชื่อสมาชิกทั้งหมด (Admin Only)
- `POST /waste-material` - เพิ่มประเภทวัสดุขยะ

---

## 🐳 Docker Deployment

แอปพลิเคชันนี้รองรับการรันผ่าน Docker ในสองรูปแบบ:

1. **Development:** ใช้ `Dockerfile.dev` (Hot Reload)
2. **Production:** ใช้ `Dockerfile.prod` (Multi-stage Build & Non-root security)

---

## 🗄️ โครงสร้างโฟลเดอร์

```text
src/
├── 📂 admin/       # โมดูลจัดการหลังบ้าน
├── 📂 auth/        # ระบบยืนยันตัวตนและความปลอดภัย
├── 📂 common/      # ฟิลเตอร์, อินเตอร์เซปเตอร์ที่ใช้ร่วมกัน
├── 📂 database/    # ไฟล์ Seeder และ Migration
├── 📂 scheduler/   # ระบบทำงานเบื้องหลัง (Background Tasks)
├── 📂 users/       # โมดูลจัดการข้อมูลผู้ใช้
└── 📂 waste/       # โมดูลจัดการข้อมูลขยะและ Carbon Footprint
```

---

<p align="center">
  <a href="../README.md">กลับสู่หน้าหลัก</a>
</p>
