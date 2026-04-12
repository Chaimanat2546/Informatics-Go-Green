# 🌿 Informatics Go Green

ระบบ Web Application สำหรับโครงการ Informatics Go Green พัฒนาด้วยสถาปัตยกรรม Full-Stack Modern บน Docker Container

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Authentication](#-authentication)
- [Documentation](#-documentation)
- [Contributing](#-contributing)

---

## 🎯 Overview

**Informatics Go Green** เป็นโปรเจคเว็บแอปพลิเคชันที่พัฒนาขึ้นเพื่อสนับสนุนการดำเนินงานด้านสิ่งแวดล้อม โดยใช้เทคโนโลยีสมัยใหม่และมีโครงสร้างที่พร้อมขยายเป็น Microservices

### Key Features

| Feature | Description |
|---------|-------------|
| 🔐 Authentication | รองรับ Local Login, Google OAuth, Password Reset |
| 👤 User Management | ระบบจัดการผู้ใช้งานแบบครบวงจร |
| 🐳 Docker Ready | พร้อม Deploy ทั้ง Development และ Production |
| ⚡ Hot Reload | รองรับ Live reload ระหว่าง Development |

---

## 🛠 Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| **Frontend** | Next.js (App Router) | 14+ |
| **Backend** | NestJS | 10+ |
| **Database** | PostgreSQL | 16 |
| **ORM** | TypeORM | 0.3+ |
| **Language** | TypeScript | 5+ |
| **Container** | Docker & Docker Compose | Latest |
| **Auth** | JWT, Passport.js, OAuth 2.0 | - |

---

## 📦 Prerequisites

ก่อนเริ่มต้นพัฒนา ตรวจสอบว่าเครื่องมีโปรแกรมต่อไปนี้:

| Software | Version | Download |
|----------|---------|----------|
| **Docker Desktop** | Latest | [docker.com](https://www.docker.com/products/docker-desktop/) |
| **Git** | 2.40+ | [git-scm.com](https://git-scm.com/) |
| **Node.js** (optional) | 20+ | [nodejs.org](https://nodejs.org/) |
| **VS Code** (recommended) | Latest | [code.visualstudio.com](https://code.visualstudio.com/) |

> **Note**: Node.js จำเป็นเฉพาะกรณีที่ต้อง run บน Local โดยไม่ใช้ Docker

---

## 🚀 Quick Start

### Option 1: Docker (แนะนำ)

```bash
# 1. Clone repository
git clone https://github.com/Chaimanat2546/Informatics-Go-Green.git
cd Informatics-Go-Green

# 2. Setup environment
cp .env.example .env

# 3. Start development containers
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d

# 4. (Optional) Start with Hot Reload Watch Mode
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build --watch
```

### Option 2: Local Development (ไม่ใช้ Docker)

```bash
# 1. Clone & Setup
git clone https://github.com/Chaimanat2546/Informatics-Go-Green.git
cd Informatics-Go-Green
cp .env.example .env

# 2. Start PostgreSQL (ต้องมี PostgreSQL ติดตั้งอยู่)
# หรือใช้ Docker สำหรับ Database เท่านั้น:
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d postgres

# 3. Install & Run Backend
cd backend
npm install --legacy-peer-deps
npm run start:dev

# 4. Install & Run Frontend (new terminal)
cd frontend
npm install
npm run dev
```

### Access Application

| Service | URL | Description |
|---------|-----|-------------|
| 🏠 Frontend | http://localhost:3000 | Next.js Application |
| 🔌 Backend API | http://localhost:3001/api | NestJS REST API |
| 🗄️ Database | localhost:5432 | PostgreSQL |

---

## 📁 Project Structure

```
Informatics-Go-Green/
├── 📂 backend/                  # NestJS Backend
│   ├── src/
│   │   ├── auth/               # Authentication Module
│   │   ├── users/              # User Management Module
│   │   ├── app.module.ts       # Root Module
│   │   └── main.ts             # Entry Point
│   ├── Dockerfile.dev          # Dev Dockerfile
│   └── Dockerfile.prod         # Production Dockerfile
│
├── 📂 frontend/                 # Next.js Frontend
│   ├── app/
│   │   ├── auth/               # Auth Pages
│   │   ├── layout.tsx          # Root Layout
│   │   └── page.tsx            # Home Page
│   ├── Dockerfile.dev          # Dev Dockerfile
│   └── Dockerfile.prod         # Production Dockerfile
│
├── 📄 docker-compose.dev.yml   # Development Compose
├── 📄 docker-compose.prod.yml  # Production Compose
├── 📄 .env.example             # Environment Template
├── 📄 DOCKER.md                # Docker Guide
└── 📄 DEVELOPER_GUIDE.md       # Developer Guide
```

---

## 🔑 Authentication

ระบบรองรับการ Authentication หลายรูปแบบ:

| Method | Endpoint | Description |
|--------|----------|-------------|
| **Local Register** | `/auth/register` | สมัครสมาชิกด้วย Email/Password |
| **Local Login** | `/auth/login` | เข้าสู่ระบบด้วย Email/Password |
| **Google OAuth** | `/auth/google` | เข้าสู่ระบบผ่าน Google Account |
| **Password Reset** | `/auth/forgot-password` | ขอ Reset Password ผ่าน Email |

> **Setup OAuth**: แก้ไข `GOOGLE_CLIENT_ID` และ `GOOGLE_CLIENT_SECRET` ในไฟล์ `.env`

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [📖 DOCKER.md](DOCKER.md) | คู่มือการใช้งาน Docker, Commands, Troubleshooting |
| [💻 DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) | คู่มือการพัฒนา, Git Workflow, Coding Standards |
| [🔧 backend/README.md](backend/README.md) | เอกสาร Backend API |
| [🎨 frontend/README.md](frontend/README.md) | เอกสาร Frontend Application |

---

## 🤝 Contributing

### Git Branch Convention

| Type | Format | Example |
|------|--------|---------|
| Feature | `feature/<name>` | `feature/user-profile` |
| Bugfix | `fix/<name>` | `fix/login-error` |
| Hotfix | `hotfix/<name>` | `hotfix/security-patch` |

### Commit Message Format

```
type(scope): subject

# Examples:
feat(auth): add Google OAuth login
fix(user): resolve password reset issue
docs: update README with Docker guide
```

---

<p align="center">
  <strong>Informatics Go Green</strong> — Built with ❤️ by the Team
</p>
