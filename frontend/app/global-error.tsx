"use client";

export default function GlobalError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="th">
      <body style={{ margin: 0, backgroundColor: "#f0fdf4", fontFamily: "IBM Plex Sans Thai, sans-serif" }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
          }}
        >
          <div style={{ maxWidth: "28rem", width: "100%", textAlign: "center" }}>
            {/* Icon */}
            <div
              style={{
                margin: "0 auto 1.5rem",
                width: "5rem",
                height: "5rem",
                backgroundColor: "#fee2e2",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>

            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "#1e293b",
                marginBottom: "0.5rem",
              }}
            >
              เกิดข้อผิดพลาดร้ายแรง
            </h2>
            <p style={{ color: "#64748b", marginBottom: "2rem" }}>
              ระบบเกิดข้อผิดพลาดที่ไม่สามารถกู้คืนได้ กรุณาลองใหม่อีกครั้ง
            </p>

            <button
              onClick={reset}
              style={{
                padding: "0.75rem 1.5rem",
                background: "linear-gradient(to right, #10b981, #14b8a6)",
                color: "white",
                fontWeight: 500,
                border: "none",
                borderRadius: "0.75rem",
                cursor: "pointer",
                fontSize: "1rem",
              }}
            >
              ลองใหม่อีกครั้ง
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
