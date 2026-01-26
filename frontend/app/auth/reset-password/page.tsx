'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [message, setMessage] = useState(!token ? 'ลิงก์ไม่ถูกต้อง ไม่พบ token' : '');
  const [isError, setIsError] = useState(!token);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  const showMessage = (text: string, error = false) => {
    setMessage(text);
    setIsError(error);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = (): boolean => {
    if (formData.password !== formData.confirmPassword) {
      showMessage('รหัสผ่านไม่ตรงกัน', true);
      return false;
    }
    if (formData.password.length < 6) {
      showMessage('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร', true);
      return false;
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(formData.password)) {
      showMessage('รหัสผ่านต้องมีตัวพิมพ์เล็ก ตัวพิมพ์ใหญ่ และตัวเลข', true);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: formData.password }),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('รีเซ็ตรหัสผ่านสำเร็จ! กำลังไปหน้าเข้าสู่ระบบ...');
        setTimeout(() => router.push('/auth/login'), 2000);
      } else {
        showMessage(data.message || 'รีเซ็ตรหัสผ่านไม่สำเร็จ', true);
      }
    } catch {
      showMessage('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง', true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">รีเซ็ตรหัสผ่าน</h1>

        {message && (
          <div className={`p-3 rounded mb-4 text-center ${isError ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
            {message}
          </div>
        )}

        {token && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">รหัสผ่านใหม่</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                placeholder="••••••••"
                required
                minLength={6}
              />
              <p className="text-xs text-gray-500 mt-1">ต้องมีตัวพิมพ์เล็ก ตัวพิมพ์ใหญ่ และตัวเลข</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">ยืนยันรหัสผ่านใหม่</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'กำลังรีเซ็ต...' : 'รีเซ็ตรหัสผ่าน'}
            </button>
          </form>
        )}

        <p className="text-center mt-6 text-sm">
          <a href="/auth/login" className="text-blue-500 hover:underline">← กลับไปหน้าเข้าสู่ระบบ</a>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p>กำลังโหลด...</p>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
