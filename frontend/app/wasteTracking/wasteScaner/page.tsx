'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import MenuBar from '@/components/wasteTracking/MenuBar';

export default function ScanBarcodePage() {
    const router = useRouter();
    const [scanError, setScanError] = useState<string | null>(null);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const isStartedRef = useRef(false); 
    const handleStop = async () => {
        if (scannerRef.current) {
            try {
                if (scannerRef.current.isScanning) {
                    await scannerRef.current.stop();
                }
                scannerRef.current.clear();
                isStartedRef.current = false;
            } catch (err) {
                console.error("Failed to stop scanner", err);
            }
        }
    };
    useEffect(() => {
        
        const formatsToSupport = [
            Html5QrcodeSupportedFormats.QR_CODE,
            Html5QrcodeSupportedFormats.EAN_13, 
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
        ];

        const elementId = "reader";
        
        const startScanner = async () => {
            if (document.getElementById(elementId) && !isStartedRef.current) {
                
                const html5QrCode = new Html5Qrcode(elementId);
                scannerRef.current = html5QrCode;

                try {
                    const config = { 
                        fps: 10, 
                        qrbox: { width: 250, height: 250 },
                        aspectRatio: 1.0, 
                        formatsToSupport: formatsToSupport 
                    };
                    await html5QrCode.start(
                        { facingMode: "environment" }, 
                        config,
                        (decodedText) => {
                            console.log("Scan Success:", decodedText);
                            handleStop(); 
                            alert(`สแกนได้แล้ว! รหัส: ${decodedText}`);
                            router.push('/wasteTracking/wasteSorting/carbonSummary');
                        },
                        () => {
                        }
                    );
                    isStartedRef.current = true; 

                } catch (err) {
                    console.error("Error starting scanner:", err);
                    setScanError("ไม่สามารถเปิดกล้องได้: " + err);
                }
            }
        };

        startScanner();

        return () => {
            if (isStartedRef.current) {
                handleStop();
            }
        };
    }, [router]);

    

    return (
        <div className="relative h-screen w-full bg-black overflow-hidden flex flex-col">
            
            {scanError && (
                <div className="absolute top-20 left-0 w-full z-50 text-white text-center bg-red-500/80 p-2">
                    {scanError}
                </div>
            )}

            <div className="flex-1 relative bg-black">
                <div id="reader" className="w-full h-full"></div>
            </div>

            {/* <div className="absolute inset-0 z-10 pointer-events-none flex flex-col items-center justify-center">
                <div className="relative w-64 h-64">
                    <div className="absolute w-full h-0.5 bg-red-500/80 top-1/2 animate-pulse shadow-[0_0_8px_rgba(255,0,0,0.8)]"></div>
                </div>
                <p className="text-white mt-4 text-sm font-light drop-shadow-md">
                    วางบาร์โค้ดให้อยู่ในกรอบ
                </p>
            </div> */}

            <button 
                onClick={() => {
                    handleStop();
                    router.back();
                }}
                className="absolute top-6 left-6 z-20 bg-white p-2 rounded-xl shadow-lg active:scale-95 transition-transform cursor-pointer pointer-events-auto"
            >
                <ChevronLeft className="text-green-700" size={24} />
            </button>
            <MenuBar activeTab="recycle" />

             <style jsx global>{`
                #reader {
                    width: 100%;
                    height: 100%;
                    background: #000;
                }
                #reader video {
                    width: 100% !important;
                    height: 100% !important;
                    object-fit: cover !important;
                }
            `}</style>
        </div>
    );
}