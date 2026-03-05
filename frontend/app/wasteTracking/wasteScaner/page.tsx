'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';
import { NotFoundException, Result, DecodeHintType, BarcodeFormat } from '@zxing/library';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Keyboard, ZoomIn, ZoomOut, Flashlight, FlashlightOff, Camera, AlertCircle } from 'lucide-react';
import MenuBar from '@/components/wasteTracking/MenuBar';
import { toast } from 'sonner';

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
    const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
    const [currentDeviceIndex, setCurrentDeviceIndex] = useState(0);
    const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
    const [manualError, setManualError] = useState('');

    // Validate EAN-13 check digit
    const isValidEAN13 = (barcode: string): boolean => {
        if (!/^\d{13}$/.test(barcode)) return false;
        let sum = 0;
        for (let i = 0; i < 12; i++) {
            sum += parseInt(barcode[i]) * (i % 2 === 0 ? 1 : 3);
        }
        const checkDigit = (10 - (sum % 10)) % 10;
        return checkDigit === parseInt(barcode[12]);
    };

    // Handle successful scan
    const handleScan = useCallback((barcode: string) => {
        if (!barcode) return;
        
        // Clean barcode
        const cleanBarcode = barcode.trim().replace(/\s/g, '');
        
        // Validate EAN-13
        if (!/^\d{8}(\d{5})?$/.test(cleanBarcode)) {
            console.log('Invalid barcode format:', cleanBarcode);
            return; // ไม่ใช่ EAN-8 หรือ EAN-13
        }
        
        if (cleanBarcode.length === 13 && !isValidEAN13(cleanBarcode)) {
            console.log('Invalid EAN-13 check digit:', cleanBarcode);
            return; // Check digit ผิด
        }
        
        console.log('Valid barcode:', cleanBarcode);
        controlsRef.current?.stop();
        setIsScanning(false);
        router.push(`/wasteTracking/wasteScaner/id=${encodeURIComponent(cleanBarcode)}`);
    }, [router]);

    // Toggle flashlight/torch
    const toggleTorch = useCallback(async () => {
        if (!videoRef.current?.srcObject) return;
        
        try {
            const stream = videoRef.current.srcObject as MediaStream;
            const track = stream.getVideoTracks()[0];
            const capabilities = track.getCapabilities() as MediaTrackCapabilities & { torch?: boolean };
            
            if (capabilities.torch) {
                await track.applyConstraints({
                    advanced: [{ torch: !torchOn } as MediaTrackConstraintSet]
                } as MediaTrackConstraints);
                setTorchOn(!torchOn);
            }
        } catch (err) {
            console.error('Torch error:', err);
        }
    }, [torchOn]);

    // Toggle camera (front/back)
    const switchCamera = useCallback(() => {
        if (videoDevices.length < 2) return;
        setCurrentDeviceIndex((prev) => (prev + 1) % videoDevices.length);
    }, [videoDevices.length]);

    // Get camera label for display
    const getCameraLabel = useCallback((index: number) => {
        const device = videoDevices[index];
        if (!device) return 'กล้อง';
        const label = device.label.toLowerCase();
        if (label.includes('back') || label.includes('rear') || label.includes('environment')) {
            return 'กล้องหลัง';
        }
        if (label.includes('front') || label.includes('user') || label.includes('selfie')) {
            return 'กล้องหน้า';
        }
        return `กล้อง ${index + 1}`;
    }, [videoDevices]);

    // Check flash availability after stream starts
    const checkFlashAvailability = useCallback(() => {
        if (!videoRef.current?.srcObject) return;
        
        try {
            const stream = videoRef.current.srcObject as MediaStream;
            const track = stream.getVideoTracks()[0];
            const capabilities = track.getCapabilities() as MediaTrackCapabilities & { torch?: boolean };
            setHasFlash(!!capabilities.torch);
        } catch (err) {
            console.error('Check flash error:', err);
        }
    }, []);

    // Handle manual input submit
    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setManualError('');
        const trimmed = manualBarcode.trim().replace(/\s/g, '');

        if (!trimmed) {
            setManualError('กรุณากรอกหมายเลขบาร์โค้ด');
            return;
        }

        if (!/^\d{8}(\d{5})?$/.test(trimmed)) {
            setManualError('รูปแบบบาร์โค้ดไม่ถูกต้อง (ต้องเป็นตัวเลข 8 หรือ 13 หลัก)');
            toast.error('บาร์โค้ดไม่ถูกต้อง', { description: 'กรุณากรอกบาร์โค้ด EAN-8 (8 หลัก) หรือ EAN-13 (13 หลัก)' });
            return;
        }

        if (trimmed.length === 13 && !isValidEAN13(trimmed)) {
            setManualError('เลข Check Digit ไม่ถูกต้อง กรุณาตรวจสอบบาร์โค้ดอีกครั้ง');
            toast.error('บาร์โค้ดไม่ถูกต้อง', { description: 'เลข Check Digit ไม่ตรง' });
            return;
        }

        handleScan(trimmed);
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

        // Create hints for better scanning - จำกัดเฉพาะ EAN-13 และ EAN-8 (สินค้าไทย)
        const hints = new Map();
        hints.set(DecodeHintType.TRY_HARDER, true);
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [
            BarcodeFormat.EAN_13,
            BarcodeFormat.EAN_8
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

                // Store devices and check if multiple cameras available
                setVideoDevices(videoInputDevices);
                setHasMultipleCameras(videoInputDevices.length > 1);

                // Sort cameras: prioritize back/rear cameras for initial selection
                const sortedDevices = videoInputDevices.sort((a, b) => {
                    const aLabel = a.label.toLowerCase();
                    const bLabel = b.label.toLowerCase();
                    const aIsBack = aLabel.includes('back') || aLabel.includes('rear') || aLabel.includes('environment');
                    const bIsBack = bLabel.includes('back') || bLabel.includes('rear') || bLabel.includes('environment');
                    return (bIsBack ? 1 : 0) - (aIsBack ? 1 : 0);
                });

                // Use current device index if available, otherwise use first (back camera)
                const selectedDeviceId = sortedDevices[currentDeviceIndex]?.deviceId || sortedDevices[0]?.deviceId;

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

            } catch (err: unknown) {
                console.error("Error starting scanner:", err);
                const error = err as { name?: string; message?: string };
                if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                    setErrorMsg('กรุณาอนุญาตการเข้าถึงกล้องในการตั้งค่าเบราว์เซอร์');
                    setPermissionStatus('denied');
                } else if (error.name === 'NotFoundError') {
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
    }, [isScanning, showManualInput, handleScan, checkFlashAvailability, currentDeviceIndex]);

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
                {hasMultipleCameras && (
                    <p className="mt-2 text-white/60 text-xs drop-shadow-md">
                        กำลังใช้: {getCameraLabel(currentDeviceIndex)}
                    </p>
                )}
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

                {/* Camera Switch Button */}
                {hasMultipleCameras && (
                    <button 
                        onClick={switchCamera}
                        className="bg-white/20 backdrop-blur-md p-2.5 rounded-xl border border-white/20 shadow-lg active:scale-95 transition-transform"
                        title={getCameraLabel(currentDeviceIndex)}
                    >
                        <Camera className="text-white" size={24} />
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
                                onChange={(e) => {
                                    setManualBarcode(e.target.value);
                                    if (manualError) setManualError('');
                                }}
                                placeholder="เช่น 8851234567890"
                                className={`w-full px-4 py-3 border-2 rounded-xl text-lg text-center tracking-wider focus:outline-none mb-1 ${
                                    manualError ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-green-500'
                                }`}
                                autoFocus
                            />
                            {manualError && (
                                <div className="flex items-center gap-1.5 mb-3 mt-1 px-1">
                                    <AlertCircle size={14} className="text-red-500 shrink-0" />
                                    <p className="text-red-500 text-xs">{manualError}</p>
                                </div>
                            )}
                            {!manualError && <div className="mb-3" />}
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowManualInput(false);
                                        setManualBarcode('');
                                        setManualError('');
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
                <div className="absolute top-24 left-4 right-4 z-30 animate-[fadeIn_0.3s_ease-out]">
                    <div className="bg-red-500/90 backdrop-blur-md px-4 py-3 rounded-xl flex items-center gap-2 justify-center">
                        <AlertCircle size={18} className="text-white shrink-0" />
                        <p className="text-white text-sm font-medium">{errorMsg}</p>
                    </div>
                    <button
                        onClick={() => setErrorMsg('')}
                        className="w-full mt-2 text-white/60 text-xs text-center hover:text-white/90 transition-colors"
                    >
                        ปิดข้อความนี้
                    </button>
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
