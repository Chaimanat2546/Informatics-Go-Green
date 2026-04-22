# 🎨 Frontend Application (Next.js)

ส่วนแสดงผล (User Interface) สำหรับโปรเจกต์ **Informatics Go Green** พัฒนาด้วย Next.js 15 เน้นความเร็ว สวยงาม และรองรับการแสดงผลบนมือถือ (Mobile-first)

---

## 🛠 Tech Stack & Tools

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS & Vanilla CSS
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
- **Icons:** Lucide React & Tabler Icons
- **Animation:** Framer Motion / CSS Transitions
- **Deployment:** Standalone Output (Docker Optimized)

---

## 🚀 คำสั่งที่ใช้บ่อย (Available Scripts)

| คำสั่ง | รายละเอียด |
|--------|-------------|
| `npm run dev` | เริ่มระบบพัฒนา (localhost:3000) |
| `npm run build` | สร้าง Production Bundle |
| `npm run start` | เริ่มระบบ Production (หลัง Build) |
| `npm run lint` | ตรวจสอบคุณภาพโค้ดและกฎของ React/Next.js |

---

## 🌐 การตั้งค่า Subpath Deployment

แอปพลิเคชันนี้ถูกออกแบบให้สามารถรันภายใต้ Subpath เช่น `https://domain.com/if-go-green/` โดยมีการตั้งค่าพิเศษดังนี้:

- **`next.config.ts`**: กำหนด `basePath` และ `assetPrefix` ผ่านตัวแปรสภาพแวดล้อม
- **Image Optimization**: ถูกปิดใช้งาน (`unoptimized: true`) เพื่อความเสถียรบนเซิร์ฟเวอร์มหาวิทยาลัยที่ไม่มี Library ประมวลผลรูปภาพ

---

## 📁 โครงสร้างโฟลเดอร์

```text
app/
├── 📂 admin/           # หน้าเว็บสำหรับผู้ดูแลระบบ
├── 📂 auth/            # หน้า Login, Register, Profile
├── 📂 systemConfig/    # หน้าตั้งค่าระบบ
├── 📂 wasteTracking/   # หน้าหลัก, สแกนขยะ, สถิติ
├── 📄 layout.tsx       # โครงสร้างหลัก (Navbar, Footer)
└── 📄 page.tsx         # หน้าแรก (Home Redirect)

components/
├── 📂 ui/              # ชิ้นส่วน UI พื้นฐาน (Button, Input, Card)
├── 📂 auth/            # คอมโพเนนต์ที่เกี่ยวกับระบบสมาชิก
└── 📂 wasteTracking/   # คอมโพเนนต์ที่เกี่ยวกับการจัดการขยะ
```

---

## 🔑 ตัวแปรสภาพแวดล้อม (.env)

| ตัวแปร | รายละเอียด |
|--------|-------------|
| `NEXT_PUBLIC_API_URL` | URL ของ Backend API |
| `NEXT_PUBLIC_BASE_PATH` | Path เริ่มต้นของหน้าเว็บ (เช่น /if-go-green) |

---

<p align="center">
  <a href="../README.md">กลับสู่หน้าหลัก</a>
</p>
