# 🌿 Informatics Go Green

Web Application สำหรับโครงการ Informatics Go Green พัฒนาด้วย Next.js และ NestJS ภายใต้สถาปัตยกรรม Microservices-ready ด้วย Docker Container

## 📋 Technology Stack

- **Frontend**: Next.js 14+ (App Directory), TypeScript, TailwindCSS (optional)
- **Backend**: NestJS, TypeORM, TypeScript
- **Database**: PostgreSQL 16
- **Infrastructure**: Docker & Docker Compose
- **Authentication**: JWT, Google OAuth

---

## 🚀 Quick Start (สำหรับ Developer)

วิธีที่ง่ายที่สุดในการรันโปรเจคคือการใช้ Docker Compose ในโหมด Development:

1. **Clone & Setup Env**:
   ```bash
   git clone https://github.com/Chaimanat2546/Informatics-Go-Green.git
   cd Informatics-Go-Green
   cp .env.example .env
   ```
   > 📝 **Note**: ถ้าต้องการใช้ Social Login (Google) ให้แก้ไขค่า `GOOGLE_CLIENT_ID` และ `GOOGLE_CLIENT_SECRET` ในไฟล์ `.env`

2. **Run with Docker (Dev Mode)**:
   ```bash
   docker-compose -f docker-compose.dev.yml up --build -d
   ```

3. **Access Application**:
   - 🏠 Frontend: http://localhost:3000
   - 🔌 Backend API: http://localhost:3001/api
   - 👤 Login Page: http://localhost:3000/auth/login

---

## 🔑 Authentication System

ระบบ Login รองรับ:
1. **Local Login**: Email + Password (สมัครสมาชิกได้ที่ `/auth/register`)
2. **Google OAuth**: Login ผ่าน Google Account
3. **Password Reset**: รองรับการขอเปลี่ยนรหัสผ่านผ่าน Email (จำลองด้วย Nodemailer)

---

## 📁 Project Structure

```
Informatics-Go-Green/
├── backend/                # NestJS Backend API
│   ├── src/auth/           # Authentication Module (JWT, OAuth)
│   ├── src/users/          # Users Module
│   └── Dockerfile.dev      # Dockerfile for Development
├── frontend/               # Next.js Frontend
│   ├── app/auth/           # Auth Pages (Login, Register, Dashboard)
│   └── Dockerfile.dev      # Dockerfile for Development
├── docker-compose.dev.yml  # Docker Compose for Development (Recommended)
├── docker-compose.yml      # Docker Compose for Production
└── .env.example            # Environment Variables Template
```

## 📚 Documentation

- [📖 Docker Guide](DOCKER.md) - คู่มือการใช้ Docker ขั้นสูงและการแก้ปัญหา
- [💻 Developer Guide](DEVELOPER_GUIDE.md) - คู่มือการพัฒนา, Git Workflow, และ Coding Standards
