'use client'

import { CardContentLarge } from "@/components/ui/card"
import MenuBar from "@/components/wasteTracking/MenuBar"

export default function wasteStatsPage() {
    return (
        <>
            <CardContentLarge>
                สถิติ
            </CardContentLarge>
            <MenuBar activeTab="wasteStats" />

        </>
    )
}