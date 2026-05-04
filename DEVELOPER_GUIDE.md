# 💻 Developer Guide

คู่มือสำหรับ Developer ในการร่วมพัฒนาโปรเจค Informatics Go Green

---

## 📋 Table of Contents

- [Onboarding Checklist](#-onboarding-checklist)
- [Architecture Overview](#-architecture-overview)
- [Folder Structure](#-folder-structure)
- [Development Workflow](#-development-workflow)
- [Coding Standards](#-coding-standards)
- [Git Conventions](#-git-conventions)
- [Testing Guidelines](#-testing-guidelines)
- [API Documentation](#-api-documentation)

---

## ✅ Onboarding Checklist

สำหรับ Developer ที่เข้าร่วมโปรเจคใหม่:

- [ ] Clone repository และ setup environment
- [ ] อ่าน README.md และ DOCKER.md
- [ ] ติดตั้ง Docker Desktop
- [ ] รัน `docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d`
- [ ] ทดสอบเข้า http://localhost:3000 และ http://localhost:3001/api
- [ ] ติดตั้ง VS Code Extensions (ESLint, Prettier, Docker)
- [ ] ทำความเข้าใจ folder structure
- [ ] อ่าน Coding Standards ในเอกสารนี้

---

## 🏗 Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                         Client (Browser)                          │
└───────────────────────────────┬──────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js 14+)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐               │
│  │ App Router  │  │ Server      │  │ Client      │               │
│  │ (pages)     │  │ Components  │  │ Components  │               │
│  └─────────────┘  └─────────────┘  └─────────────┘               │
└───────────────────────────────┬──────────────────────────────────┘
                                │ REST API
                                ▼
┌──────────────────────────────────────────────────────────────────┐
│                     Backend (NestJS 10+)                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐               │
│  │ Controllers │  │ Services    │  │ Guards      │               │
│  │ (routes)    │  │ (logic)     │  │ (auth)      │               │
│  └─────────────┘  └─────────────┘  └─────────────┘               │
│  ┌─────────────┐  ┌─────────────┐                                │
│  │ DTOs        │  │ Entities    │                                │
│  │ (validation)│  │ (database)  │                                │
│  └─────────────┘  └─────────────┘                                │
└───────────────────────────────┬──────────────────────────────────┘
                                │ TypeORM
                                ▼
┌──────────────────────────────────────────────────────────────────┐
│                     PostgreSQL Database                           │
└──────────────────────────────────────────────────────────────────┘
```

---

## 📁 Folder Structure

### Backend (`/backend`)

```
backend/
├── src/
│   ├── auth/                   # Authentication Module
│   │   ├── dto/               # Data Transfer Objects
│   │   ├── guards/            # JWT & OAuth Guards
│   │   ├── strategies/        # Passport Strategies
│   │   ├── auth.controller.ts # Routes
│   │   ├── auth.service.ts    # Business Logic
│   │   └── auth.module.ts     # Module Definition
│   │
│   ├── users/                  # User Management Module
│   │   ├── entities/          # TypeORM Entities
│   │   ├── users.service.ts   # User Operations
│   │   └── users.module.ts    # Module Definition
│   │
│   ├── app.module.ts          # Root Module
│   ├── app.controller.ts      # Health Check
│   └── main.ts                # Entry Point (Bootstrap)
│
├── test/                       # E2E Tests
├── Dockerfile.dev             # Development Image
└── Dockerfile.prod            # Production Image
```

### Frontend (`/frontend`)

```
frontend/
├── app/                        # Next.js App Router
│   ├── auth/                  # Auth Pages
│   │   ├── login/            # Login Page
│   │   ├── register/         # Register Page
│   │   └── dashboard/        # User Dashboard
│   │
│   ├── layout.tsx             # Root Layout
│   ├── page.tsx               # Home Page
│   └── globals.css            # Global Styles
│
├── public/                     # Static Assets
├── Dockerfile.dev             # Development Image
└── Dockerfile.prod            # Production Image
```

---

## 🔄 Development Workflow

### 1. Starting New Work

```bash
# 1. Pull latest changes
git checkout develop
git pull origin develop

# 2. Create feature branch
git checkout -b feature/your-feature-name

# 3. Start development environment
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build --watch
```

### 2. Adding Dependencies

| Action | Command |
|--------|---------|
| **Frontend** | `cd frontend && npm install <package>` |
| **Backend** | `cd backend && npm install <package>` |
| **Rebuild Container** | `docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d <service>` |

> **Note**: หลังเพิ่ม dependency ต้อง rebuild container ด้วย `--build`

### 3. Database Changes

- TypeORM ตั้งค่า `synchronize: true` สำหรับ Development
- เมื่อแก้ไข Entity, database schema จะ update อัตโนมัติ
- **Production**: ใช้ migrations แทน (จะ implement เพิ่มเติม)

---

## 📝 Coding Standards

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Variables/Functions | `camelCase` | `getUserById`, `isActive` |
| Classes/Interfaces | `PascalCase` | `UserService`, `AuthGuard` |
| Files | `kebab-case` | `user.service.ts`, `auth-guard.ts` |
| Database Tables | `snake_case` | `user_profiles` |
| Constants | `SCREAMING_SNAKE_CASE` | `MAX_RETRIES` |

### Backend Best Practices

| Rule | Description |
|------|-------------|
| **Use DTOs** | สร้าง DTO สำหรับทุก API ที่รับข้อมูล พร้อม `class-validator` |
| **Lint Check** | รัน `npm run lint` ก่อน Commit เสมอ (ห้ามมี unused imports/vars) |
| **Async/Await** | ใช้ `async/await` แทน Promise chains และต้องมี `void` หากไม่ต้องการ await |
| **No Hardcode** | ใช้ `ConfigService` ดึงค่าจาก `.env` เสมอ |

### Frontend Best Practices

| Rule | Description |
|------|-------------|
| **Server Components** | ใช้เป็น default, เติม `'use client'` เฉพาะเมื่อจำเป็น |
| **JSX Entities** | หลีกเลี่ยงเครื่องหมาย " หรือ ' ตรงๆ ใน JSX ให้ใช้ `&quot;` หรือ `&apos;` แทน |
| **Type Safety** | ใช้ TypeScript interfaces สำหรับ props และ API responses |
| **API Calls** | Centralize API calls ในโฟลเดอร์ `lib/` หรือ `services/` |

---

## 🔀 Git Conventions

### Branch Naming

| Type | Format | Example |
|------|--------|---------|
| Feature | `feature/<name>` | `feature/user-profile` |
| Bugfix | `fix/<name>` | `fix/login-error` |
| Hotfix | `hotfix/<name>` | `hotfix/security-patch` |
| Documentation | `docs/<name>` | `docs/api-guide` |

### Commit Message Format

```
type(scope): subject

# Types:
# feat     - New feature
# fix      - Bug fix
# docs     - Documentation only
# style    - Formatting, no code change
# refactor - Code restructure, no feature change
# test     - Adding tests
# chore    - Build process, tools
```

### Examples

```bash
feat(auth): add Google OAuth login
fix(user): resolve password reset token expiry
docs: update README with Docker instructions
refactor(api): extract validation to middleware
test(auth): add unit tests for JWT service
```

### Pull Request Flow

```
feature/xxx ──▶ develop ──▶ main
                  │
              PR Review
                  │
              Merge after approval
```

---

## 🧪 Testing Guidelines

### Backend Tests

```bash
# Run all tests
cd backend
npm run test

# Run specific test file
npm run test -- auth.service.spec.ts

# Run e2e tests
npm run test:e2e

# Generate coverage report
npm run test:cov
```

### Test Structure

```
backend/
├── src/
│   └── auth/
│       ├── auth.service.ts
│       └── auth.service.spec.ts    # Unit test
└── test/
    └── app.e2e-spec.ts              # E2E test
```

---

## 📖 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login with email/password |
| `GET` | `/api/auth/google` | Initiate Google OAuth |
| `GET` | `/api/auth/google/callback` | Google OAuth callback |
| `POST` | `/api/auth/forgot-password` | Request password reset |
| `POST` | `/api/auth/reset-password` | Reset password with token |
| `GET` | `/api/auth/profile` | Get current user profile |

### Request/Response Examples

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "name": "John Doe"
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123"
}

Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

<p align="center">
  Questions? Open an issue or contact the team.
</p>
