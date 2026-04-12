# 🔧 Backend API

NestJS Backend API สำหรับโปรเจค Informatics Go Green

---

## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [Folder Structure](#-folder-structure)
- [Getting Started](#-getting-started)
- [Available Scripts](#-available-scripts)
- [API Endpoints](#-api-endpoints)
- [Database Schema](#-database-schema)
- [Authentication Flow](#-authentication-flow)

---

## 🛠 Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| NestJS | 10+ | Node.js Framework |
| TypeScript | 5+ | Type Safety |
| TypeORM | 0.3+ | ORM for PostgreSQL |
| PostgreSQL | 16 | Database |
| Passport | 0.7+ | Authentication |
| JWT | - | Token Authentication |
| bcryptjs | - | Password Hashing |
| class-validator | - | DTO Validation |

---

## 📁 Folder Structure

```
backend/
├── src/
│   ├── auth/                   # Authentication Module
│   │   ├── dto/               # Request/Response DTOs
│   │   │   ├── login.dto.ts
│   │   │   ├── register.dto.ts
│   │   │   └── reset-password.dto.ts
│   │   ├── guards/            # Route Guards
│   │   │   └── jwt-auth.guard.ts
│   │   ├── strategies/        # Passport Strategies
│   │   │   ├── jwt.strategy.ts
│   │   │   └── google.strategy.ts
│   │   ├── auth.controller.ts # Route Handlers
│   │   ├── auth.service.ts    # Business Logic
│   │   └── auth.module.ts     # Module Definition
│   │
│   ├── users/                  # User Module
│   │   ├── entities/          # TypeORM Entities
│   │   │   └── user.entity.ts
│   │   ├── users.service.ts   # User CRUD Operations
│   │   └── users.module.ts    # Module Definition
│   │
│   ├── app.module.ts          # Root Module
│   ├── app.controller.ts      # Health Check Endpoint
│   ├── app.service.ts         # App Service
│   └── main.ts                # Application Bootstrap
│
├── test/                       # E2E Tests
│   └── app.e2e-spec.ts
│
├── Dockerfile.dev             # Development Image
├── Dockerfile.prod            # Production Image
├── nest-cli.json              # NestJS CLI Config
├── tsconfig.json              # TypeScript Config
└── package.json               # Dependencies
```

---

## 🚀 Getting Started

### With Docker (แนะนำ)

```bash
# จาก root directory ของโปรเจค
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d backend
```

### Local Development

```bash
# ต้องมี PostgreSQL running (หรือใช้ Docker สำหรับ DB)
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d postgres

# Install dependencies
npm install --legacy-peer-deps

# Start development server (watch mode)
npm run start:dev

# API available at http://localhost:3001
```

---

## 📝 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run start` | Start in production mode |
| `npm run start:dev` | Start in watch mode (development) |
| `npm run start:prod` | Start compiled production build |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm run test` | Run unit tests |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run test:cov` | Generate test coverage |
| `npm run lint` | Run ESLint |

---

## 🔌 API Endpoints

### Base URL

```
Development: http://localhost:3001/api
Production:  https://your-domain.com/api
```

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/auth/register` | Register new user | ❌ |
| `POST` | `/auth/login` | Login with credentials | ❌ |
| `GET` | `/auth/google` | Google OAuth login | ❌ |
| `GET` | `/auth/google/callback` | Google OAuth callback | ❌ |
| `POST` | `/auth/forgot-password` | Request password reset | ❌ |
| `POST` | `/auth/reset-password` | Reset password | ❌ |
| `GET` | `/auth/profile` | Get user profile | ✅ JWT |
| `POST` | `/auth/logout` | Logout user | ✅ JWT |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | API health check |

---

## 🗄 Database Schema

### User Entity

```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column()
  name: string;

  @Column({ default: 'local' })
  provider: string;  // 'local' | 'google'

  @Column({ nullable: true })
  providerId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;  // Soft delete
}
```

### Entity Relationships (Future)

```
┌─────────────┐
│    User     │
└──────┬──────┘
       │ 1:N
       ▼
┌─────────────┐
│   (Future)  │
│   Entities  │
└─────────────┘
```

---

## 🔐 Authentication Flow

### Local Login Flow

```
┌──────────┐     POST /auth/login      ┌──────────┐
│  Client  │ ─────────────────────────▶│  Backend │
└──────────┘     { email, password }   └────┬─────┘
                                            │
                           ┌────────────────┘
                           ▼
                    ┌─────────────┐
                    │ Validate    │
                    │ Credentials │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │ Generate    │
                    │ JWT Token   │
                    └──────┬──────┘
                           │
┌──────────┐               │
│  Client  │ ◀─────────────┘
└──────────┘   { access_token }
```

### Google OAuth Flow

```
┌──────────┐   GET /auth/google   ┌──────────┐
│  Client  │ ────────────────────▶│  Backend │
└──────────┘                      └────┬─────┘
                                       │
                    ┌──────────────────┘
                    ▼
             ┌─────────────┐
             │   Google    │
             │   OAuth     │
             └──────┬──────┘
                    │ Authorization
                    ▼
             ┌─────────────┐
             │  Callback   │
             │  /callback  │
             └──────┬──────┘
                    │
                    ▼
             ┌─────────────┐
             │ Create/Find │
             │    User     │
             └──────┬──────┘
                    │
┌──────────┐        │
│  Client  │ ◀──────┘
└──────────┘  Redirect with JWT
```

---

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment mode | Yes |
| `PORT` | Server port | Yes |
| `DATABASE_HOST` | PostgreSQL host | Yes |
| `DATABASE_PORT` | PostgreSQL port | Yes |
| `DATABASE_USER` | Database username | Yes |
| `DATABASE_PASSWORD` | Database password | Yes |
| `DATABASE_NAME` | Database name | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `JWT_EXPIRES_IN_SECONDS` | JWT expiration time | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth ID | No |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Secret | No |
| `GOOGLE_CALLBACK_URL` | OAuth callback URL | No |

---

## 🧪 Testing

### Run Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:cov
```

### Test File Naming

| Type | Pattern | Location |
|------|---------|----------|
| Unit | `*.spec.ts` | Same folder as source |
| E2E | `*.e2e-spec.ts` | `/test` folder |

---

## 📚 Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [Passport.js Documentation](http://www.passportjs.org)

---

<p align="center">
  ดูเอกสารเพิ่มเติมที่ <a href="../README.md">README หลัก</a> หรือ <a href="../DEVELOPER_GUIDE.md">Developer Guide</a>
</p>
