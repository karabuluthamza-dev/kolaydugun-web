import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';

const BulkImageOptimizer = ({ onClose }) => {
    const [status, setStatus] = useState('idle'); // idle, scanning, optimizing, done
    const [images, setImages] = useState([]);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [results, setResults] = useState({ optimized: 0, skipped: 0, failed: 0, savedBytes: 0 });
    const [logs, setLogs] = useState([]);

    const addLog = (message, type = 'info') => {
        setLogs(prev => [...prev, { message, type, time: new Date().toLocaleTimeString() }]);
    };

    // Compress image function
    const compressImage = (imageBlob, maxWidth = 1920, quality = 0.8) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Only resize if larger than maxWidth
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Canvas to Blob failed'));
                        }
                    },
                    'image/jpeg',
                    quality
                );
            };
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = URL.createObjectURL(imageBlob);
        });
    };

    const scanImages = async () => {
        setStatus('scanning');
        addLog('🔍 Storage taranıyor...', 'info');

        try {
            // List all files in blog folder
            const { data: files, error } = await supabase.storage
                .from('blog-images')
                .list('blog', {
                    limit: 500,
                    sortBy: { column: 'created_at', order: 'desc' }
                });

            if (error) throw error;

            // Filter only image files
            const imageFiles = files.filter(f =>
                f.name &&
                !f.name.startsWith('.') &&
                /\.(jpg|jpeg|png|gif|webp)$/i.test(f.name)
            );

            setImages(imageFiles);
            addLog(`✅ ${imageFiles.length} resim bulundu`, 'success');
            setStatus('idle');
        } catch (error) {
            addLog(`❌ Tarama hatası: ${error.message}`, 'error');
            setStatus('idle');
        }
    };

    const optimizeAll = async () => {
        if (images.length === 0) {
            addLog('⚠️ Önce resimleri tarayın', 'warning');
            return;
        }

        setStatus('optimizing');
        setProgress({ current: 0, total: images.length });
        setResults({ optimized: 0, skipped: 0, failed: 0, savedBytes: 0 });

        for (let i = 0; i < images.length; i++) {
            const file = images[i];
            const filePath = `blog/${file.name}`;

            setProgress({ current: i + 1, total: images.length });

            try {
                // Skip if already a small file (< 100KB)
                if (file.metadata?.size && file.metadata.size < 100 * 1024) {
                    addLog(`⏭️ ${file.name} - Zaten küçük, atlandı`, 'info');
                    setResults(prev => ({ ...prev, skipped: prev.skipped + 1 }));
                    continue;
                }

                // Download the image
                const { data: blob, error: downloadError } = await supabase.storage
                    .from('blog-images')
                    .download(filePath);

                if (downloadError) throw downloadError;

                const originalSize = blob.size;

                // Compress the image
                const compressedBlob = await compressImage(blob);
                const newSize = compressedBlob.size;

                // Only upload if we actually saved space (> 10% smaller)
                if (newSize < originalSize * 0.9) {
                    // Upload compressed version (overwrite)
                    const { error: uploadError } = await supabase.storage
                        .from('blog-images')
                        .upload(filePath, compressedBlob, {
                            cacheControl: '31536000',
                            upsert: true,
                            contentType: 'image/jpeg'
                        });

                    if (uploadError) throw uploadError;

                    const saved = originalSize - newSize;
                    addLog(`✅ ${file.name} - ${(originalSize / 1024).toFixed(0)}KB → ${(newSize / 1024).toFixed(0)}KB (${Math.round(saved / 1024)}KB tasarruf)`, 'success');
                    setResults(prev => ({
                        ...prev,
                        optimized: prev.optimized + 1,
                        savedBytes: prev.savedBytes + saved
                    }));
                } else {
                    addLog(`⏭️ ${file.name} - Zaten optimize, atlandı`, 'info');
                    setResults(prev => ({ ...prev, skipped: prev.skipped + 1 }));
                }

            } catch (error) {
                addLog(`❌ ${file.name} - Hata: ${error.message}`, 'error');
                setResults(prev => ({ ...prev, failed: prev.failed + 1 }));
            }

            // Small delay to prevent rate limiting
            await new Promise(r => setTimeout(r, 200));
        }

        setStatus('done');
        addLog(`🎉 İşlem tamamlandı! ${results.optimized} resim optimize edildi.`, 'success');
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
        }}>
            <div style={{
                background: '#fff',
                borderRadius: '12px',
                width: '90%',
                maxWidth: '700px',
                maxHeight: '80vh',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Header */}
                <div style={{
                    padding: '20px',
                    borderBottom: '1px solid #e5e7eb',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>📸 Toplu Resim Optimizasyonu</h2>
                        <p style={{ margin: '5px 0 0', color: '#6b7280', fontSize: '0.9rem' }}>
                            Mevcut blog resimlerini sıkıştırarak boyutlarını küçültün
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={status === 'optimizing'}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '24px',
                            cursor: 'pointer',
                            color: '#9ca3af'
                        }}
                    >
                        ×
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: '20px', flex: 1, overflow: 'auto' }}>
                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                        <button
                            onClick={scanImages}
                            disabled={status === 'optimizing' || status === 'scanning'}
                            className="btn btn-secondary"
                            style={{ flex: 1 }}
                        >
                            {status === 'scanning' ? '🔍 Taranıyor...' : '🔍 Resimleri Tara'}
                        </button>
                        <button
                            onClick={optimizeAll}
                            disabled={status === 'optimizing' || images.length === 0}
                            className="btn btn-primary"
                            style={{ flex: 1, background: '#10b981' }}
                        >
                            {status === 'optimizing' ? `⚙️ Optimize Ediliyor... (${progress.current}/${progress.total})` : `⚡ Tümünü Optimize Et (${images.length})`}
                        </button>
                    </div>

                    {/* Progress Bar */}
                    {status === 'optimizing' && (
                        <div style={{ marginBottom: '20px' }}>
                            <div style={{
                                height: '8px',
                                background: '#e5e7eb',
                                borderRadius: '4px',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    height: '100%',
                                    width: `${(progress.current / progress.total) * 100}%`,
                                    background: 'linear-gradient(90deg, #10b981, #3b82f6)',
                                    transition: 'width 0.3s ease'
                                }} />
                            </div>
                            <p style={{ textAlign: 'center', color: '#6b7280', marginTop: '8px' }}>
                                {progress.current} / {progress.total} işleniyor...
                            </p>
                        </div>
                    )}

                    {/* Results Summary */}
                    {(status === 'done' || results.optimized > 0 || results.skipped > 0) && (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, 1fr)',
                            gap: '10px',
                            marginBottom: '20px'
                        }}>
                            <div style={{ textAlign: 'center', padding: '15px', background: '#d1fae5', borderRadius: '8px' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#059669' }}>{results.optimized}</div>
                                <div style={{ fontSize: '0.8rem', color: '#065f46' }}>Optimize Edildi</div>
                            </div>
                            <div style={{ textAlign: 'center', padding: '15px', background: '#fef3c7', borderRadius: '8px' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#d97706' }}>{results.skipped}</div>
                                <div style={{ fontSize: '0.8rem', color: '#92400e' }}>Atlandı</div>
                            </div>
                            <div style={{ textAlign: 'center', padding: '15px', background: '#fee2e2', borderRadius: '8px' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626' }}>{results.failed}</div>
                                <div style={{ fontSize: '0.8rem', color: '#991b1b' }}>Başarısız</div>
                            </div>
                            <div style={{ textAlign: 'center', padding: '15px', background: '#dbeafe', borderRadius: '8px' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb' }}>
                                    {results.savedBytes > 1024 * 1024
                                        ? `${(results.savedBytes / (1024 * 1024)).toFixed(1)}MB`
                                        : `${Math.round(results.savedBytes / 1024)}KB`}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#1d4ed8' }}>Tasarruf</div>
                            </div>
                        </div>
                    )}

                    {/* Logs */}
                    <div style={{
                        background: '#1f2937',
                        borderRadius: '8px',
                        padding: '15px',
                        maxHeight: '250px',
                        overflow: 'auto',
                        fontFamily: 'monospace',
                        fontSize: '0.85rem'
                    }}>
                        {logs.length === 0 ? (
                            <div style={{ color: '#9ca3af' }}>
                                📋 İşlem logları burada görünecek...
                            </div>
                        ) : (
                            logs.map((log, i) => (
                                <div key={i} style={{
                                    color: log.type === 'error' ? '#f87171' :
                                        log.type === 'success' ? '#4ade80' :
                                            log.type === 'warning' ? '#fbbf24' : '#d1d5db',
                                    marginBottom: '4px'
                                }}>
                                    <span style={{ color: '#6b7280' }}>[{log.time}]</span> {log.message}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div style={{
                    padding: '15px 20px',
                    borderTop: '1px solid #e5e7eb',
                    background: '#f9fafb',
                    display: 'flex',
                    justifyContent: 'flex-end'
                }}>
                    <button
                        onClick={onClose}
                        disabled={status === 'optimizing'}
                        className="btn btn-outline"
                    >
                        {status === 'done' ? 'Kapat' : 'İptal'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BulkImageOptimizer;
