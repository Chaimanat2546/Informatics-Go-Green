"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from 'react';
import HomePage from "@/components/wasteTracking/HomePage";
interface User {
    firstName: string;
    lastName: string;
    email: string;
}

export default function Home() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

    useEffect(() => {
        const tokenFromUrl = searchParams.get('token');
        if (tokenFromUrl) {
            localStorage.setItem('token', tokenFromUrl);
            window.history.replaceState({}, document.title, '/wasteTracking/home');
        }
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));

            } catch (e) {
                console.error("Parse error", e);
            }
        }
    }, [searchParams]);
    useEffect(() => {
        let ignore = false;
        const token = localStorage.getItem('token');

        if (!token) {
            router.push('/wasteTracking/home');
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

                if (ignore) return;

                if (response.ok) {
                    const data = await response.json();
                    setUser(data);
                    localStorage.setItem('user', JSON.stringify(data));
                } else {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    router.push('/wasteTracking/home');
                }
            } catch (error) {
                console.error("Fetch error:", error);
            } finally {
                if (!ignore) setLoading(false);
            }
        };
        fetchUserProfile();
        return () => {
            ignore = true;
        };
    }, [router, API_URL]);

    if (loading && !user) {
        return <>
            <div onClick={() => { router.push('/auth/login') }} >
                <HomePage title={`ยินดีต้อนรับ`} />
            </div>
        </>;
    }

    return (
        <HomePage title={`สวัสดี ${user?.firstName}`} />
    );
}