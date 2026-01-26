'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
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
        showMessage('Login successful! Redirecting...');
        setTimeout(() => router.push('/auth/dashboard'), 1000);
      } else {
        showMessage(data.message || 'Login failed', true);
      }
    } catch {
      showMessage('Network error. Please try again.', true);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/auth/google`;
  };


  return (
    <div>
      <h1>Login</h1>

      {message && <div style={{ color: isError ? 'red' : 'green' }}>{message}</div>}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>
        <br />
        <div>
          <label htmlFor="password">Password:</label>
          <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required />
        </div>
        <br />
        <button type="submit">Login</button>
      </form>

      <p><a href="/auth/forgot-password">Forgot Password?</a></p>

      <hr />

      <h3>Or login with:</h3>
      <button onClick={handleGoogleLogin}>Login with Google</button>

      <hr />

      <p>Don&apos;t have an account? <a href="/auth/register">Register here</a></p>
    </div>
  );
}
