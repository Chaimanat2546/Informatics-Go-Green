# 🎨 Frontend Application

Next.js Frontend สำหรับโปรเจค Informatics Go Green

---

## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [Folder Structure](#-folder-structure)
- [Getting Started](#-getting-started)
- [Available Scripts](#-available-scripts)
- [Environment Variables](#-environment-variables)
- [Component Guidelines](#-component-guidelines)

---

## 🛠 Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14+ | React Framework (App Router) |
| TypeScript | 5+ | Type Safety |
| React | 18+ | UI Library |
| Tailwind CSS | 3+ | Styling (optional) |

---

## 📁 Folder Structure

```
frontend/
├── app/                        # Next.js App Router
│   ├── auth/                  # Authentication Pages
│   │   ├── login/            # Login Page
│   │   │   └── page.tsx
│   │   ├── register/         # Register Page
│   │   │   └── page.tsx
│   │   └── dashboard/        # User Dashboard
│   │       └── page.tsx
│   │
│   ├── layout.tsx             # Root Layout (HTML, fonts, providers)
│   ├── page.tsx               # Home Page (/)
│   └── globals.css            # Global Styles
│
├── public/                     # Static Assets
│   ├── images/               # Image files
│   └── icons/                # Icon files
│
├── next.config.ts             # Next.js Configuration
├── tsconfig.json              # TypeScript Configuration
├── package.json               # Dependencies
├── Dockerfile.dev             # Development Image
└── Dockerfile.prod            # Production Image
```

---

## 🚀 Getting Started

### With Docker (แนะนำ)

```bash
# จาก root directory ของโปรเจค
docker-compose -f docker-compose.dev.yml up --build -d frontend
```

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

---

## 📝 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server (port 3000) |
| `npm run build` | Build production bundle |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## 🔧 Environment Variables

สร้างไฟล์ `.env.local` หรือใช้ค่าจาก Docker:

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:3001` |
| `WATCHPACK_POLLING` | Enable polling for Docker | `true` |

---

## 🧩 Component Guidelines

### Server Components (Default)

ใช้สำหรับ pages และ layouts ที่ไม่ต้องการ interactivity:

```tsx
// app/page.tsx - Server Component (default)
export default function HomePage() {
  return <h1>Welcome</h1>;
}
```

### Client Components

เติม `'use client'` เมื่อต้องการ hooks หรือ browser APIs:

```tsx
// app/components/Counter.tsx
'use client';

import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

### When to Use Client Components

| Use Case | Component Type |
|----------|---------------|
| Display static content | Server |
| Fetch data on server | Server |
| Form inputs, buttons | Client |
| useState, useEffect | Client |
| Browser APIs (localStorage) | Client |

---

## 🎨 Styling Guidelines

### CSS Modules (Scoped)

```tsx
// app/components/Button.module.css
.button {
  background: blue;
  padding: 8px 16px;
}

// app/components/Button.tsx
import styles from './Button.module.css';
export default function Button() {
  return <button className={styles.button}>Click</button>;
}
```

### Global Styles

```css
/* app/globals.css */
:root {
  --primary-color: #10b981;
}

body {
  font-family: 'Inter', sans-serif;
}
```

---

## 🔗 API Integration

### Fetching Data (Server Component)

```tsx
// app/users/page.tsx
async function getUsers() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`);
  return res.json();
}

export default async function UsersPage() {
  const users = await getUsers();
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}
```

### Fetching Data (Client Component)

```tsx
'use client';
import { useEffect, useState } from 'react';

export default function Users() {
  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(setUsers);
  }, []);

  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}
```

---

<p align="center">
  ดูเอกสารเพิ่มเติมที่ <a href="../README.md">README หลัก</a> หรือ <a href="../DEVELOPER_GUIDE.md">Developer Guide</a>
</p>
