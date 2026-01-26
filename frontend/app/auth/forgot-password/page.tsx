'use client';

import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [email, setEmail] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  const showMessage = (text: string, error = false) => {
    setMessage(text);
    setIsError(error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage(data.message || 'If your email is registered, you will receive a password reset link');
        setEmail('');
      } else {
        showMessage(data.message || 'Failed to send reset email', true);
      }
    } catch {
      showMessage('Network error. Please try again.', true);
    }
  };

  return (
    <div>
      <h1>Forgot Password</h1>

      {message && <div style={{ color: isError ? 'red' : 'green' }}>{message}</div>}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <br />
        <button type="submit">Send Reset Link</button>
      </form>

      <hr />

      <p><a href="/auth/login">Back to Login</a></p>
    </div>
  );
}
