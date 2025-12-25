import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Copy, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

const QRCodeModal = ({ isOpen, onClose, url, eventName }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        console.log("Downloading QR V3 - Binary Force...");
        try {
            const container = document.getElementById('qr-code-canvas');
            const qrCanvas = container?.querySelector('canvas');

            if (!qrCanvas) {
                alert("Hata: QR Kod bulunamadı.");
                return;
            }

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            const padding = 60;
            const textSpace = 120;
            canvas.width = qrCanvas.width + (padding * 2);
            canvas.height = qrCanvas.height + padding + textSpace;

            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(qrCanvas, padding, padding);

            ctx.fillStyle = 'black';
            ctx.font = 'bold 28px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(eventName || 'Etkinlik', canvas.width / 2, qrCanvas.height + padding + 40);

            ctx.fillStyle = '#64748b';
            ctx.font = 'bold 16px sans-serif';
            ctx.fillText('ISTEK SAYFASI ICIN TARATIN', canvas.width / 2, qrCanvas.height + padding + 80);

            // Force octet-stream to help download managers recognize it as a file to be saved
            const pngData = canvas.toDataURL('image/png').replace("image/png", "application/octet-stream");

            const cleanName = (eventName || 'qr')
                .replace(/[^a-zA-Z0-9]/g, '')
                .substring(0, 20);

            const fileName = `qr_${cleanName || 'code'}.png`;

            const link = document.createElement('a');
            link.setAttribute('download', fileName);
            link.setAttribute('href', pngData);
            document.body.appendChild(link);
            link.click();

            setTimeout(() => {
                document.body.removeChild(link);
            }, 1000);

        } catch (err) {
            console.error("QR Download Error:", err);
            alert("Hata: " + err.message);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-slate-900 w-full max-w-sm rounded-[2.5rem] p-8 border border-white/10 shadow-2xl relative overflow-hidden"
                    >
                        {/* Background Decoration */}
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-prime/10 blur-[60px] rounded-full" />

                        <div className="relative z-10">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-black text-white tracking-tight">QR Giriş Kodu</h3>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div id="qr-code-canvas" className="bg-white p-6 rounded-3xl mb-8 flex flex-col items-center justify-center shadow-inner">
                                <QRCodeCanvas
                                    value={url}
                                    size={250}
                                    level="H"
                                    includeMargin={false}
                                />
                                <div className="mt-4 text-center">
                                    <p className="text-slate-900 font-bold text-sm">{eventName}</p>
                                    <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mt-0.5">İstek Sayfası</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={handleCopy}
                                    className="flex items-center justify-center gap-2 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold text-sm transition-all active:scale-95"
                                >
                                    {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                    {copied ? 'KOPYALANDI' : 'LİNK KOPYALA'}
                                </button>
                                <button
                                    onClick={handleDownload}
                                    className="flex items-center justify-center gap-2 py-4 bg-prime hover:bg-rose-600 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-prime/20 active:scale-95"
                                >
                                    <Download className="w-4 h-4" />
                                    İNDİR (PNG V3)
                                </button>
                            </div>

                            <p className="text-center text-slate-500 text-[10px] mt-6 font-medium uppercase tracking-widest">
                                Misafirler kamerayı taratıp giriş yapabilir
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default QRCodeModal;
