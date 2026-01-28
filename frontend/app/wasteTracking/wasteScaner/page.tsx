'use client';

import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';
import { NotFoundException, Result } from '@zxing/library';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import MenuBar from '@/components/wasteTracking/MenuBar';

export default function ScanBarcodePage() {
    const router = useRouter();
    const videoRef = useRef<HTMLVideoElement>(null);
    const controlsRef = useRef<IScannerControls | null>(null);
    const [errorMsg, setErrorMsg] = useState<string>('');
    
    const [isScanning, setIsScanning] = useState(true); 

    useEffect(() => {
        const codeReader = new BrowserMultiFormatReader();
        let mounted = true;

        const startScanning = async () => {
            try {
                // เลือกกล้องหลัง
                const videoInputDevices = await BrowserMultiFormatReader.listVideoInputDevices();
                const selectedDeviceId = videoInputDevices.find(device => 
                    device.label.toLowerCase().includes('back') || 
                    device.label.toLowerCase().includes('rear')
                )?.deviceId || videoInputDevices[0].deviceId;

                if (!mounted || !videoRef.current) return;

                // เริ่มสแกน
                const controls = await codeReader.decodeFromVideoDevice(
                    selectedDeviceId,
                    videoRef.current,
                    (result: Result | undefined | null, error: unknown) => {
                        if (result && mounted) {
                            const currentText = result.getText();
                            
                            controls.stop();
                            mounted = false; 
                            setIsScanning(false);

                            console.log('Scanned:', currentText);

                            router.push(`/wasteTracking/wasteScaner/id=${encodeURIComponent(currentText)}`);
                            return;
                        }
                        
                        if (error && !(error instanceof NotFoundException)) {
                            // ignore default errors
                        }
                    }
                );

                if (mounted) {
                    controlsRef.current = controls;
                } else {
                    controls.stop();
                }

            } catch (err) {
                console.error("Error starting scanner:", err);
                setErrorMsg("ไม่สามารถเปิดกล้องได้ กรุณาอนุญาตการเข้าถึง");
            }
        };

        if (isScanning) {
            startScanning();
        }

        return () => {
            mounted = false;
            if (controlsRef.current) {
                controlsRef.current.stop();
                controlsRef.current = null;
            }
        };
    }, [router, isScanning]); 

    return (
        <div className="fixed inset-0 bg-black z-0 flex flex-col">
            
            <video 
                ref={videoRef} 
                className="absolute inset-0 w-full h-full object-cover" 
                muted 
                playsInline 
            />

            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
                
                <div className="relative w-[280px] h-[280px] rounded-3xl shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                    
                    <div className="absolute top-0 left-0 w-10 h-10 border-l-[6px] border-t-[6px] border-white rounded-tl-2xl -translate-x-1 -translate-y-1"></div>
                    <div className="absolute top-0 right-0 w-10 h-10 border-r-[6px] border-t-[6px] border-white rounded-tr-2xl translate-x-1 -translate-y-1"></div>
                    <div className="absolute bottom-0 left-0 w-10 h-10 border-l-[6px] border-b-[6px] border-white rounded-bl-2xl -translate-x-1 translate-y-1"></div>
                    <div className="absolute bottom-0 right-0 w-10 h-10 border-r-[6px] border-b-[6px] border-white rounded-br-2xl translate-x-1 translate-y-1"></div>

                    {isScanning && (
                        <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse"></div>
                    )}
                </div>

                <p className="mt-8 text-white/90 text-sm font-medium drop-shadow-md">
                    วางบาร์โค้ดให้อยู่ในกรอบเพื่อสแกน
                </p>

                {errorMsg && (
                    <div className="absolute bottom-32 px-4 py-2 bg-red-500/80 rounded-full">
                        <p className="text-white text-sm">{errorMsg}</p>
                    </div>
                )}
            </div>

            {!isScanning && (
                <div className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center text-white backdrop-blur-sm">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mb-4"></div>
                    <span className="text-lg font-medium">กำลังตรวจสอบข้อมูล...</span>
                </div>
            )}

            <button 
                onClick={() => {
                    controlsRef.current?.stop();
                    router.back();
                }}
                className="absolute top-6 left-6 z-20 bg-white/30 backdrop-blur-md p-2.5 rounded-xl border border-white/20 shadow-lg active:scale-95 transition-transform"
            >
                <ChevronLeft className="text-white" size={28} />
            </button>
            <div className="absolute bottom-0 w-full z-20">
                <MenuBar activeTab="recycle" />
            </div>
        </div>
    );
}