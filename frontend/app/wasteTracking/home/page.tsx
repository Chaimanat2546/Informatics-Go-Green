"use client";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { History, LayoutGrid, Leaf, Recycle, ScanLine, Search } from "lucide-react";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group"
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from 'react';
import LatestWasteSorting from "@/components/wasteTracking/LatestWasteSorting";
import MenuBar from "@/components/wasteTracking/MenuBar";

interface User {
    firstName: string;
    lastName: string;
    email: string;
}

export default function HomePage() {
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
            <main onClick={()=>{router.push('/auth/login')}} className="min-h-screen bg-[#EAF6F1] overflow-y-auto overflow-x-hidden font-sans">
                <header className="bg-green-600 px-6 pt-10 pb-24 rounded-b-[50px] relative z-0">
                    <div className="flex justify-between items-center">
                        <div className=" leading-9 font text-3xl font-semibold text-white">ยินดีต้อนรับ</div>
                        <div className="bg-white h-12.5 w-12.5 rounded-2xl flex justify-center items-center">
                            <Leaf className="text-green-700" size={40} strokeWidth={4} />
                        </div>
                    </div>
                    <div className="mt-4 h-11 bg-white rounded-[10px] flex items-center gap-2 px-1 shadow-sm border">
                        <InputGroup className="w-full flex-1 border-none ">
                            <InputGroupInput
                                placeholder="Search..."
                                className="w-full border-none outline-none focus:ring-0 bg-transparent shadow-none"
                            />
                            <InputGroupAddon>
                                <Search className="text-gray-400" />
                            </InputGroupAddon>
                        </InputGroup>
                    </div>
                </header>
                <div className="px-6 -mt-16 relative z-10">
                    <div className="bg-white rounded-3xl p-6 shadow-lg flex flex-col gap-4">
                        <div className="flex  justify-between items-center">
                            <div className="flex items-center gap-2 text-black font-semibold text-lg leading-5">
                                <LayoutGrid size={24} className="text-gray-700" />
                                <span>สรุปการคัดแยกขยะ</span>
                            </div>
                            <Select>
                                <SelectTrigger className="w-25">
                                    <SelectValue placeholder="วัน/เดือน/ปี" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="light">วัน</SelectItem>
                                    <SelectItem value="dark">เดือน</SelectItem>
                                    <SelectItem value="system">ปี</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center pt-0">
                            <div className="flex-1">
                                <p className="text-gray-800 text-sm mb-1">น้ำหนักรวม</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-[#5EA500] text-5xl font-bold">2.4</span>
                                    <span className="text-[#5EA500] text-lg font-medium">กก.</span>
                                </div>
                            </div>
                            <div className="w-px h-12 bg-gray-200 mx-4"></div>
                            <div className="flex-1 pl-2">
                                <p className="text-gray-800 text-sm mb-1">Carbon Credits</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-[#5EA500] text-5xl font-bold">101</span>
                                    <span className="text-[#5EA500] text-lg font-medium">แต้ม</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-6 px-6 w-full flex justify-between items-center gap-3">
                    <div onClick={() => { router.push('/wasteTracking/wasteScaner') }} className="h-25 flex-1 bg-white rounded-xl shadow-lg flex flex-col justify-center items-center gap-2 cursor-pointer hover:shadow-md transition-all">
                        <ScanLine size={40} className="text-green-700" strokeWidth={2} />
                        <p className="text-black text-xs font-semibold text-center leading-tight">
                            สแกนบาร์โค้ดขยะ
                        </p>
                    </div>
                    <div onClick={() => { router.push('/wasteTracking/wasteSorting') }} className="h-25 flex-1 bg-white rounded-xl shadow-lg flex flex-col justify-center items-center gap-2 cursor-pointer hover:shadow-md transition-all">
                        <Recycle size={40} className="text-green-700" strokeWidth={2} />
                        <p className="text-black text-xs font-semibold text-center leading-tight">
                            คัดแยกขยะ
                        </p>
                    </div>
                    <div onClick={() => { router.push('/wasteTracking/wasteHistory') }} className="h-25 flex-1 bg-white rounded-xl shadow-lg flex flex-col justify-center items-center gap-2 cursor-pointer hover:shadow-md transition-all">
                        <History size={40} className="text-green-700" strokeWidth={2} />
                        <p className="text-black text-xs font-semibold text-center leading-tight">
                            ประวัติการคัดแยก
                        </p>
                    </div>
                </div>
                <div className=" mt-4 w-full ">
                    <p className="text-lg leading-6 text-black font-semibold text-center">วิธีคัดแยกขยะล่าสุด</p>
                </div>
                <LatestWasteSorting />
                <MenuBar activeTab="home" />
            </main>
        </>;
    }



    return (
        <>
            <main className="min-h-screen bg-[#EAF6F1] overflow-y-auto overflow-x-hidden font-sans">
                <header className="bg-green-600 px-6 pt-10 pb-24 rounded-b-[50px] relative z-0">
                    <div className="flex justify-between items-center">
                        <div className=" leading-9 font text-3xl font-semibold text-white">สวัสดี {user?.firstName}</div>
                        <div className="bg-white h-12.5 w-12.5 rounded-2xl flex justify-center items-center">
                            <Leaf className="text-green-700" size={40} strokeWidth={4} />
                        </div>
                    </div>
                    <div className="mt-4 h-11 bg-white rounded-[10px] flex items-center gap-2 px-1 shadow-sm border">
                        <InputGroup className="w-full flex-1 border-none ">
                            <InputGroupInput
                                placeholder="Search..."
                                className="w-full border-none outline-none focus:ring-0 bg-transparent shadow-none"
                            />
                            <InputGroupAddon>
                                <Search className="text-gray-400" />
                            </InputGroupAddon>
                        </InputGroup>
                    </div>
                </header>
                <div className="px-6 -mt-16 relative z-10">
                    <div className="bg-white rounded-3xl p-6 shadow-lg flex flex-col gap-4">
                        <div className="flex  justify-between items-center">
                            <div className="flex items-center gap-2 text-black font-semibold text-lg leading-5">
                                <LayoutGrid size={24} className="text-gray-700" />
                                <span>สรุปการคัดแยกขยะ</span>
                            </div>
                            <Select>
                                <SelectTrigger className="w-25">
                                    <SelectValue placeholder="วัน/เดือน/ปี" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="light">วัน</SelectItem>
                                    <SelectItem value="dark">เดือน</SelectItem>
                                    <SelectItem value="system">ปี</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center pt-0">
                            <div className="flex-1">
                                <p className="text-gray-800 text-sm mb-1">น้ำหนักรวม</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-[#5EA500] text-5xl font-bold">2.4</span>
                                    <span className="text-[#5EA500] text-lg font-medium">กก.</span>
                                </div>
                            </div>
                            <div className="w-px h-12 bg-gray-200 mx-4"></div>
                            <div className="flex-1 pl-2">
                                <p className="text-gray-800 text-sm mb-1">Carbon Credits</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-[#5EA500] text-5xl font-bold">101</span>
                                    <span className="text-[#5EA500] text-lg font-medium">แต้ม</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-6 px-6 w-full flex justify-between items-center gap-3">
                    <div onClick={() => { router.push('/wasteTracking/wasteScaner') }} className="h-25 flex-1 bg-white rounded-xl shadow-lg flex flex-col justify-center items-center gap-2 cursor-pointer hover:shadow-md transition-all">
                        <ScanLine size={40} className="text-green-700" strokeWidth={2} />
                        <p className="text-black text-xs font-semibold text-center leading-tight">
                            สแกนบาร์โค้ดขยะ
                        </p>
                    </div>
                    <div onClick={() => { router.push('/wasteTracking/wasteSorting') }} className="h-25 flex-1 bg-white rounded-xl shadow-lg flex flex-col justify-center items-center gap-2 cursor-pointer hover:shadow-md transition-all">
                        <Recycle size={40} className="text-green-700" strokeWidth={2} />
                        <p className="text-black text-xs font-semibold text-center leading-tight">
                            คัดแยกขยะ
                        </p>
                    </div>
                    <div onClick={() => { router.push('/wasteTracking/wasteHistory') }} className="h-25 flex-1 bg-white rounded-xl shadow-lg flex flex-col justify-center items-center gap-2 cursor-pointer hover:shadow-md transition-all">
                        <History size={40} className="text-green-700" strokeWidth={2} />
                        <p className="text-black text-xs font-semibold text-center leading-tight">
                            ประวัติการคัดแยก
                        </p>
                    </div>
                </div>
                <div className=" mt-4 w-full ">
                    <p className="text-lg leading-6 text-black font-semibold text-center">วิธีคัดแยกขยะล่าสุด</p>
                </div>
                <LatestWasteSorting />
                <MenuBar activeTab="home" />
            </main>
        </>
    );
}