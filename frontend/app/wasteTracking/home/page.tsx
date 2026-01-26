'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import HomePage from '@/components/wasteTracking/HomePage';

interface User {
    firstName: string;
    lastName: string;
    email: string;
    provider?: string;
    createdAt: string;
}

export default function DashboardPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [user, setUser] = useState<User | null>(null);
    // const [loading, setLoading] = useState(true);
    // const [message, setMessage] = useState('');

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

    useEffect(() => {
        let ignore = false;
        const tokenFromUrl = searchParams.get('token');
        if (tokenFromUrl) {
            localStorage.setItem('token', tokenFromUrl);
            window.history.replaceState({}, document.title, '/auth/dashboard');
        }
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/auth/login');
            return;
        }
        const fetchUserProfile = async () => {
            try {
                const response = await fetch(`${API_URL}/auth/me`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
                const data = await response.json();
                if (ignore) return;
                if (response.ok) {
                    setUser(data);
                    // setLoading(false);
                } else {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    router.push('/auth/login');
                }
            } catch {
                if (!ignore) {
                    // setMessage('Network error. Please try again.');
                    // setLoading(false);
                }
            }
        };
        fetchUserProfile();
        return () => {
            ignore = true;
        };
    }, [router, searchParams, API_URL]);
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <HomePage firstname={user?.firstName} lastname={user?.lastName} />
        </Suspense>
    );
}
