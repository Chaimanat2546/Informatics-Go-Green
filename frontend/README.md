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
| Tailwind CSS | 3+ | Utility-first CSS Framework |
| shadcn/ui | latest | UI Component Library |
| Radix UI | latest | Headless UI Primitives (ใช้โดย shadcn) |
| Lucide React | latest | Icon Library |

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
│   └── globals.css            # Global Styles + Tailwind + shadcn
│
├── components/                 # Shared Components
│   └── ui/                    # shadcn/ui Components
│       ├── button.tsx
│       ├── input.tsx
│       ├── card.tsx
│       └── ...
│
├── lib/                        # Utility Functions
│   └── utils.ts               # cn() helper สำหรับ className
│
├── public/                     # Static Assets
│   ├── images/               # Image files
│   └── icons/                # Icon files
│
├── components.json            # shadcn/ui Configuration
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
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d frontend
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

## 🎨 shadcn/ui Setup & Usage

### การติดตั้ง shadcn/ui

```bash
# Initialize shadcn/ui (เลือก style, color, และ config)
npx shadcn-ui@latest init

# เพิ่ม components ที่ต้องการ
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add card
npx shadcn-ui@latest add form
```

### การใช้งาน Components

```tsx
// ตัวอย่างการใช้ Button
import { Button } from "@/components/ui/button";

export default function MyPage() {
  return (
    <div className="space-y-4">
      <Button>Default Button</Button>
      <Button variant="destructive">Delete</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
    </div>
  );
}
```

### การใช้งาน Form Components

```tsx
'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginForm() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>เข้าสู่ระบบ</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="email@example.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" />
        </div>
        <Button className="w-full">Login</Button>
      </CardContent>
    </Card>
  );
}
```

### cn() Utility Function

ใช้สำหรับ merge Tailwind classes อย่างปลอดภัย:

```tsx
// lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// การใช้งาน
import { cn } from "@/lib/utils";

export function MyComponent({ className }: { className?: string }) {
  return (
    <div className={cn("p-4 rounded-lg bg-primary", className)}>
      Content
    </div>
  );
}
```

### Theme Customization

ปรับแต่ง theme ใน `globals.css`:

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 142.1 76.2% 36.3%;  /* สีเขียว Go Green */
    --primary-foreground: 355.7 100% 97.3%;
    /* ... เพิ่มสีอื่นๆ ตามต้องการ */
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --primary: 142.1 70.6% 45.3%;
    /* ... เพิ่มสีสำหรับ dark mode */
  }
}
```

### Components ที่แนะนำ

| Component | Use Case |
|-----------|----------|
| `button` | Buttons, Links ที่ต้องการ action |
| `input` | Text inputs, Search bars |
| `card` | Container สำหรับ content |
| `form` | Form validation (with react-hook-form) |
| `dialog` | Modal popups |
| `dropdown-menu` | Navigation menus |
| `toast` | Notifications |
| `avatar` | User profile images |
| `badge` | Status indicators |

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
