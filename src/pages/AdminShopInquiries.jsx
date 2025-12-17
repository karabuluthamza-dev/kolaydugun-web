import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';
import './AdminShopInquiries.css';

const AdminShopInquiries = () => {
    const { language } = useLanguage();
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [selectedInquiry, setSelectedInquiry] = useState(null);

    useEffect(() => {
        fetchInquiries();
    }, [filter]);

    const fetchInquiries = async () => {
        try {
            let query = supabase
                .from('shop_inquiries')
                .select(`
                    *,
                    product:shop_products(id, title, image_url, product_type)
                `)
                .order('created_at', { ascending: false });

            if (filter !== 'all') {
                query = query.eq('status', filter);
            }

            const { data, error } = await query;
            if (error) throw error;
            setInquiries(data || []);
        } catch (error) {
            console.error('Error fetching inquiries:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            const { error } = await supabase
                .from('shop_inquiries')
                .update({ status: newStatus })
                .eq('id', id);
            if (error) throw error;
            fetchInquiries();
            if (selectedInquiry?.id === id) {
                setSelectedInquiry({ ...selectedInquiry, status: newStatus });
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const deleteInquiry = async (id) => {
        if (!confirm('Bu talebi silmek istediğinize emin misiniz?')) return;
        try {
            const { error } = await supabase
                .from('shop_inquiries')
                .delete()
                .eq('id', id);
            if (error) throw error;
            fetchInquiries();
            if (selectedInquiry?.id === id) {
                setSelectedInquiry(null);
            }
        } catch (error) {
            console.error('Error deleting inquiry:', error);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusInfo = (status) => {
        const statuses = {
            new: { label: '🔵 Yeni', bg: '#dbeafe', color: '#2563eb' },
            contacted: { label: '🟡 İletişime Geçildi', bg: '#fef3c7', color: '#d97706' },
            closed: { label: '✅ Kapatıldı', bg: '#dcfce7', color: '#16a34a' }
        };
        return statuses[status] || statuses.new;
    };

    const newCount = inquiries.filter(i => i.status === 'new').length;

    if (loading) {
        return <div className="admin-loading">Yükleniyor...</div>;
    }

    return (
        <div className="admin-shop-inquiries">
            <div className="admin-page-header">
                <div>
                    <h1>📩 İletişim Talepleri</h1>
                    <p>Boutique ürünleri için gelen talepler</p>
                </div>
                {newCount > 0 && (
                    <span className="new-badge">🔔 {newCount} yeni talep</span>
                )}
            </div>

            <div className="inquiries-layout">
                {/* Left Panel - List */}
                <div className="inquiries-list">
                    <div className="filters-bar">
                        <button
                            className={filter === 'all' ? 'active' : ''}
                            onClick={() => setFilter('all')}
                        >
                            Tümü ({inquiries.length})
                        </button>
                        <button
                            className={filter === 'new' ? 'active' : ''}
                            onClick={() => setFilter('new')}
                        >
                            Yeni
                        </button>
                        <button
                            className={filter === 'contacted' ? 'active' : ''}
                            onClick={() => setFilter('contacted')}
                        >
                            İletişime Geçildi
                        </button>
                        <button
                            className={filter === 'closed' ? 'active' : ''}
                            onClick={() => setFilter('closed')}
                        >
                            Kapatıldı
                        </button>
                    </div>

                    {inquiries.length === 0 ? (
                        <div className="empty-state">
                            <p>Henüz talep yok</p>
                        </div>
                    ) : (
                        <div className="inquiry-items">
                            {inquiries.map(inquiry => (
                                <div
                                    key={inquiry.id}
                                    className={`inquiry-item ${selectedInquiry?.id === inquiry.id ? 'selected' : ''} ${inquiry.status === 'new' ? 'new' : ''}`}
                                    onClick={() => setSelectedInquiry(inquiry)}
                                >
                                    <div className="inquiry-preview">
                                        <div className="inquiry-header">
                                            <strong>{inquiry.name}</strong>
                                            <span className="inquiry-date">{formatDate(inquiry.created_at)}</span>
                                        </div>
                                        <div className="inquiry-product">
                                            {inquiry.product?.title?.[language] || inquiry.product?.title?.tr || 'Ürün bilgisi yok'}
                                        </div>
                                        <div className="inquiry-status">
                                            {getStatusInfo(inquiry.status).label}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Panel - Detail */}
                <div className="inquiry-detail">
                    {selectedInquiry ? (
                        <>
                            <div className="detail-header">
                                <h2>Talep Detayı</h2>
                                <div className="detail-actions">
                                    <button
                                        className="btn-delete-small"
                                        onClick={() => deleteInquiry(selectedInquiry.id)}
                                    >
                                        🗑️ Sil
                                    </button>
                                </div>
                            </div>

                            <div className="detail-content">
                                {/* Product Info */}
                                {selectedInquiry.product && (
                                    <div className="detail-product">
                                        {selectedInquiry.product.image_url && (
                                            <img src={selectedInquiry.product.image_url} alt="" />
                                        )}
                                        <div>
                                            <strong>{selectedInquiry.product.title?.[language] || selectedInquiry.product.title?.tr}</strong>
                                            <span className="product-type">
                                                {selectedInquiry.product.product_type === 'boutique' ? '👔 Boutique' : '📦 Amazon'}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Contact Info */}
                                <div className="detail-section">
                                    <h3>İletişim Bilgileri</h3>
                                    <div className="info-grid">
                                        <div className="info-item">
                                            <label>Ad Soyad</label>
                                            <span>{selectedInquiry.name}</span>
                                        </div>
                                        <div className="info-item">
                                            <label>E-posta</label>
                                            <a href={`mailto:${selectedInquiry.email}`}>{selectedInquiry.email}</a>
                                        </div>
                                        {selectedInquiry.phone && (
                                            <div className="info-item">
                                                <label>Telefon</label>
                                                <a href={`tel:${selectedInquiry.phone}`}>{selectedInquiry.phone}</a>
                                            </div>
                                        )}
                                        <div className="info-item">
                                            <label>Tarih</label>
                                            <span>{formatDate(selectedInquiry.created_at)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Message */}
                                {selectedInquiry.message && (
                                    <div className="detail-section">
                                        <h3>Mesaj</h3>
                                        <div className="message-box">
                                            {selectedInquiry.message}
                                        </div>
                                    </div>
                                )}

                                {/* Status Update */}
                                <div className="detail-section">
                                    <h3>Durum</h3>
                                    <div className="status-buttons">
                                        <button
                                            className={selectedInquiry.status === 'new' ? 'active' : ''}
                                            onClick={() => updateStatus(selectedInquiry.id, 'new')}
                                        >
                                            🔵 Yeni
                                        </button>
                                        <button
                                            className={selectedInquiry.status === 'contacted' ? 'active' : ''}
                                            onClick={() => updateStatus(selectedInquiry.id, 'contacted')}
                                        >
                                            🟡 İletişime Geçildi
                                        </button>
                                        <button
                                            className={selectedInquiry.status === 'closed' ? 'active' : ''}
                                            onClick={() => updateStatus(selectedInquiry.id, 'closed')}
                                        >
                                            ✅ Kapatıldı
                                        </button>
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="detail-section">
                                    <h3>Hızlı İşlemler</h3>
                                    <div className="quick-actions">
                                        <a href={`mailto:${selectedInquiry.email}?subject=Re: ${selectedInquiry.product?.title?.tr || 'Ürün Talebi'}`} className="btn-action">
                                            ✉️ E-posta Gönder
                                        </a>
                                        {selectedInquiry.phone && (
                                            <a href={`https://wa.me/${selectedInquiry.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="btn-action whatsapp">
                                                💬 WhatsApp
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="no-selection">
                            <p>👈 Detayları görmek için sol taraftan bir talep seçin</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminShopInquiries;
