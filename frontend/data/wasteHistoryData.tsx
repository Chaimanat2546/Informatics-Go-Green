export type WasteDetails = {
    mainImage: string;
    carbonCredit: string;
    disposalSteps: string[];
    separationComponents: {
        originalImage: string;
        componentImage: string;
        materialName: string;
        recommendation: string;
    }[];
};

export type WasteRecord = {
    id: number;
    category: string;
    title: string;
    date: string;
    amount: string;
    points: number;
    badgeColor: string;
    textColor: string;
    details?: WasteDetails; // เพิ่มตรงนี้ (Optional)
};

export const wasteHistoryData: WasteRecord[] = [
    {
        id: 1,
        category: "พลาสติก",
        title: "ขวดพลาสติกใส (PET)",
        date: "23 ม.ค. 2026 • 14:20 น.",
        amount: "1.2 กก.",
        points: 50,
        badgeColor: "bg-green-100",
        textColor: "text-green-700",
        details: {
            mainImage: "", // รูปตัวอย่างขวด
            carbonCredit: "1.21 kco2e",
            disposalSteps: [
                "เทน้ำและล้างให้สะอาด",
                "แยกชิ้นส่วน ฝาขวด ฉลาก",
                "ทิ้งในถังขยะสำหรับนำไปรีไซเคิล (ถังสีเหลือง)"
            ],
            separationComponents: [
                {
                    originalImage: "",
                    componentImage: "", // รูปขวดเปล่า
                    materialName: "ขวดพลาสติกใส (PET)",
                    recommendation: "คำแนะนำ: ขวดพลาสติก"
                },
                {
                    originalImage: "",
                    componentImage: "", // รูปฉลาก/โลโก้
                    materialName: "ฟิล์มหด PVC",
                    recommendation: "คำแนะนำ: ฉลากพลาสติก"
                },
                {
                    originalImage: "",
                    componentImage: "", // รูปฝาขวด
                    materialName: "ฝาขวด (HDPE/PP)",
                    recommendation: "คำแนะนำ: ฝาขวด"
                }
            ]
        }
    },
    {
        id: 2,
        category: "พลาสติก",
        title: "ขวดพลาสติกใส (PET)",
        date: "23 ม.ค. 2026 • 14:20 น.",
        amount: "4.2 กก.",
        points: 45,
        badgeColor: "bg-green-100",
        textColor: "text-green-700",
        details: {
            mainImage: "", // รูปตัวอย่างขวด
            carbonCredit: "1.21 kco2e",
            disposalSteps: [
                "เทน้ำและล้างให้สะอาด",
                "แยกชิ้นส่วน ฝาขวด ฉลาก",
                "ทิ้งในถังขยะสำหรับนำไปรีไซเคิล (ถังสีเหลือง)"
            ],
            separationComponents: [
                {
                    originalImage: "",
                    componentImage: "", // รูปขวดเปล่า
                    materialName: "ขวดพลาสติกใส (PET)",
                    recommendation: "คำแนะนำ: ขวดพลาสติก"
                },
                {
                    originalImage: "",
                    componentImage: "", // รูปฉลาก/โลโก้
                    materialName: "ฟิล์มหด PVC",
                    recommendation: "คำแนะนำ: ฉลากพลาสติก"
                },
                {
                        originalImage: "",
                        componentImage: "", // รูปฝาขวด
                    materialName: "ฝาขวด (HDPE/PP)",
                    recommendation: "คำแนะนำ: ฝาขวด"
                }
            ]
        }
    },
    {
        id: 3,
        category: "พลาสติก",
        title: "ขวดแก้ว ",
        date: "23 ม.ค. 2026 • 14:20 น.",
        amount: "1.2 กก.",
        points: 70,
        badgeColor: "bg-green-100",
        textColor: "text-green-700",
        details: {
            mainImage: "", // รูปตัวอย่างขวด
            carbonCredit: "1.21 kco2e",
            disposalSteps: [
                "เทน้ำและล้างให้สะอาด",
                "แยกชิ้นส่วน ฝาขวด ฉลาก ",
                "ทิ้งในถังขยะสำหรับนำไปรีไซเคิล (ถังสีเหลือง)"
                
            ],
            separationComponents: [
                {
                    originalImage: "", 
                    componentImage: "", // รูปขวดเปล่า
                    materialName: "ขวดพลาสติกใส (PET)",
                    recommendation: "คำแนะนำ: ขวดพลาสติก"
                },
                {
                    originalImage: "",
                    componentImage: "", // รูปฉลาก/โลโก้
                    materialName: "ฟิล์มหด PVC",
                    recommendation: "คำแนะนำ: ฉลากพลาสติก"
                },
                {
                    originalImage: "",
                    componentImage: "", // รูปฝาขวด
                    materialName: "ฝาขวด (HDPE/PP)",
                    recommendation: "คำแนะนำ: ฝาขวด"
                }
            ]
        }
    },
];