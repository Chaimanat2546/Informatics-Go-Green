'use client';

import { ChevronLeft, Leaf, LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {
    title: string;
    isButtonBack ?: boolean;
    isIcon ?: LucideIcon;
    headerHeight?: string;
}
export default function LayoutPage({ title, isButtonBack = false, isIcon: Icon, headerHeight = "34.5" }: Props) {
    const router = useRouter();
    return (
        <>
            <div className={`bg-green-600 h-${headerHeight} rounded-b-[50px] px-6 pt-8 pb-4 relative z-0`}>
                <div className="flex justify-between items-center text-white">
                    {isButtonBack ? (
                        <button
                            onClick={() => router.back()}
                            className="p-1 hover:bg-green-700/50 rounded-full transition-colors"
                        >
                            <ChevronLeft size={32} strokeWidth={3} />
                        </button>
                    ) : Icon ? (
                        <Icon size={40} strokeWidth={2.5} />
                    ) : (
                        <div className="w-8" />
                    )}
                    <h1 className="text-3xl font-bold">{title}</h1>
                    <div className="bg-white h-12.5 w-12.5 rounded-2xl flex justify-center items-center">
                        <Leaf className="text-green-700" size={40} strokeWidth={4} />
                    </div>
                </div>
            </div>


        </>
    )
}