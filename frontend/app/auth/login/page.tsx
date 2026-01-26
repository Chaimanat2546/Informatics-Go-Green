'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/auth/dashboard');
    }
  }, [router]);

  const showMessage = (text: string, error = false) => {
    setMessage(text);
    setIsError(error);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        showMessage('เข้าสู่ระบบสำเร็จ! กำลังเปลี่ยนหน้า...');
        setTimeout(() => router.push('/auth/dashboard'), 1000);
      } else {
        showMessage(Array.isArray(data.message) ? data.message.join(', ') : data.message || 'เข้าสู่ระบบไม่สำเร็จ', true);
      }
    } catch {
      showMessage('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง', true);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">เข้าสู่ระบบ</h1>

        {message && (
          <div className={`p-3 rounded mb-4 text-center ${isError ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">อีเมล</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="example@email.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">รหัสผ่าน</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        <p className="text-center mt-4">
          <a href="/auth/forgot-password" className="text-blue-500 hover:underline">ลืมรหัสผ่าน?</a>
        </p>

        <div className="my-6 flex items-center">
          <hr className="flex-1" />
          <span className="px-4 text-gray-500 text-sm">หรือ</span>
          <hr className="flex-1" />
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full p-2 border rounded flex items-center justify-center gap-2 hover:bg-gray-50"
        >
          <span>🔵</span> เข้าสู่ระบบด้วย Google
        </button>

        <p className="text-center mt-6 text-sm">
          ยังไม่มีบัญชี? <a href="/auth/register" className="text-blue-500 hover:underline">สมัครสมาชิก</a>
        </p>
      </div>
    </div>
  );
}
