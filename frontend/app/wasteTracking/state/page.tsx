'use client';

import { CardContentLarge } from "@/components/ui/card";
import MenuBar from "@/components/wasteTracking/MenuBar";

export default function wasteStatsPage() {
    return (
        <>
            <CardContentLarge className="h-40">
                สถิติ
            </CardContentLarge>
            <MenuBar activeTab="wasteStats" />
        </>
    )
}