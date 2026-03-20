'use client';

import { Card } from "@/components/ui/card";
import MenuBar from "@/components/wasteTracking/MenuBar";
import { useParams, useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, Leaf, Loader2, ThumbsDown, ThumbsUp } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { WasteData } from "@/interfaces/Waste";

interface ReactionState {
    likes: number;
    dislikes: number;
    userReaction: 'like' | 'dislike' | null;
}

export default function ViewWastePage() {
    const params = useParams();
    const wasteId = Number(params.id);
    const [waste, setWaste] = useState<WasteData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [reactionState, setReactionState] = useState<ReactionState>({ likes: 0, dislikes: 0, userReaction: null });
    const [userId, setUserId] = useState<string | null>(null);
    const [showDislikeWarning, setShowDislikeWarning] = useState(false);
    const router = useRouter();

    const submitReaction = async (type: 'like' | 'dislike') => {
        if (!userId) return;
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
        try {
            const res = await fetch(`${API_URL}/waste/${wasteId}/reaction`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, reaction: type }),
            });
            if (res.ok) {
                const data = await res.json();
                if (data.deleted) {
                    router.replace('/wasteTracking/home');
                    return;
                }
                setReactionState(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleReaction = (type: 'like' | 'dislike') => {
        if (type === 'dislike' && reactionState.userReaction !== 'dislike' && reactionState.dislikes + 1 >= 50) {
            setShowDislikeWarning(true);
            return;
        }
        submitReaction(type);
    };

    useEffect(() => {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

        const storedUser = localStorage.getItem('user');
        let uid: string | null = null;
        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                uid = parsed.id;
                setUserId(uid);
            } catch (e) { console.error(e); }
        }

        const fetchData = async () => {
            if (!wasteId) {
                setError(true);
                setLoading(false);
                return;
            }
            try {
                const [wasteRes, reactionRes] = await Promise.all([
                    fetch(`${API_URL}/waste/item/${wasteId}`),
                    fetch(`${API_URL}/waste/${wasteId}/reaction${uid ? `?userId=${uid}` : ''}`),
                ]);
                if (!wasteRes.ok) throw new Error("Not Found");
                const data: WasteData = await wasteRes.json();
                setWaste(data);
                if (reactionRes.ok) {
                    const rData = await reactionRes.json();
                    setReactionState(rData);
                }
            } catch (err) {
                console.error(err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [wasteId]);

    if (loading) {
        return (
            <div className="flex flex-col h-screen items-center justify-center bg-gray-50">
                <Loader2 className="h-10 w-10 animate-spin text-green-600 mb-4" />
                <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
            </div>
        );
    }

    if (error || !waste) {
        return (
            <div className="flex flex-col h-screen items-center justify-center bg-gray-50 gap-4">
                <p className="text-xl text-gray-700">ไม่พบข้อมูลขยะนี้</p>
                <Button variant="outline" onClick={() => router.back()}>ย้อนกลับ</Button>
                <div className="fixed bottom-0 w-full"><MenuBar activeTab="home" /></div>
            </div>
        );
    }

    return (
        <>
            <Card className="px-4 mx-6 gap-1 -mt-10 z-10 relative rounded-[24px] shadow-sm border-none bg-white">
                <div className="w-62.5 h-62.5 mx-auto text-center flex justify-center contain-content items-center bg-gray-100 rounded-xl overflow-hidden">
                    {waste.waste_image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={waste.waste_image} alt={waste.name} className="w-full h-full object-contain rounded-2xl" />
                    ) : (
                        <span className="text-gray-400">No Image</span>
                    )}
                </div>

                <div className="flex flex-col items-center mt-1 mb-4">
                    <h2 className="text-2xl font-semibold text-black">{waste.name}</h2>
                    <span className="bg-green-100 text-green-700 text-md font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        <Leaf size={20} /> {waste.waste_categoriesid.map(cat => cat.name)}
                    </span>
                </div>

                {waste.waste_sorting.length > 0 && (
                    <div className="relative pl-2 mb-4">
                        <h3 className="text-green-800 text-xl font-semibold mb-4 border-l-4 border-green-700 pl-3">
                            ขั้นตอนการทิ้ง
                        </h3>
                        <div className="absolute left-6.25 top-16 bottom-4 w-1 bg-green-700"></div>
                        <div className="space-y-4">
                            {waste.waste_sorting.map((step, index) => (
                                <div key={index} className="flex items-start gap-3 relative z-10 w-full">
                                    <CheckCircle2 className="text-green-700 rounded-full shrink-0" size={38} fill="#fff" />
                                    <p className="text-gray-800 text-lg mt-0.5 flex-1 wrap-break-word">{step.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </Card>

            {waste.material_guides.length > 0 && (
                <Card className="px-4 mx-6 mt-4 rounded-[24px] shadow-sm bg-white">
                    <h3 className="text-green-800 font-semibold text-2xl border-l-4 border-green-700 pl-3">
                        วิธีการแยกขยะ
                    </h3>
                    <div className="flex flex-col gap-2 -mt-2">
                        {waste.material_guides.map((comp, index) => (
                            <div key={index} className="border border-green-200 rounded-xl p-3">
                                <div className="flex justify-between items-center mb-3 px-2">
                                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                                        {waste.waste_image && (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={waste.waste_image} alt="Original" className="w-full h-full object-cover" />
                                        )}
                                    </div>
                                    <span className="text-green-700 font-bold text-xl">=</span>
                                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                                        {comp.guide_image ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={comp.guide_image} alt="Component" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">?</div>
                                        )}
                                    </div>
                                </div>
                                <div className="text-center border-t border-gray-100 pt-2">
                                    <p className="font-bold text-gray-800 text-xl">{comp.waste_meterial_name}</p>
                                    <p className="text-md text-gray-500 flex-1 wrap-break-word">{comp.recommendation}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            <div className="mx-6 mt-4 mb-24">
                <Card className="px-4 rounded-[24px] shadow-sm bg-white">
                    <p className="text-center text-gray-500 text-sm">ข้อมูลนี้เป็นประโยชน์หรือไม่?</p>
                    <div className="flex items-center justify-center gap-6 pb-2">
                        {(() => {
                            const liked = reactionState.userReaction === 'like';
                            return (
                                <button
                                    onClick={() => handleReaction('like')}
                                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-full border-2 transition-all active:scale-95"
                                    style={liked
                                        ? { backgroundColor: '#22c55e', borderColor: '#22c55e', color: '#ffffff' }
                                        : { borderColor: '#e5e7eb', color: '#9ca3af' }
                                    }
                                >
                                    <ThumbsUp size={20} fill={liked ? '#ffffff' : 'none'} stroke={liked ? '#ffffff' : 'currentColor'} />
                                    <span className="text-sm font-semibold">
                                        ถูกใจ {reactionState.likes > 0 && reactionState.likes}
                                    </span>
                                </button>
                            );
                        })()}
                        {(() => {
                            const disliked = reactionState.userReaction === 'dislike';
                            return (
                                <button
                                    onClick={() => handleReaction('dislike')}
                                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-full border-2 transition-all active:scale-95"
                                    style={disliked
                                        ? { backgroundColor: '#f87171', borderColor: '#f87171', color: '#ffffff' }
                                        : { borderColor: '#e5e7eb', color: '#9ca3af' }
                                    }
                                >
                                    <ThumbsDown size={20} fill={disliked ? '#ffffff' : 'none'} stroke={disliked ? '#ffffff' : 'currentColor'} />
                                    <span className="text-sm font-semibold">
                                        ไม่ถูกใจ
                                    </span>
                                </button>
                            );
                        })()}
                    </div>
                </Card>
            </div>

            <MenuBar activeTab="home" />

            {showDislikeWarning && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-all">
                    <div className="bg-white rounded-[24px] p-8 w-full max-w-sm flex flex-col items-center text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="mb-5">
                            <AlertTriangle className="w-16 h-16 text-slate-800" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-[22px] font-semibold text-slate-800 mb-2">
                            ยืนยันการรายงานข้อมูล
                        </h3>
                        <p className="text-slate-500 mb-8 text-[15px]">
                            ต้องการรายงานว่าข้อมูลนี้ไม่ถูกต้องใช่หรือไม่?<br />
                            เมื่อยืนยันแล้วระบบจะบันทึกการรายงานของคุณ
                        </p>
                        <div className="flex gap-3 w-full">
                            <button
                                onClick={() => setShowDislikeWarning(false)}
                                className="flex-1 py-3 px-4 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={() => { setShowDislikeWarning(false); submitReaction('dislike'); }}
                                className="flex-1 py-3 px-4 bg-[#ef4444] hover:bg-red-600 rounded-xl text-white font-medium transition-colors"
                            >
                                ยืนยัน
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
