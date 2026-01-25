# 💻 Developer Guide

คู่มือสำหรับนักพัฒนาในการร่วมโปรเจค Informatics Go Green เพื่อให้โค้ดเป็นไปในทิศทางเดียวกันและง่ายต่อการดูแลรักษา

## 🗂️ Folder Structure

### Backend (`/backend`)
โครงสร้างตามมาตรฐาน NestJS:
- `src/`
  - `auth/`: ระบบ Authentication ทั้งหมด (Controller, Service, Strategies, Guards)
  - `users/`: ระบบจัดการผู้ใช้ (Entity, Service)
  - `main.ts`: Entry point (CORS, Validation Pipe config)
  - `app.module.ts`: Root Module

### Frontend (`/frontend`)
โครงสร้างตามมาตรฐาน Next.js App Router:
- `app/`
  - `auth/`: Authentication Pages (`login`, `register`, `dashboard`)
  - `layout.tsx`: Root Layout
  - `page.tsx`: Home Page
- `public/`: Static files

---

## 🛠️ Development Workflow

### 1. การเริ่มงานใหม่ (New Feature)
1. **Pull latest changes**: `git pull origin develop`
2. **Create Branch**: สร้าง branch ใหม่ตามฟีเจอร์ที่ทำ
   - Feature: `feature/feature-name`
   - Bugfix: `fix/bug-name`
3. **Run Dev Environment**:
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

### 2. การเพิ่ม Dependency ใหม่
เนื่องจากเรารันผ่าน Docker:
1. **Frontend**:
   - `cd frontend`
   - `npm install package-name`
   - Rebuild Container: `docker-compose -f docker-compose.dev.yml up --build -d frontend`
2. **Backend**:
   - `cd backend`
   - `npm install package-name`
   - Rebuild Container: `docker-compose -f docker-compose.dev.yml up --build -d backend`

### 3. Database Migration
เมื่อมีการแก้ไข Entity ใน Backend:
1. NestJS (TypeORM) ของเราตั้งค่า `synchronize: true` สำหรับ Dev mode
2. เพียงแค่ save ไฟล์ entity, database จะถูก update อัตโนมัติ

---

## 📝 Coding Standards

### Naming Conventions
- **Variables/Functions**: `camelCase` (e.g., `getUserById`, `isActive`)
- **Classes/Interfaces**: `PascalCase` (e.g., `UserService`, `UserInterface`)
- **Files**: `kebab-case` (e.g., `user.service.ts`, `auth-guard.ts`)
- **Database Tables**: `snake_case` (handled by TypeORM mostly)

### Backend Best Practices
- **DTOs**: **ต้อง**สร้าง DTO (Data Transfer Object) พร้อม Validation (`class-validator`) สำหรับทุก API Endpoint ที่รับข้อมูล
- **Environment Variables**: ห้าม Hardcode ค่า config/secret ให้ใช้ `ConfigService` ดึงจาก `.env` เสมอ
- **Async/Await**: ใช้ `async/await` เสมอแทน Promise chains

### Frontend Best Practices
- **App Router**: ใช้ Server Components เป็น default (`page.tsx`, `layout.tsx`) และเติม `'use client'` เฉพาะไฟล์ที่ต้องการ interaction/hooks
- **Tailwind**: ใช้ Utility classes ในการจัด layout และ style

---

## 🔄 Git Commit Message Convention

ใช้รูปแบบ: `type(scope): subject`

**Types:**
- `feat`: ฟีเจอร์ใหม่
- `fix`: แก้ไขบั๊ก
- `docs`: แก้ไขเอกสาร
- `style`: ปรับแต่ง format, space (ไม่มีผลกับ logic)
- `refactor`: แก้ไขโค้ดแต่ไม่ได้เพิ่มฟีเจอร์หรือแก้บั๊ก (จัดระเบียบ)
- `chore`: งานจิปาถะ (build process, tools)

**ตัวอย่าง:**
- `feat(auth): add google login strategy`
- `fix(user): resolve soft delete issue`
- `docs: update readme with docker instructions`
