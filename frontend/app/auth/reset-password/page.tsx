'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  useEffect(() => {
    if (!token) {
      setMessage('Invalid reset link. No token provided.');
      setIsError(true);
    }
  }, [token]);

  const showMessage = (text: string, error = false) => {
    setMessage(text);
    setIsError(error);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      showMessage('Passwords do not match', true);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: formData.password }),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('Password reset successful! Redirecting to login...');
        setTimeout(() => router.push('/auth/login'), 2000);
      } else {
        showMessage(data.message || 'Failed to reset password', true);
      }
    } catch {
      showMessage('Network error. Please try again.', true);
    }
  };

  return (
    <div>
      <h1>Reset Password</h1>

      {message && <div style={{ color: isError ? 'red' : 'green' }}>{message}</div>}

      {token && (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="password">New Password:</label>
            <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required minLength={6} />
          </div>
          <br />
          <div>
            <label htmlFor="confirmPassword">Confirm New Password:</label>
            <input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required minLength={6} />
          </div>
          <br />
          <button type="submit">Reset Password</button>
        </form>
      )}

      <hr />

      <p><a href="/auth/login">Back to Login</a></p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
