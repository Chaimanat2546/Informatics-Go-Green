import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6 py-16">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mx-auto w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6">
          <svg
            className="w-10 h-10 text-amber-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h1 className="text-6xl font-bold text-slate-800 mb-2">404</h1>
        <h2 className="text-xl font-semibold text-slate-700 mb-2">
          ไม่พบหน้าที่ต้องการ
        </h2>
        <p className="text-slate-500 mb-8">
          หน้าที่คุณกำลังค้นหาอาจถูกลบ เปลี่ยนชื่อ หรือไม่มีอยู่ในระบบ
        </p>

        <Link
          href="/"
          className="inline-block px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-emerald-300 hover:from-emerald-600 hover:to-teal-600 active:scale-95"
        >
          กลับหน้าหลัก
        </Link>
      </div>
    </div>
  );
}
