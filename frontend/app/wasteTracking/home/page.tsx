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
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
                setLoading(false); 
            } catch (e) {
                console.error("Parse error", e);
            }
        }

        
        const validateAndFetch = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`${API_URL}/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    setUser(data); 
                    localStorage.setItem('user', JSON.stringify(data));
                } else if (response.status === 401) {
                    
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setUser(null);
                }
            } catch (error) {
                console.error("Connection error", error);
            } finally {
                setLoading(false);
            }
        };

        validateAndFetch();
    }, [searchParams, API_URL]);

    if (loading && !user) {
        return <HomePage title="กำลังโหลดข้อมูล..." />;
    }

    if (!user) {
        return (
            <div onClick={() => router.push('/auth/login')}>
                <HomePage title="ยินดีต้อนรับ" />
            </div>
        );
    }

    return (
        <HomePage title={`สวัสดี ${user.firstName}`} />
    );
}