# Informatics Go Green

Full-Stack application with NextJS, NestJS, PostgreSQL, and Docker.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- npm

### Development Setup

#### Option 1: Run with Docker (Recommended)

```bash
# Copy environment file
cp .env.example .env

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

**Services:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- PostgreSQL: localhost:5432

#### Option 2: Run Locally

```bash
# Start PostgreSQL only
docker-compose up -d postgres

# Frontend (in terminal 1)
cd frontend
npm install
npm run dev

# Backend (in terminal 2)
cd backend
npm install
npm run start:dev
```

## 📁 Project Structure

```
├── frontend/          # NextJS 14+ application
├── backend/           # NestJS application
├── docker-compose.yml # Docker orchestration
├── .env.example       # Environment template
└── README.md
```

## 🔧 Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Description | Default |
|----------|-------------|---------|
| `POSTGRES_USER` | Database user | postgres |
| `POSTGRES_PASSWORD` | Database password | postgres |
| `POSTGRES_DB` | Database name | informatics_go_green |
| `NEXT_PUBLIC_API_URL` | Backend API URL | http://localhost:3001 |

## 📜 Scripts

### Frontend
```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Production server
```

### Backend
```bash
npm run start:dev   # Development with hot-reload
npm run start:prod  # Production server
npm run test        # Run tests
```

## 🐳 Docker Commands

```bash
docker-compose up -d          # Start all services
docker-compose down           # Stop all services
docker-compose logs -f        # View logs
docker-compose exec postgres psql -U postgres  # Connect to DB
```
