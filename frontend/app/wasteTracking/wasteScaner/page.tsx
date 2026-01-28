'use client';

import { useEffect, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from "html5-qrcode"; 
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import MenuBar from '@/components/wasteTracking/MenuBar';

export default function ScanBarcodePage() {
    const router = useRouter();
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    useEffect(() => {
        if (scannerRef.current) return;

        const scanner = new Html5QrcodeScanner(
            "reader", 
            { 
                fps: 10, 
                qrbox: 250,
                aspectRatio: 1.0,
                formatsToSupport: [
                    Html5QrcodeSupportedFormats.QR_CODE,
                    Html5QrcodeSupportedFormats.EAN_13, 
                    Html5QrcodeSupportedFormats.EAN_8,
                    Html5QrcodeSupportedFormats.CODE_128,
                    Html5QrcodeSupportedFormats.UPC_A
                ]
            },
            false 
        );
        
        scannerRef.current = scanner;

        function onScanSuccess(decodedText: string, decodedResult: unknown) {
            console.log(`Scan result: ${decodedText}`, decodedResult);
            
            scanner.clear().catch(err => console.error("Failed to clear scanner", err));
            scannerRef.current = null; 

            alert(`สแกนสำเร็จ! รหัส: ${decodedText}`);
            // router.push(`/wasteTracking/wasteSorting/carbonSummary?code=${decodedText}`);
        }

        function onScanError(error: unknown) {
            const errorMessage = String(error);

            if (errorMessage.includes("NotFoundException")) {
                return;
            }
        }

        scanner.render(onScanSuccess, onScanError);

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(error => {
                    console.error("Failed to clear html5QrcodeScanner. ", error);
                });
                scannerRef.current = null;
            }
        };
    }, [router]);

    return (
        <div className="min-h-screen bg-black flex flex-col">
            
            <button 
                onClick={() => router.back()}
                className="absolute top-6 left-6 z-20 bg-white p-2 rounded-xl shadow-lg active:scale-95 transition-transform"
            >
                <ChevronLeft className="text-green-700" size={24} />
            </button>

            <div className="flex-1 flex flex-col justify-center items-center px-4 pt-16">
                <div className="bg-white p-4 rounded-2xl w-full max-w-md shadow-2xl">
                    <h2 className="text-center text-lg font-bold mb-4 text-gray-700">สแกนบาร์โค้ด/QR Code</h2>
                    
                    <div id="reader" className="w-full"></div>
                    
                    <p className="text-center text-sm text-gray-500 mt-4">
                        หากสแกนไม่ติด ให้ลองขยับมือถือเข้า-ออก หรือหมุนแนวนอน
                    </p>
                </div>
            </div>

            <MenuBar activeTab="recycle" />
        </div>
    );
}