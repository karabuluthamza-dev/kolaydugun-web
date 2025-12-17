import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';
import './AdminShopProducts.css'; // Reuse existing styles

const AdminShopAccounts = () => {
    const { language } = useLanguage();
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingAccount, setEditingAccount] = useState(null);
    const [filter, setFilter] = useState({ status: 'all', plan: 'all' });
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);

    const [formData, setFormData] = useState({
        email: '',
        business_name: '',
        slug: '',
        description_tr: '',
        description_de: '',
        description_en: '',
        contact_whatsapp: '',
        contact_phone: '',
        contact_email: '',
        website_url: '',
        plan: 'starter',
        is_active: true,
        plan_started_at: '',
        plan_expires_at: ''
    });

    const plans = {
        starter: { name: 'Starter', price: 19, limit: 5, color: '#10b981' },
        business: { name: 'Business', price: 39, limit: 20, color: '#3b82f6' },
        premium: { name: 'Premium', price: 69, limit: -1, color: '#8b5cf6' }
    };

    useEffect(() => {
        fetchAccounts();
    }, [filter]);

    const fetchAccounts = async () => {
        try {
            let query = supabase
                .from('shop_accounts')
                .select('*')
                .order('created_at', { ascending: false });

            if (filter.status !== 'all') {
                query = query.eq('is_active', filter.status === 'active');
            }
            if (filter.plan !== 'all') {
                query = query.eq('plan', filter.plan);
            }

            const { data, error } = await query;
            if (error) throw error;
            setAccounts(data || []);
        } catch (error) {
            console.error('Error fetching accounts:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateSlug = (name) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    };

    const generateAffiliateCode = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const slug = formData.slug || generateSlug(formData.business_name);
            const affiliate_code = editingAccount?.affiliate_code || generateAffiliateCode();
            const product_limit = plans[formData.plan].limit;

            const payload = {
                email: formData.email,
                business_name: formData.business_name,
                slug: slug,
                description_tr: formData.description_tr,
                description_de: formData.description_de,
                description_en: formData.description_en,
                contact_whatsapp: formData.contact_whatsapp,
                contact_phone: formData.contact_phone,
                contact_email: formData.contact_email || formData.email,
                website_url: formData.website_url,
                plan: formData.plan,
                product_limit: product_limit,
                is_active: formData.is_active,
                affiliate_code: affiliate_code,
                plan_started_at: formData.plan_started_at || new Date().toISOString(),
                plan_expires_at: formData.plan_expires_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            };

            if (editingAccount) {
                const { error } = await supabase
                    .from('shop_accounts')
                    .update(payload)
                    .eq('id', editingAccount.id);
                if (error) throw error;
                alert('✅ Mağaza hesabı güncellendi!');
            } else {
                // Set plan start date for new accounts
                payload.plan_started_at = new Date().toISOString();
                payload.plan_expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days

                const { error } = await supabase
                    .from('shop_accounts')
                    .insert([payload]);
                if (error) throw error;
                alert('✅ Mağaza hesabı oluşturuldu!');
            }

            setShowModal(false);
            resetForm();
            fetchAccounts();
        } catch (error) {
            console.error('Error saving account:', error);
            alert('Hata: ' + error.message);
        }
    };

    const handleToggleActive = async (account) => {
        try {
            const { error } = await supabase
                .from('shop_accounts')
                .update({ is_active: !account.is_active })
                .eq('id', account.id);
            if (error) throw error;
            fetchAccounts();
        } catch (error) {
            console.error('Error toggling status:', error);
        }
    };

    const handleDelete = async (id) => {
        console.log('Deleting shop account:', id);

        try {
            // First delete related products
            await supabase.from('shop_products').delete().eq('shop_account_id', id);

            // Then delete the account
            const { data, error } = await supabase
                .from('shop_accounts')
                .delete()
                .eq('id', id)
                .select();

            console.log('Delete result:', { data, error });

            if (error) {
                console.error('Delete error:', error);
                alert('Silme hatası: ' + (error.message || JSON.stringify(error)));
                return;
            }

            alert('✅ Mağaza hesabı silindi!');
            fetchAccounts();
        } catch (error) {
            console.error('Catch error:', error);
            alert('Hata: ' + error.message);
        }
    };

    const handleEdit = (account) => {
        setEditingAccount(account);
        // Convert dates to YYYY-MM-DD format for input[type=date]
        const formatDateForInput = (dateStr) => {
            if (!dateStr) return '';
            return dateStr.split('T')[0];
        };
        setFormData({
            email: account.email,
            business_name: account.business_name,
            slug: account.slug,
            description_tr: account.description_tr || '',
            description_de: account.description_de || '',
            description_en: account.description_en || '',
            contact_whatsapp: account.contact_whatsapp || '',
            contact_phone: account.contact_phone || '',
            contact_email: account.contact_email || '',
            website_url: account.website_url || '',
            plan: account.plan || 'starter',
            is_active: account.is_active,
            plan_started_at: formatDateForInput(account.plan_started_at),
            plan_expires_at: formatDateForInput(account.plan_expires_at)
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setEditingAccount(null);
        setFormData({
            email: '',
            business_name: '',
            slug: '',
            description_tr: '',
            description_de: '',
            description_en: '',
            contact_whatsapp: '',
            contact_phone: '',
            contact_email: '',
            website_url: '',
            plan: 'starter',
            is_active: true,
            plan_started_at: '',
            plan_expires_at: ''
        });
    };

    const getPlanBadge = (plan) => {
        const p = plans[plan] || plans.starter;
        return (
            <span style={{
                background: `${p.color}20`,
                color: p.color,
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: '600'
            }}>
                {p.name} ({p.limit === -1 ? '∞' : p.limit} ürün)
            </span>
        );
    };

    const getStatusBadge = (isActive) => {
        return isActive ? (
            <span style={{ background: '#dcfce7', color: '#16a34a', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>
                ✅ Aktif
            </span>
        ) : (
            <span style={{ background: '#fee2e2', color: '#dc2626', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>
                ⏸️ Pasif
            </span>
        );
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('de-DE');
    };

    const activeCount = accounts.filter(a => a.is_active).length;
    const filteredAccounts = accounts.filter(a =>
        !searchTerm ||
        a.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className="admin-loading">Yükleniyor...</div>;
    }

    return (
        <div className="admin-shop-products">
            <div className="admin-page-header">
                <div>
                    <h1>🏪 Mağaza Hesapları</h1>
                    <p>Shop marketplace mağazalarını yönetin</p>
                </div>
                <div className="header-actions">
                    <span style={{
                        background: '#dbeafe',
                        color: '#2563eb',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        fontSize: '0.875rem'
                    }}>
                        📊 {activeCount} aktif mağaza
                    </span>
                    <button className="btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
                        + Yeni Mağaza
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-bar">
                <input
                    type="text"
                    placeholder="🔍 Mağaza veya email ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ flex: 1, maxWidth: '300px' }}
                />
                <select value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })}>
                    <option value="all">Tüm Durumlar</option>
                    <option value="active">Aktif</option>
                    <option value="inactive">Pasif</option>
                </select>
                <select value={filter.plan} onChange={(e) => setFilter({ ...filter, plan: e.target.value })}>
                    <option value="all">Tüm Planlar</option>
                    <option value="starter">Starter</option>
                    <option value="business">Business</option>
                    <option value="premium">Premium</option>
                </select>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {Object.entries(plans).map(([key, plan]) => {
                    const count = accounts.filter(a => a.plan === key).length;
                    return (
                        <div key={key} style={{
                            background: 'white',
                            padding: '1rem',
                            borderRadius: '12px',
                            borderLeft: `4px solid ${plan.color}`,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}>
                            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{plan.name}</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: plan.color }}>{count}</div>
                            <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{plan.price}€/ay</div>
                        </div>
                    );
                })}
            </div>

            {/* Accounts Table */}
            <div className="products-table-container">
                <table className="products-table">
                    <thead>
                        <tr>
                            <th>Mağaza</th>
                            <th>Email</th>
                            <th>Plan</th>
                            <th>Affiliate</th>
                            <th>Bitiş</th>
                            <th>Durum</th>
                            <th>İşlemler</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAccounts.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="empty-row">Mağaza bulunamadı</td>
                            </tr>
                        ) : (
                            filteredAccounts.map(account => (
                                <tr key={account.id}>
                                    <td>
                                        <div className="product-info">
                                            <a
                                                href={`/shop/magaza/${account.slug}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ textDecoration: 'none', color: 'inherit' }}
                                            >
                                                <strong style={{ color: '#FF6B9D' }}>{account.business_name}</strong>
                                            </a>
                                            <small>/{account.slug}</small>
                                        </div>
                                    </td>
                                    <td style={{ fontSize: '0.875rem' }}>{account.email}</td>
                                    <td>{getPlanBadge(account.plan)}</td>
                                    <td>
                                        <code style={{
                                            background: '#f3f4f6',
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            fontSize: '0.75rem'
                                        }}>
                                            {account.affiliate_code || '-'}
                                        </code>
                                    </td>
                                    <td style={{ fontSize: '0.875rem' }}>{formatDate(account.plan_expires_at)}</td>
                                    <td>{getStatusBadge(account.is_active)}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <a
                                                href={`/shop/magaza/${account.slug}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn-approve"
                                                title="Mağazayı Görüntüle"
                                                style={{ padding: '4px 8px', fontSize: '0.75rem', textDecoration: 'none' }}
                                            >
                                                👁️
                                            </a>
                                            <button
                                                className={account.is_active ? 'btn-warning' : 'btn-approve'}
                                                onClick={() => handleToggleActive(account)}
                                                title={account.is_active ? 'Pasif Yap' : 'Aktif Yap'}
                                                style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                                            >
                                                {account.is_active ? '⏸️' : '▶️'}
                                            </button>
                                            <button className="btn-edit" onClick={() => handleEdit(account)} title="Düzenle">
                                                ✏️
                                            </button>
                                            <button className="btn-delete" onClick={() => handleDelete(account.id)} title="Sil">
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingAccount ? '✏️ Mağaza Düzenle' : '➕ Yeni Mağaza Oluştur'}</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            {/* Basic Info */}
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Email *</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                        placeholder="magaza@email.com"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Plan *</label>
                                    <select
                                        value={formData.plan}
                                        onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                                    >
                                        <option value="starter">🟢 Starter (19€/ay - 5 ürün)</option>
                                        <option value="business">🔵 Business (39€/ay - 20 ürün)</option>
                                        <option value="premium">🟣 Premium (69€/ay - Sınırsız)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Plan Dates */}
                            <div className="form-row">
                                <div className="form-group">
                                    <label>📅 Plan Başlangıç Tarihi</label>
                                    <input
                                        type="date"
                                        value={formData.plan_started_at}
                                        onChange={(e) => setFormData({ ...formData, plan_started_at: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>📅 Plan Bitiş Tarihi</label>
                                    <input
                                        type="date"
                                        value={formData.plan_expires_at}
                                        onChange={(e) => setFormData({ ...formData, plan_expires_at: e.target.value })}
                                    />
                                    <small style={{ color: '#6b7280' }}>Boş bırakırsan 30 gün sonra eklenir</small>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Mağaza Adı *</label>
                                    <input
                                        type="text"
                                        value={formData.business_name}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            business_name: e.target.value,
                                            slug: formData.slug || generateSlug(e.target.value)
                                        })}
                                        required
                                        placeholder="Gelinlik World"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>URL Slug</label>
                                    <input
                                        type="text"
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        placeholder="gelinlik-world"
                                    />
                                    <small>kolaydugun.de/magaza/{formData.slug || 'slug'}</small>
                                </div>
                            </div>

                            {/* Descriptions */}
                            <div className="form-group">
                                <label>Açıklama (Türkçe)</label>
                                <textarea
                                    value={formData.description_tr}
                                    onChange={(e) => setFormData({ ...formData, description_tr: e.target.value })}
                                    rows={2}
                                    placeholder="Mağaza hakkında kısa açıklama..."
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Açıklama (Almanca)</label>
                                    <textarea
                                        value={formData.description_de}
                                        onChange={(e) => setFormData({ ...formData, description_de: e.target.value })}
                                        rows={2}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Açıklama (İngilizce)</label>
                                    <textarea
                                        value={formData.description_en}
                                        onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                                        rows={2}
                                    />
                                </div>
                            </div>

                            {/* Contact Info */}
                            <h4 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>📞 İletişim Bilgileri</h4>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>WhatsApp</label>
                                    <input
                                        type="text"
                                        value={formData.contact_whatsapp}
                                        onChange={(e) => setFormData({ ...formData, contact_whatsapp: e.target.value })}
                                        placeholder="+49 123 456 7890"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Telefon</label>
                                    <input
                                        type="text"
                                        value={formData.contact_phone}
                                        onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                                        placeholder="+49 123 456 7890"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>İletişim Email</label>
                                    <input
                                        type="email"
                                        value={formData.contact_email}
                                        onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                                        placeholder="iletisim@magaza.com"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Website</label>
                                    <input
                                        type="url"
                                        value={formData.website_url}
                                        onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                                        placeholder="https://www.magaza.com"
                                    />
                                </div>
                            </div>

                            {/* Status */}
                            <div className="form-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                        style={{ marginRight: '8px' }}
                                    />
                                    Mağaza Aktif
                                </label>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>İptal</button>
                                <button type="submit" className="btn-primary">{editingAccount ? 'Güncelle' : 'Oluştur'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminShopAccounts;
