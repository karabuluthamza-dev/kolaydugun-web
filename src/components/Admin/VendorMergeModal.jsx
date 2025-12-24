import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Check, AlertCircle, Wand2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const VendorMergeModal = ({ isOpen, onClose, incomingItem, existingVendorId, onMergeSuccess }) => {
    const [existingVendor, setExistingVendor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [merging, setMerging] = useState(false);

    // Fields to compare
    const fields = [
        { key: 'business_name', label: 'İşletme Adı' },
        { key: 'city_id', label: 'Şehir ID', isId: true }, // Special handling maybe
        { key: 'phone', label: 'Telefon' },
        { key: 'email', label: 'E-posta' },
        { key: 'website', label: 'Web Sitesi' },
        { key: 'description', label: 'Açıklama', isLong: true },
    ];

    // State for selected fields from Incoming
    const [selectedFields, setSelectedFields] = useState({});

    useEffect(() => {
        if (isOpen && existingVendorId) {
            fetchExistingVendor();
        }
    }, [isOpen, existingVendorId]);

    const fetchExistingVendor = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('vendors')
                .select('*')
                .eq('id', existingVendorId)
                .single();

            if (error) throw error;
            setExistingVendor(data);

            // Reset selection
            setSelectedFields({});
        } catch (error) {
            console.error('Error fetching existing vendor:', error);
            alert('Mevcut işletme verisi çekilemedi.');
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const handleAutoFill = () => {
        if (!existingVendor || !incomingItem) return;

        const newSelection = {};
        fields.forEach(field => {
            const incVal = incomingItem[field.key];
            const existVal = existingVendor[field.key];

            // If existing is empty/null AND incoming has value -> Select it
            if ((!existVal || existVal === '') && incVal && incVal !== '') {
                newSelection[field.key] = true;
            }
        });
        setSelectedFields(newSelection);
    };

    const toggleField = (key) => {
        setSelectedFields(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleMerge = async () => {
        if (!confirm('Seçilen veriler mevcut işletme kaydının üzerine yazılacak. Onaylıyor musunuz?')) return;

        setMerging(true);
        try {
            // 1. Prepare Update Object
            const updateData = {};
            Object.keys(selectedFields).forEach(key => {
                if (selectedFields[key]) {
                    updateData[key] = incomingItem[key];
                }
            });

            if (Object.keys(updateData).length === 0) {
                alert("Hiçbir yeni veri seçilmedi.");
                setMerging(false);
                return;
            }

            // 2. Update Vendor
            const { error: updateError } = await supabase
                .from('vendors')
                .update(updateData)
                .eq('id', existingVendor.id);

            if (updateError) throw updateError;

            // 3. Mark Import as Merged (or Rejected/Duplicate resolved)
            // We can treat it as 'approved' but strictly speaking it's 'merged'. 
            // Let's mark it as 'approved' with a note or just delete it? 
            // Usually we mark as 'rejected' (reason: merged) so it doesn't show up again.
            // Or 'approved' creates a NEW vendor.

            // Strategy: Update import status to 'merged' (custom) or 'rejected' with reason
            await supabase
                .from('vendor_imports')
                .update({
                    status: 'rejected',
                    rejection_reason: `Merged with existing vendor #${existingVendor.id}`
                })
                .eq('id', incomingItem.id);

            alert('✅ Veriler başarıyla birleştirildi!');
            onMergeSuccess(incomingItem.id); // Valid callback to remove from list
            onClose();

        } catch (error) {
            console.error('Merge error:', error);
            alert('Birleştirme hatası: ' + error.message);
        } finally {
            setMerging(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose}></div>

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-white border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Wand2 className="w-5 h-5 text-purple-600" />
                            Akıllı Veri Birleştirme
                        </h2>
                        <p className="text-sm text-gray-500">
                            Soldaki yeni verileri, sağdaki mevcut kayıtla karşılaştırın ve birleştirin.
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-12 gap-6">

                            {/* Column 1: Incoming (New) */}
                            <div className="col-span-12 md:col-span-5">
                                <div className="bg-white p-4 rounded-xl border-2 border-blue-100 shadow-sm h-full">
                                    <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        Yeni Veri (İçe Aktarılan)
                                    </h3>

                                    <div className="space-y-4">
                                        {fields.map(field => (
                                            <div key={`inc-${field.key}`} className={`p-3 rounded-lg ${selectedFields[field.key] ? 'bg-blue-50 ring-1 ring-blue-200' : 'bg-gray-50 border border-gray-100'}`}>
                                                <span className="text-xs text-gray-400 block mb-1">{field.label}</span>
                                                <p className="text-sm font-medium text-gray-900 break-words">
                                                    {incomingItem[field.key] || <span className="text-gray-400 italic">Boş</span>}
                                                </p>
                                                {/* Selection Checkbox */}
                                                {incomingItem[field.key] && (
                                                    <label className="flex items-center gap-2 mt-2 cursor-pointer select-none">
                                                        <input
                                                            type="checkbox"
                                                            checked={!!selectedFields[field.key]}
                                                            onChange={() => toggleField(field.key)}
                                                            className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                                                        />
                                                        <span className="text-xs font-medium text-blue-700">Bu veriyi kullan</span>
                                                    </label>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Column 2: Action Center */}
                            <div className="col-span-12 md:col-span-2 flex flex-col items-center justify-center gap-4">
                                <ArrowRight className="w-8 h-8 text-gray-300 hidden md:block" />
                                <button
                                    onClick={handleAutoFill}
                                    className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors flex items-center gap-2 w-full justify-center"
                                >
                                    <Wand2 className="w-4 h-4" />
                                    Otomatik Doldur
                                </button>
                                <p className="text-xs text-center text-gray-400 px-2">
                                    Mevcut kayıtta BOŞ olup, yeni kayıtta DOLU olan verileri otomatik seçer.
                                </p>
                            </div>

                            {/* Column 3: Existing (Database) */}
                            <div className="col-span-12 md:col-span-5">
                                <div className="bg-white p-4 rounded-xl border-2 border-gray-200 shadow-sm h-full opacity-75 grayscale-[0.1]">
                                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                                        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                                        Mevcut Kayıt (Veritabanı)
                                    </h3>

                                    <div className="space-y-4">
                                        {fields.map(field => (
                                            <div key={`exist-${field.key}`} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                                <span className="text-xs text-gray-400 block mb-1">{field.label}</span>
                                                <div className={`text-sm font-medium break-words ${selectedFields[field.key] ? 'line-through text-red-400' : 'text-gray-900'}`}>
                                                    {existingVendor[field.key] || <span className="text-gray-400 italic">Boş</span>}
                                                </div>
                                                {selectedFields[field.key] && (
                                                    <div className="mt-1 text-xs text-green-600 font-medium flex items-center gap-1">
                                                        <ArrowRight className="w-3 h-3" />
                                                        Yeni veri ile güncellenecek
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-white border-t border-gray-100 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        İptal
                    </button>
                    <button
                        onClick={handleMerge}
                        disabled={loading || merging || Object.keys(selectedFields).length === 0}
                        className="px-6 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 active:scale-95 transition-all shadow-lg shadow-purple-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {merging ? 'Birleştiriliyor...' : 'Değişiklikleri Kaydet & Birleştir'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VendorMergeModal;
