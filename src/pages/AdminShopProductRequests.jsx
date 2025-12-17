import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';

const AdminShopProductRequests = () => {
    const { language } = useLanguage();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [processing, setProcessing] = useState(false);

    const texts = {
        tr: {
            title: 'Ana Shop Ürün Başvuruları',
            subtitle: 'Tedarikçilerin ana shop\'ta yayınlanma talepleri',
            pending: 'Bekleyen',
            approved: 'Onaylanan',
            rejected: 'Reddedilen',
            all: 'Tümü',
            noRequests: 'Başvuru bulunamadı',
            approve: 'Onayla',
            reject: 'Reddet',
            shopName: 'Mağaza',
            productName: 'Ürün',
            requestedCategory: 'İstenen Kategori',
            requestDate: 'Başvuru Tarihi',
            price: 'Fiyat',
            view: 'Görüntüle',
            rejectReason: 'Red Sebebi',
            rejectPlaceholder: 'Ürünün neden reddedildiğini açıklayın...',
            cancel: 'İptal',
            confirm: 'Onayla',
            approveSuccess: 'Ürün ana shop\'a eklendi!',
            rejectSuccess: 'Başvuru reddedildi'
        },
        de: {
            title: 'Hauptshop Produktanträge',
            subtitle: 'Anträge der Anbieter zur Veröffentlichung im Hauptshop',
            pending: 'Ausstehend',
            approved: 'Genehmigt',
            rejected: 'Abgelehnt',
            all: 'Alle',
            noRequests: 'Keine Anträge gefunden',
            approve: 'Genehmigen',
            reject: 'Ablehnen',
            shopName: 'Shop',
            productName: 'Produkt',
            requestedCategory: 'Gewünschte Kategorie',
            requestDate: 'Antragsdatum',
            price: 'Preis',
            view: 'Ansehen',
            rejectReason: 'Ablehnungsgrund',
            rejectPlaceholder: 'Erklären Sie, warum das Produkt abgelehnt wurde...',
            cancel: 'Abbrechen',
            confirm: 'Bestätigen',
            approveSuccess: 'Produkt zum Hauptshop hinzugefügt!',
            rejectSuccess: 'Antrag abgelehnt'
        },
        en: {
            title: 'Main Shop Product Requests',
            subtitle: 'Vendor requests to publish in the main shop',
            pending: 'Pending',
            approved: 'Approved',
            rejected: 'Rejected',
            all: 'All',
            noRequests: 'No requests found',
            approve: 'Approve',
            reject: 'Reject',
            shopName: 'Shop',
            productName: 'Product',
            requestedCategory: 'Requested Category',
            requestDate: 'Request Date',
            price: 'Price',
            view: 'View',
            rejectReason: 'Rejection Reason',
            rejectPlaceholder: 'Explain why the product was rejected...',
            cancel: 'Cancel',
            confirm: 'Confirm',
            approveSuccess: 'Product added to main shop!',
            rejectSuccess: 'Request rejected'
        }
    };

    const txt = texts[language] || texts.tr;

    useEffect(() => {
        fetchRequests();
    }, [filter]);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('shop_products')
                .select(`
                    id,
                    name_tr, name_de, name_en,
                    price, currency, price_on_request,
                    images,
                    main_shop_request_status,
                    main_shop_category_id,
                    main_shop_requested_at,
                    main_shop_rejection_reason,
                    main_shop_approved_at,
                    shop:shop_accounts!shop_account_id (
                        id, business_name, slug, logo_url
                    ),
                    category:shop_categories!main_shop_category_id (
                        id, name_tr, name_de, name_en, icon
                    )
                `)
                .neq('main_shop_request_status', 'none')
                .order('main_shop_requested_at', { ascending: false });

            if (filter !== 'all') {
                query = query.eq('main_shop_request_status', filter);
            }

            const { data, error } = await query;
            if (error) throw error;
            setRequests(data || []);
        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (product) => {
        setProcessing(true);
        try {
            const { error } = await supabase
                .from('shop_products')
                .update({
                    main_shop_request_status: 'approved',
                    main_shop_approved_at: new Date().toISOString()
                })
                .eq('id', product.id);

            if (error) throw error;
            alert(txt.approveSuccess);
            fetchRequests();
        } catch (error) {
            console.error('Error approving:', error);
            alert('Error: ' + error.message);
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) return;
        setProcessing(true);
        try {
            const { error } = await supabase
                .from('shop_products')
                .update({
                    main_shop_request_status: 'rejected',
                    main_shop_rejection_reason: rejectReason
                })
                .eq('id', selectedRequest.id);

            if (error) throw error;
            alert(txt.rejectSuccess);
            setShowRejectModal(false);
            setRejectReason('');
            setSelectedRequest(null);
            fetchRequests();
        } catch (error) {
            console.error('Error rejecting:', error);
            alert('Error: ' + error.message);
        } finally {
            setProcessing(false);
        }
    };

    const openRejectModal = (product) => {
        setSelectedRequest(product);
        setRejectReason('');
        setShowRejectModal(true);
    };

    const getProductName = (product) => {
        return product[`name_${language}`] || product.name_tr || 'Ürün';
    };

    const getCategoryName = (category) => {
        if (!category) return '-';
        return category[`name_${language}`] || category.name_tr || '-';
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString(language === 'de' ? 'de-DE' : language === 'en' ? 'en-US' : 'tr-TR');
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: { bg: '#fef3c7', color: '#d97706', text: `⏳ ${txt.pending}` },
            approved: { bg: '#dcfce7', color: '#16a34a', text: `✅ ${txt.approved}` },
            rejected: { bg: '#fee2e2', color: '#dc2626', text: `❌ ${txt.rejected}` }
        };
        const s = styles[status] || styles.pending;
        return (
            <span style={{
                background: s.bg,
                color: s.color,
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: '600'
            }}>
                {s.text}
            </span>
        );
    };

    const pendingCount = requests.filter(r => r.main_shop_request_status === 'pending').length;

    return (
        <div className="admin-shop-requests">
            <div className="page-header">
                <div>
                    <h1>📦 {txt.title}</h1>
                    <p>{txt.subtitle}</p>
                </div>
                {pendingCount > 0 && (
                    <div className="pending-badge">
                        {pendingCount} {txt.pending}
                    </div>
                )}
            </div>

            {/* Filters */}
            <div className="filters-bar">
                <button
                    className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
                    onClick={() => setFilter('pending')}
                >
                    ⏳ {txt.pending}
                </button>
                <button
                    className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
                    onClick={() => setFilter('approved')}
                >
                    ✅ {txt.approved}
                </button>
                <button
                    className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}
                    onClick={() => setFilter('rejected')}
                >
                    ❌ {txt.rejected}
                </button>
                <button
                    className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    📋 {txt.all}
                </button>
            </div>

            {/* Requests Table */}
            {loading ? (
                <div className="loading">Yükleniyor...</div>
            ) : requests.length === 0 ? (
                <div className="empty-state">
                    <span className="icon">📭</span>
                    <p>{txt.noRequests}</p>
                </div>
            ) : (
                <div className="requests-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Ürün</th>
                                <th>{txt.shopName}</th>
                                <th>{txt.requestedCategory}</th>
                                <th>{txt.price}</th>
                                <th>{txt.requestDate}</th>
                                <th>Durum</th>
                                <th>İşlem</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map(request => (
                                <tr key={request.id}>
                                    <td>
                                        <div className="product-cell">
                                            <img
                                                src={request.images?.[0] || '/placeholder.png'}
                                                alt=""
                                                className="product-thumb"
                                            />
                                            <span>{getProductName(request)}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="shop-cell">
                                            {request.shop?.logo_url && (
                                                <img src={request.shop.logo_url} alt="" className="shop-logo" />
                                            )}
                                            <span>{request.shop?.business_name || '-'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        {request.category?.icon} {getCategoryName(request.category)}
                                    </td>
                                    <td>
                                        {request.price_on_request
                                            ? 'Teklif'
                                            : request.price
                                                ? `${request.price} ${request.currency || '€'}`
                                                : '-'}
                                    </td>
                                    <td>{formatDate(request.main_shop_requested_at)}</td>
                                    <td>{getStatusBadge(request.main_shop_request_status)}</td>
                                    <td>
                                        <div className="action-buttons">
                                            {request.main_shop_request_status === 'pending' && (
                                                <button
                                                    className="btn-approve"
                                                    onClick={() => handleApprove(request)}
                                                    disabled={processing}
                                                >
                                                    ✓ {txt.approve}
                                                </button>
                                            )}
                                            {(request.main_shop_request_status === 'pending' || request.main_shop_request_status === 'approved') && (
                                                <button
                                                    className="btn-reject"
                                                    onClick={() => openRejectModal(request)}
                                                    disabled={processing}
                                                    title={request.main_shop_request_status === 'approved' ? 'Onayı Kaldır' : ''}
                                                >
                                                    ✕ {txt.reject}
                                                </button>
                                            )}
                                        </div>
                                        {request.main_shop_request_status === 'rejected' && request.main_shop_rejection_reason && (
                                            <span className="rejection-tooltip" title={request.main_shop_rejection_reason}>
                                                📝 Sebep
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>❌ {txt.reject}</h2>
                            <button className="modal-close" onClick={() => setShowRejectModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <p><strong>{getProductName(selectedRequest)}</strong></p>
                            <p className="shop-info">{selectedRequest?.shop?.business_name}</p>
                            <div className="form-group">
                                <label>{txt.rejectReason} *</label>
                                <textarea
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder={txt.rejectPlaceholder}
                                    rows={4}
                                />
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={() => setShowRejectModal(false)}>
                                {txt.cancel}
                            </button>
                            <button
                                className="btn-danger"
                                onClick={handleReject}
                                disabled={!rejectReason.trim() || processing}
                            >
                                {processing ? '...' : txt.confirm}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .admin-shop-requests {
                    padding: 1.5rem;
                }

                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 2rem;
                }

                .page-header h1 {
                    margin: 0;
                    font-size: 1.5rem;
                }

                .page-header p {
                    margin: 0.5rem 0 0;
                    color: #6b7280;
                }

                .pending-badge {
                    background: linear-gradient(135deg, #FF6B9D 0%, #c084fc 100%);
                    color: white;
                    padding: 8px 16px;
                    border-radius: 20px;
                    font-weight: 600;
                }

                .filters-bar {
                    display: flex;
                    gap: 0.5rem;
                    margin-bottom: 1.5rem;
                    flex-wrap: wrap;
                }

                .filter-btn {
                    padding: 8px 16px;
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    transition: all 0.2s;
                }

                .filter-btn:hover {
                    border-color: #FF6B9D;
                }

                .filter-btn.active {
                    background: linear-gradient(135deg, #FF6B9D 0%, #c084fc 100%);
                    color: white;
                    border-color: transparent;
                }

                .loading, .empty-state {
                    text-align: center;
                    padding: 3rem;
                    color: #6b7280;
                }

                .empty-state .icon {
                    font-size: 3rem;
                    display: block;
                    margin-bottom: 1rem;
                }

                .requests-table {
                    background: white;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                }

                th, td {
                    padding: 1rem;
                    text-align: left;
                    border-bottom: 1px solid #f0f0f0;
                }

                th {
                    background: #f9fafb;
                    font-weight: 600;
                    color: #374151;
                    font-size: 0.85rem;
                }

                .product-cell, .shop-cell {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .product-thumb {
                    width: 40px;
                    height: 40px;
                    border-radius: 8px;
                    object-fit: cover;
                }

                .shop-logo {
                    width: 24px;
                    height: 24px;
                    border-radius: 4px;
                    object-fit: cover;
                }

                .action-buttons {
                    display: flex;
                    gap: 0.5rem;
                }

                .btn-approve {
                    padding: 6px 12px;
                    background: #dcfce7;
                    color: #16a34a;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 500;
                    transition: all 0.2s;
                }

                .btn-approve:hover {
                    background: #bbf7d0;
                }

                .btn-reject {
                    padding: 6px 12px;
                    background: #fee2e2;
                    color: #dc2626;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 500;
                    transition: all 0.2s;
                }

                .btn-reject:hover {
                    background: #fecaca;
                }

                .rejection-tooltip {
                    cursor: help;
                    color: #6b7280;
                    font-size: 0.85rem;
                }

                /* Modal */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 1rem;
                }

                .modal-content {
                    background: white;
                    border-radius: 16px;
                    width: 100%;
                    max-width: 450px;
                }

                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.25rem;
                    border-bottom: 1px solid #f0f0f0;
                }

                .modal-header h2 {
                    margin: 0;
                    font-size: 1.1rem;
                }

                .modal-close {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    border: none;
                    background: #f3f4f6;
                    font-size: 1.25rem;
                    cursor: pointer;
                }

                .modal-body {
                    padding: 1.25rem;
                }

                .modal-body .shop-info {
                    color: #6b7280;
                    margin-bottom: 1rem;
                }

                .form-group {
                    margin-bottom: 1rem;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 0.5rem;
                    font-weight: 500;
                }

                .form-group textarea {
                    width: 100%;
                    padding: 12px;
                    border: 1px solid #e5e7eb;
                    border-radius: 10px;
                    font-size: 0.95rem;
                    resize: vertical;
                }

                .modal-actions {
                    display: flex;
                    gap: 1rem;
                    justify-content: flex-end;
                    padding: 1.25rem;
                    border-top: 1px solid #f0f0f0;
                }

                .btn-secondary {
                    padding: 10px 20px;
                    background: #f3f4f6;
                    color: #374151;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                }

                .btn-danger {
                    padding: 10px 20px;
                    background: #dc2626;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                }

                .btn-danger:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
            `}</style>
        </div>
    );
};

export default AdminShopProductRequests;
