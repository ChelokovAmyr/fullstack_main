'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi, LoginData } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string>('');

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: () => {
      router.push('/');
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Login failed');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    loginMutation.mutate(formData);
  };

  return (
    <div className="container">
      <div className="form-container">
        <h1>Login</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>
          {error && <div className="error">{error}</div>}
          <button type="submit" className="btn" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p style={{ marginTop: '1rem', textAlign: 'center' }}>
          Don't have an account? <Link href="/register" className="link">Register</Link>
        </p>
      </div>
    </div>
  );
}

