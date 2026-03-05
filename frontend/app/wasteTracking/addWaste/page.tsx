'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import MenuBar from '@/components/wasteTracking/MenuBar';
import { toast } from 'sonner';
import {
    ChevronLeft,
    Plus,
    Trash2,
    Loader2,
    ImagePlus,
    CheckCircle2,
} from 'lucide-react';

interface CategoryOption {
    id: number;
    name: string;
}

interface MaterialOption {
    id: number;
    name: string;
}

interface MaterialGuideInput {
    waste_meterialid: number;
    recommendation: string;
    weight: string;
    guideImageFile: File | null;
    guideImagePreview: string;
}

export default function AddWastePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const barcodeFromUrl = searchParams.get('barcode') || '';

    // Step state
    const [currentStep, setCurrentStep] = useState(1);

    // Step 1: Waste info
    const [name, setName] = useState('');
    const [barcode, setBarcode] = useState(barcodeFromUrl);
    const [wasteCategoryId, setWasteCategoryId] = useState<number>(0);
    const [wasteImageFile, setWasteImageFile] = useState<File | null>(null);
    const [wasteImagePreview, setWasteImagePreview] = useState('');

    // Step 2: Material guides
    const [materialGuides, setMaterialGuides] = useState<MaterialGuideInput[]>([
        { waste_meterialid: 0, recommendation: '', weight: '', guideImageFile: null, guideImagePreview: '' },
    ]);

    // Dropdown data
    const [categories, setCategories] = useState<CategoryOption[]>([]);
    const [materials, setMaterials] = useState<MaterialOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

    // Fetch categories and materials
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [catRes, matRes] = await Promise.all([
                    fetch(`${API_URL}/waste/categories`),
                    fetch(`${API_URL}/waste/waste-materials`),
                ]);
                if (catRes.ok) {
                    const catData = await catRes.json();
                    setCategories(catData.data || catData || []);
                }
                if (matRes.ok) {
                    const matData = await matRes.json();
                    setMaterials(matData.data || matData || []);
                }
            } catch (e) {
                console.error('Error fetching dropdown data:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [API_URL]);

    // Image handlers
    const handleWasteImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setWasteImageFile(file);
            setWasteImagePreview(URL.createObjectURL(file));
        }
    };

    const handleGuideImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const updated = [...materialGuides];
            updated[index].guideImageFile = file;
            updated[index].guideImagePreview = URL.createObjectURL(file);
            setMaterialGuides(updated);
        }
    };

    // Material guide CRUD
    const addMaterialGuide = () => {
        setMaterialGuides([
            ...materialGuides,
            { waste_meterialid: 0, recommendation: '', weight: '', guideImageFile: null, guideImagePreview: '' },
        ]);
    };

    const removeMaterialGuide = (index: number) => {
        if (materialGuides.length <= 1) {
            toast.error('ต้องมีส่วนประกอบอย่างน้อย 1 รายการ');
            return;
        }
        setMaterialGuides(materialGuides.filter((_, i) => i !== index));
    };

    const updateMaterialGuide = (index: number, field: string, value: string | number) => {
        const updated = [...materialGuides];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (updated[index] as any)[field] = value;
        setMaterialGuides(updated);
    };

    // Validation
    const isStep1Valid = () => {
        return name.trim() !== '' && wasteCategoryId > 0;
    };

    const isStep2Valid = () => {
        return materialGuides.every(
            (g) => g.waste_meterialid > 0 && g.recommendation.trim() !== ''
        );
    };

    // Submit
    const handleSubmit = async () => {
        if (!isStep2Valid()) {
            toast.error('กรุณากรอกข้อมูลส่วนประกอบให้ครบถ้วน');
            return;
        }

        setSubmitting(true);
        try {
            // Get user id from localStorage
            let userId: number | undefined;
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    const parsed = JSON.parse(storedUser);
                    userId = parsed.id;
                } catch { /* ignore */ }
            }

            const formData = new FormData();

            // Build JSON body
            const jsonPayload = {
                name: name.trim(),
                wasteCategoryId,
                barcode: barcode ? Number(barcode) : undefined,
                userid: userId,
                materialGuides: materialGuides.map((g) => ({
                    waste_meterialid: g.waste_meterialid,
                    recommendation: g.recommendation,
                    weight: g.weight ? parseFloat(g.weight) : undefined,
                })),
            };
            formData.append('data', JSON.stringify(jsonPayload));

            // Append files: first = waste_image, then guide images in order
            if (wasteImageFile) {
                formData.append('files', wasteImageFile);
            }
            materialGuides.forEach((g) => {
                if (g.guideImageFile) {
                    formData.append('files', g.guideImageFile);
                }
            });

            const res = await fetch(`${API_URL}/waste/with-guides`, {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                const errMsg = (errorData as Record<string, string>).message || 'เกิดข้อผิดพลาดในการบันทึก';
                throw new Error(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
            }

            toast.success('เพิ่มข้อมูลขยะสำเร็จ!', {
                description: 'ข้อมูลถูกบันทึกลงในระบบแล้ว',
            });

            setTimeout(() => {
                router.push('/wasteTracking/home');
            }, 1200);
        } catch (err: unknown) {
            const error = err as Error;
            console.error('Submit error:', error);
            toast.error('บันทึกไม่สำเร็จ', { description: error.message });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col h-screen items-center justify-center bg-gray-50">
                <Loader2 className="h-10 w-10 animate-spin text-green-600 mb-4" />
                <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-4 pt-8 pb-12 relative">
                <button
                    onClick={() => router.back()}
                    className="absolute top-6 left-4 bg-white/20 backdrop-blur-md p-2 rounded-xl border border-white/20"
                >
                    <ChevronLeft className="text-white" size={24} />
                </button>
                <h1 className="text-white text-xl font-bold text-center mt-2">เพิ่มข้อมูลขยะ</h1>
                <p className="text-white/80 text-sm text-center mt-1">กรอกข้อมูลเพื่อเพิ่มขยะเข้าระบบ</p>
            </div>

            {/* Stepper indicator */}
            <div className="flex items-center justify-center gap-4 -mt-5 relative z-10 mx-6">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm shadow-md transition-all ${currentStep >= 1 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {currentStep > 1 ? <CheckCircle2 size={20} /> : '1'}
                </div>
                <div className={`h-1 w-16 rounded-full transition-all ${currentStep >= 2 ? 'bg-green-600' : 'bg-gray-200'}`} />
                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm shadow-md transition-all ${currentStep >= 2 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    2
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 px-4 pb-28 mt-4">
                {/* ===== STEP 1: Waste Info ===== */}
                {currentStep === 1 && (
                    <Card className="p-5 rounded-2xl shadow-sm border-none bg-white">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 border-l-4 border-green-600 pl-3">
                            ข้อมูลทั่วไปของขยะ
                        </h2>

                        {/* Waste image upload */}
                        <div className="mb-4">
                            <Label className="text-sm font-medium text-gray-700 mb-2 block">รูปภาพขยะ</Label>
                            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-green-500 hover:bg-green-50/50 transition-colors overflow-hidden">
                                {wasteImagePreview ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={wasteImagePreview} alt="Preview" className="w-full h-full object-contain" />
                                ) : (
                                    <div className="flex flex-col items-center text-gray-400">
                                        <ImagePlus size={36} />
                                        <span className="text-sm mt-2">แตะเพื่ออัปโหลดรูป</span>
                                    </div>
                                )}
                                <input type="file" accept="image/*" className="hidden" onChange={handleWasteImageChange} />
                            </label>
                        </div>

                        {/* Name */}
                        <div className="mb-4">
                            <Label htmlFor="wasteName" className="text-sm font-medium text-gray-700 mb-1 block">ชื่อขยะ *</Label>
                            <Input
                                id="wasteName"
                                placeholder="เช่น ขวดน้ำชาเขียว 500ml"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="h-12"
                            />
                        </div>

                        {/* Category */}
                        <div className="mb-4">
                            <Label htmlFor="wasteCategory" className="text-sm font-medium text-gray-700 mb-1 block">หมวดหมู่ *</Label>
                            <select
                                id="wasteCategory"
                                value={wasteCategoryId}
                                onChange={(e) => setWasteCategoryId(Number(e.target.value))}
                                className="w-full h-12 px-3 rounded-lg border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                <option value={0}>-- เลือกหมวดหมู่ --</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Barcode */}
                        <div className="mb-4">
                            <Label htmlFor="wasteBarcode" className="text-sm font-medium text-gray-700 mb-1 block">บาร์โค้ด (ถ้ามี)</Label>
                            <Input
                                id="wasteBarcode"
                                placeholder="เช่น 8851234567890"
                                value={barcode}
                                onChange={(e) => setBarcode(e.target.value)}
                                className="h-12"
                                type="number"
                            />
                        </div>

                        <Button
                            onClick={() => {
                                if (!isStep1Valid()) {
                                    toast.error('กรุณากรอกชื่อขยะและเลือกหมวดหมู่');
                                    return;
                                }
                                setCurrentStep(2);
                            }}
                            className="w-full h-12 bg-[#5EA500] hover:bg-green-700 text-white font-semibold text-base mt-2"
                        >
                            ถัดไป →
                        </Button>
                    </Card>
                )}

                {/* ===== STEP 2: Material Guides ===== */}
                {currentStep === 2 && (
                    <div className="space-y-4">
                        <Card className="p-5 rounded-2xl shadow-sm border-none bg-white">
                            <h2 className="text-lg font-bold text-gray-800 mb-1 border-l-4 border-green-600 pl-3">
                                ส่วนประกอบและวิธีแยก
                            </h2>
                            <p className="text-sm text-gray-500 mb-4 pl-4">ระบุชิ้นส่วนของขยะและวิธีการแยกแต่ละส่วน</p>
                        </Card>

                        {materialGuides.map((guide, index) => (
                            <Card key={index} className="p-4 rounded-2xl shadow-sm border border-green-100 bg-white relative">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="bg-green-100 text-green-700 text-sm font-bold px-3 py-1 rounded-full">
                                        ชิ้นส่วนที่ {index + 1}
                                    </span>
                                    {materialGuides.length > 1 && (
                                        <button
                                            onClick={() => removeMaterialGuide(index)}
                                            className="text-red-400 hover:text-red-600 p-1"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>

                                {/* Guide image */}
                                <div className="mb-3">
                                    <Label className="text-sm font-medium text-gray-700 mb-1 block">รูปชิ้นส่วน</Label>
                                    <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-green-400 transition-colors overflow-hidden">
                                        {guide.guideImagePreview ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={guide.guideImagePreview} alt="Guide" className="w-full h-full object-contain" />
                                        ) : (
                                            <div className="flex flex-col items-center text-gray-400">
                                                <ImagePlus size={28} />
                                                <span className="text-xs mt-1">อัปโหลดรูป</span>
                                            </div>
                                        )}
                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleGuideImageChange(index, e)} />
                                    </label>
                                </div>

                                {/* Material type */}
                                <div className="mb-3">
                                    <Label className="text-sm font-medium text-gray-700 mb-1 block">ประเภทวัสดุ *</Label>
                                    <select
                                        value={guide.waste_meterialid}
                                        onChange={(e) => updateMaterialGuide(index, 'waste_meterialid', Number(e.target.value))}
                                        className="w-full h-11 px-3 rounded-lg border border-gray-200 bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value={0}>-- เลือกประเภทวัสดุ --</option>
                                        {materials.map((mat) => (
                                            <option key={mat.id} value={mat.id}>{mat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Recommendation */}
                                <div className="mb-3">
                                    <Label className="text-sm font-medium text-gray-700 mb-1 block">คำแนะนำการแยก *</Label>
                                    <Textarea
                                        placeholder="เช่น เทน้ำออกให้หมด ลอกฉลาก และบีบขวดให้แบน"
                                        value={guide.recommendation}
                                        onChange={(e) => updateMaterialGuide(index, 'recommendation', e.target.value)}
                                        className="min-h-[80px] text-sm"
                                    />
                                </div>

                                {/* Weight */}
                                <div>
                                    <Label className="text-sm font-medium text-gray-700 mb-1 block">น้ำหนัก (kg)</Label>
                                    <Input
                                        type="number"
                                        step="0.001"
                                        placeholder="เช่น 0.02"
                                        value={guide.weight}
                                        onChange={(e) => updateMaterialGuide(index, 'weight', e.target.value)}
                                        className="h-11"
                                    />
                                </div>
                            </Card>
                        ))}

                        {/* Add more button */}
                        <button
                            onClick={addMaterialGuide}
                            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-green-300 rounded-2xl text-green-600 font-semibold hover:bg-green-50 transition-colors"
                        >
                            <Plus size={20} />
                            เพิ่มส่วนประกอบ
                        </button>

                        {/* Action buttons */}
                        <div className="flex gap-3 mt-4">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentStep(1)}
                                className="flex-1 h-12 text-base border-gray-300"
                            >
                                ← ย้อนกลับ
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="flex-1 h-12 bg-[#5EA500] hover:bg-green-700 text-white text-base font-semibold"
                            >
                                {submitting ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    'บันทึกข้อมูล'
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom nav */}
            <div className="fixed bottom-0 w-full z-20">
                <MenuBar activeTab="recycle" />
            </div>
        </div>
    );
}
