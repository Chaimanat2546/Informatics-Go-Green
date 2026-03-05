'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';
import { NotFoundException, Result, DecodeHintType, BarcodeFormat } from '@zxing/library';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Keyboard, ZoomIn, ZoomOut, Flashlight, FlashlightOff } from 'lucide-react';
import MenuBar from '@/components/wasteTracking/MenuBar';

export default function ScanBarcodePage() {
    const router = useRouter();
    const videoRef = useRef<HTMLVideoElement>(null);
    const controlsRef = useRef<IScannerControls | null>(null);
    const [errorMsg, setErrorMsg] = useState<string>('');
    const [isScanning, setIsScanning] = useState(true);
    const [showManualInput, setShowManualInput] = useState(false);
    const [manualBarcode, setManualBarcode] = useState('');
    const [torchOn, setTorchOn] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [hasFlash, setHasFlash] = useState(false);
    const [permissionStatus, setPermissionStatus] = useState<'pending' | 'granted' | 'denied'>('pending');

    // Handle successful scan
    const handleScan = useCallback((barcode: string) => {
        if (!barcode) return;
        controlsRef.current?.stop();
        setIsScanning(false);
        router.push(`/wasteTracking/wasteScaner/id=${encodeURIComponent(barcode)}`);
    }, [router]);

    // Toggle flashlight/torch
    const toggleTorch = useCallback(async () => {
        if (!videoRef.current?.srcObject) return;
        
        try {
            const stream = videoRef.current.srcObject as MediaStream;
            const track = stream.getVideoTracks()[0];
            const capabilities = track.getCapabilities() as any;
            
            if (capabilities.torch) {
                await track.applyConstraints({
                    advanced: [{ torch: !torchOn }] as any
                });
                setTorchOn(!torchOn);
            }
        } catch (err) {
            console.error('Torch error:', err);
        }
    }, [torchOn]);

    // Check flash availability after stream starts
    const checkFlashAvailability = useCallback(() => {
        if (!videoRef.current?.srcObject) return;
        
        try {
            const stream = videoRef.current.srcObject as MediaStream;
            const track = stream.getVideoTracks()[0];
            const capabilities = track.getCapabilities() as any;
            setHasFlash(!!capabilities.torch);
        } catch (err) {
            console.error('Check flash error:', err);
        }
    }, []);

    // Handle manual input submit
    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (manualBarcode.trim()) {
            handleScan(manualBarcode.trim());
        }
    };

    // Request camera permission explicitly
    const requestCameraPermission = async () => {
        try {
            // First, explicitly request permission
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach(track => track.stop()); // Stop immediately, just for permission
            setPermissionStatus('granted');
            return true;
        } catch (err) {
            console.error('Camera permission denied:', err);
            setPermissionStatus('denied');
            setErrorMsg('ไม่สามารถเข้าถึงกล้องได้ กรุณาอนุญาตการใช้งานกล้องในเบราว์เซอร์');
            return false;
        }
    };

    // Main scanning effect
    useEffect(() => {
        if (!isScanning || showManualInput) return;

        // Create hints for better scanning
        const hints = new Map();
        hints.set(DecodeHintType.TRY_HARDER, true);
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [
            BarcodeFormat.EAN_13,
            BarcodeFormat.EAN_8,
            BarcodeFormat.UPC_A,
            BarcodeFormat.UPC_E,
            BarcodeFormat.CODE_128,
            BarcodeFormat.CODE_39,
            BarcodeFormat.QR_CODE,
            BarcodeFormat.DATA_MATRIX
        ]);

        const codeReader = new BrowserMultiFormatReader(hints);
        let mounted = true;

        const startScanning = async () => {
            // Request permission first
            const hasPermission = await requestCameraPermission();
            if (!hasPermission || !mounted) return;

            try {
                const videoInputDevices = await BrowserMultiFormatReader.listVideoInputDevices();
                
                if (videoInputDevices.length === 0) {
                    setErrorMsg('ไม่พบกล้องบนอุปกรณ์นี้');
                    return;
                }

                // Sort cameras: prioritize back/rear cameras
                const sortedDevices = videoInputDevices.sort((a, b) => {
                    const aLabel = a.label.toLowerCase();
                    const bLabel = b.label.toLowerCase();
                    const aIsBack = aLabel.includes('back') || aLabel.includes('rear') || aLabel.includes('environment');
                    const bIsBack = bLabel.includes('back') || bLabel.includes('rear') || bLabel.includes('environment');
                    return (bIsBack ? 1 : 0) - (aIsBack ? 1 : 0);
                });

                const selectedDeviceId = sortedDevices[0]?.deviceId;

                if (!selectedDeviceId) {
                    setErrorMsg('ไม่พบกล้องที่เหมาะสม');
                    return;
                }

                if (!mounted || !videoRef.current) return;

                const controls = await codeReader.decodeFromVideoDevice(
                    selectedDeviceId,
                    videoRef.current,
                    (result: Result | undefined | null, error: unknown) => {
                        if (result && mounted) {
                            const currentText = result.getText();
                            handleScan(currentText);
                            return;
                        }
                        
                        if (error && !(error instanceof NotFoundException)) {
                            // Silent ignore for normal scanning errors
                        }
                    }
                );

                if (mounted) {
                    controlsRef.current = controls;
                    // Check flash availability after stream starts
                    setTimeout(checkFlashAvailability, 500);
                } else {
                    controls.stop();
                }

            } catch (err: any) {
                console.error("Error starting scanner:", err);
                if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                    setErrorMsg('กรุณาอนุญาตการเข้าถึงกล้องในการตั้งค่าเบราว์เซอร์');
                    setPermissionStatus('denied');
                } else if (err.name === 'NotFoundError') {
                    setErrorMsg('ไม่พบกล้องบนอุปกรณ์นี้');
                } else {
                    setErrorMsg('ไม่สามารถเปิดกล้องได้ กรุณาลองใหม่อีกครั้ง');
                }
            }
        };

        startScanning();

        return () => {
            mounted = false;
            if (controlsRef.current) {
                controlsRef.current.stop();
                controlsRef.current = null;
            }
        };
    }, [isScanning, showManualInput, handleScan, checkFlashAvailability]);

    // Permission denied view
    if (permissionStatus === 'denied') {
        return (
            <div className="fixed inset-0 bg-black z-0 flex flex-col items-center justify-center p-6 text-white">
                <div className="text-center max-w-sm">
                    <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FlashlightOff size={40} className="text-red-400" />
                    </div>
                    <h2 className="text-xl font-bold mb-3">ไม่สามารถเข้าถึงกล้องได้</h2>
                    <p className="text-white/70 mb-6">
                        กรุณาอนุญาตการใช้งานกล้องในการตั้งค่าเบราว์เซอร์ หรือใช้การกรอกบาร์โค้ดเอง
                    </p>
                    <button
                        onClick={() => {
                            setPermissionStatus('pending');
                            setErrorMsg('');
                            window.location.reload();
                        }}
                        className="w-full py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors mb-3"
                    >
                        ลองใหม่อีกครั้ง
                    </button>
                    <button
                        onClick={() => setShowManualInput(true)}
                        className="w-full py-3 bg-white/20 text-white rounded-xl font-medium hover:bg-white/30 transition-colors"
                    >
                        กรอกบาร์โค้ดเอง
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black z-0 flex flex-col">
            {/* Video with zoom */}
            <video 
                ref={videoRef} 
                className="absolute inset-0 w-full h-full object-cover"
                style={{ transform: `scale(${zoom})` }}
                muted 
                playsInline
                autoPlay
            />

            {/* Scan Frame Overlay */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
                {/* Larger frame: 320px mobile, 400px desktop */}
                <div className="relative w-[320px] h-[320px] md:w-[400px] md:h-[400px] rounded-3xl shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]">
                    {/* Corner markers */}
                    <div className="absolute top-0 left-0 w-12 h-12 border-l-[6px] border-t-[6px] border-green-500 rounded-tl-2xl -translate-x-1 -translate-y-1"></div>
                    <div className="absolute top-0 right-0 w-12 h-12 border-r-[6px] border-t-[6px] border-green-500 rounded-tr-2xl translate-x-1 -translate-y-1"></div>
                    <div className="absolute bottom-0 left-0 w-12 h-12 border-l-[6px] border-b-[6px] border-green-500 rounded-bl-2xl -translate-x-1 translate-y-1"></div>
                    <div className="absolute bottom-0 right-0 w-12 h-12 border-r-[6px] border-b-[6px] border-green-500 rounded-br-2xl translate-x-1 translate-y-1"></div>
                    
                    {/* Grid overlay */}
                    <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
                        {[...Array(9)].map((_, i) => (
                            <div key={i} className="border border-white/10" />
                        ))}
                    </div>
                    
                    {/* Center crosshair */}
                    <div className="absolute top-1/2 left-1/2 w-4 h-4 -translate-x-1/2 -translate-y-1/2">
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-green-500/50 -translate-y-1/2"></div>
                        <div className="absolute top-0 left-1/2 w-0.5 h-full bg-green-500/50 -translate-x-1/2"></div>
                    </div>

                    {/* Laser scan line */}
                    {isScanning && (
                        <div className="absolute top-0 left-4 right-4 h-0.5 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-[scan_2s_ease-in-out_infinite]"></div>
                    )}
                </div>

                <p className="mt-6 text-white/90 text-sm font-medium drop-shadow-md">
                    วางบาร์โค้ดให้อยู่ในกรอบเพื่อสแกน
                </p>
            </div>

            {/* Top Controls */}
            <div className="absolute top-0 left-0 right-0 z-20 p-4 pt-6 flex justify-between items-start">
                <button 
                    onClick={() => {
                        controlsRef.current?.stop();
                        router.push("/wasteTracking/home");
                    }}
                    className="bg-white/20 backdrop-blur-md p-2.5 rounded-xl border border-white/20 shadow-lg active:scale-95 transition-transform"
                >
                    <ChevronLeft className="text-white" size={24} />
                </button>

                {/* Torch button */}
                {hasFlash && (
                    <button 
                        onClick={toggleTorch}
                        className={`p-2.5 rounded-xl border border-white/20 shadow-lg active:scale-95 transition-all ${
                            torchOn ? 'bg-yellow-500/80' : 'bg-white/20 backdrop-blur-md'
                        }`}
                    >
                        {torchOn ? (
                            <Flashlight className="text-white" size={24} />
                        ) : (
                            <FlashlightOff className="text-white" size={24} />
                        )}
                    </button>
                )}
            </div>

            {/* Zoom Controls */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2">
                <button 
                    onClick={() => setZoom(prev => Math.min(prev + 0.5, 3))}
                    className="bg-white/20 backdrop-blur-md p-2 rounded-xl border border-white/20 shadow-lg active:scale-95 transition-transform"
                >
                    <ZoomIn className="text-white" size={20} />
                </button>
                <div className="bg-black/50 backdrop-blur-md px-2 py-1 rounded-lg text-center">
                    <span className="text-white text-xs font-medium">{zoom.toFixed(1)}x</span>
                </div>
                <button 
                    onClick={() => setZoom(prev => Math.max(prev - 0.5, 1))}
                    className="bg-white/20 backdrop-blur-md p-2 rounded-xl border border-white/20 shadow-lg active:scale-95 transition-transform"
                >
                    <ZoomOut className="text-white" size={20} />
                </button>
            </div>

            {/* Manual Input Modal */}
            {showManualInput && (
                <div className="absolute inset-0 z-40 bg-black/90 flex flex-col items-center justify-center p-6">
                    <div className="w-full max-w-sm bg-white rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Keyboard className="text-green-600" size={28} />
                            <h3 className="text-xl font-bold text-gray-800">กรอกบาร์โค้ด</h3>
                        </div>
                        <form onSubmit={handleManualSubmit}>
                            <input
                                type="text"
                                value={manualBarcode}
                                onChange={(e) => setManualBarcode(e.target.value)}
                                placeholder="เช่น 8851234567890"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-lg text-center tracking-wider focus:border-green-500 focus:outline-none mb-4"
                                autoFocus
                            />
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowManualInput(false);
                                        setManualBarcode('');
                                    }}
                                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    type="submit"
                                    disabled={!manualBarcode.trim()}
                                    className="flex-1 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    ค้นหา
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {errorMsg && (
                <div className="absolute top-24 left-4 right-4 z-30">
                    <div className="bg-red-500/90 backdrop-blur-md px-4 py-3 rounded-xl text-center">
                        <p className="text-white text-sm font-medium">{errorMsg}</p>
                    </div>
                </div>
            )}

            {/* Loading Overlay */}
            {!isScanning && !showManualInput && (
                <div className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center text-white backdrop-blur-sm">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mb-4"></div>
                    <span className="text-lg font-medium">กำลังตรวจสอบข้อมูล...</span>
                </div>
            )}

            {/* Bottom Controls */}
            <div className="absolute bottom-20 left-0 right-0 z-20 px-4">
                <button
                    onClick={() => {
                        setShowManualInput(true);
                        controlsRef.current?.stop();
                    }}
                    className="w-full bg-white/20 backdrop-blur-md py-3 rounded-xl border border-white/20 text-white font-medium hover:bg-white/30 transition-colors flex items-center justify-center gap-2"
                >
                    <Keyboard size={18} />
                    กรอกบาร์โค้ดเอง
                </button>
            </div>

            {/* Menu Bar */}
            <div className="absolute bottom-0 w-full z-20">
                <MenuBar activeTab="recycle" />
            </div>

            {/* CSS for scan animation */}
            <style jsx>{`
                @keyframes scan {
                    0%, 100% { top: 0; }
                    50% { top: 100%; }
                }
            `}</style>
        </div>
    );
}
