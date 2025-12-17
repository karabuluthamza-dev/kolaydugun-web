import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useLanguage } from '../../context/LanguageContext';
import './AdminShopPlans.css';

const AdminShopPlans = () => {
    const { t, language } = useLanguage();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingPlan, setEditingPlan] = useState(null);
    const [saving, setSaving] = useState(false);

    const texts = {
        tr: {
            title: 'Shop Paketleri',
            subtitle: 'Mağaza abonelik paketlerini yönetin',
            planName: 'Paket Adı',
            priceMonthly: 'Aylık Fiyat (€)',
            priceYearly: 'Yıllık Fiyat (€)',
            productLimit: 'Ürün Limiti',
            unlimited: 'Sınırsız',
            features: 'Özellikler',
            priorityListing: 'Öncelikli Listeleme',
            analytics: 'İstatistik Paneli',
            featuredHomepage: 'Ana Sayfa Öne Çıkarma',
            vipBadge: 'VIP Rozeti',
            affiliateAccess: 'Affiliate Erişimi',
            active: 'Aktif',
            edit: 'Düzenle',
            save: 'Kaydet',
            cancel: 'İptal',
            saving: 'Kaydediliyor...',
            success: 'Paket güncellendi!',
            error: 'Hata oluştu',
            note: 'Not: Fiyatlar vergisiz (net) olarak girilmelidir. Faturada %19 MwSt ayrıca eklenir.',
            subscribers: 'Abone Sayısı'
        },
        de: {
            title: 'Shop-Pakete',
            subtitle: 'Verwalten Sie die Shop-Abonnementpakete',
            planName: 'Paketname',
            priceMonthly: 'Monatlicher Preis (€)',
            priceYearly: 'Jährlicher Preis (€)',
            productLimit: 'Produktlimit',
            unlimited: 'Unbegrenzt',
            features: 'Funktionen',
            priorityListing: 'Prioritätsanzeige',
            analytics: 'Statistik-Panel',
            featuredHomepage: 'Homepage-Präsentation',
            vipBadge: 'VIP-Abzeichen',
            affiliateAccess: 'Affiliate-Zugang',
            active: 'Aktiv',
            edit: 'Bearbeiten',
            save: 'Speichern',
            cancel: 'Abbrechen',
            saving: 'Wird gespeichert...',
            success: 'Paket aktualisiert!',
            error: 'Fehler aufgetreten',
            note: 'Hinweis: Preise werden netto (ohne MwSt) eingegeben. 19% MwSt wird auf der Rechnung hinzugefügt.',
            subscribers: 'Abonnentenzahl'
        },
        en: {
            title: 'Shop Plans',
            subtitle: 'Manage shop subscription plans',
            planName: 'Plan Name',
            priceMonthly: 'Monthly Price (€)',
            priceYearly: 'Yearly Price (€)',
            productLimit: 'Product Limit',
            unlimited: 'Unlimited',
            features: 'Features',
            priorityListing: 'Priority Listing',
            analytics: 'Analytics Panel',
            featuredHomepage: 'Homepage Featured',
            vipBadge: 'VIP Badge',
            affiliateAccess: 'Affiliate Access',
            active: 'Active',
            edit: 'Edit',
            save: 'Save',
            cancel: 'Cancel',
            saving: 'Saving...',
            success: 'Plan updated!',
            error: 'Error occurred',
            note: 'Note: Prices are entered net (without VAT). 19% MwSt will be added on invoice.',
            subscribers: 'Subscriber Count'
        }
    };

    const txt = texts[language] || texts.tr;

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        setLoading(true);
        try {
            // Get plans with subscriber count
            const { data: plansData, error: plansError } = await supabase
                .from('shop_plans')
                .select('*')
                .order('sort_order', { ascending: true });

            if (plansError) throw plansError;

            // Get subscriber counts
            const { data: subscriberCounts, error: countError } = await supabase
                .from('shop_accounts')
                .select('plan_id')
                .not('plan_id', 'is', null);

            if (!countError && subscriberCounts) {
                const counts = {};
                subscriberCounts.forEach(s => {
                    counts[s.plan_id] = (counts[s.plan_id] || 0) + 1;
                });

                const plansWithCounts = plansData.map(plan => ({
                    ...plan,
                    subscriber_count: counts[plan.id] || 0
                }));

                setPlans(plansWithCounts);
            } else {
                setPlans(plansData);
            }
        } catch (error) {
            console.error('Error fetching plans:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (plan) => {
        setEditingPlan({ ...plan });
    };

    const handleCancel = () => {
        setEditingPlan(null);
    };

    const handleSave = async () => {
        if (!editingPlan) return;

        setSaving(true);
        try {
            const { error } = await supabase
                .from('shop_plans')
                .update({
                    display_name_tr: editingPlan.display_name_tr,
                    display_name_de: editingPlan.display_name_de,
                    display_name_en: editingPlan.display_name_en,
                    description_tr: editingPlan.description_tr,
                    description_de: editingPlan.description_de,
                    description_en: editingPlan.description_en,
                    price_monthly: parseFloat(editingPlan.price_monthly),
                    price_yearly: parseFloat(editingPlan.price_yearly),
                    product_limit: parseInt(editingPlan.product_limit),
                    has_priority_listing: editingPlan.has_priority_listing,
                    has_analytics: editingPlan.has_analytics,
                    has_featured_homepage: editingPlan.has_featured_homepage,
                    has_vip_badge: editingPlan.has_vip_badge,
                    has_affiliate_access: editingPlan.has_affiliate_access,
                    is_active: editingPlan.is_active,
                    updated_at: new Date().toISOString()
                })
                .eq('id', editingPlan.id);

            if (error) throw error;

            alert(txt.success);
            setEditingPlan(null);
            fetchPlans();
        } catch (error) {
            console.error('Error saving plan:', error);
            alert(txt.error + ': ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleInputChange = (field, value) => {
        setEditingPlan(prev => ({ ...prev, [field]: value }));
    };

    const getDisplayName = (plan) => {
        if (language === 'de') return plan.display_name_de;
        if (language === 'en') return plan.display_name_en;
        return plan.display_name_tr;
    };

    const getDescription = (plan) => {
        if (language === 'de') return plan.description_de;
        if (language === 'en') return plan.description_en;
        return plan.description_tr;
    };

    if (loading) {
        return (
            <div className="admin-shop-plans">
                <div className="loading-spinner">Yükleniyor...</div>
            </div>
        );
    }

    return (
        <div className="admin-shop-plans">
            <div className="page-header">
                <div>
                    <h1>{txt.title}</h1>
                    <p>{txt.subtitle}</p>
                </div>
            </div>

            <div className="tax-note">
                <span className="note-icon">💡</span>
                {txt.note}
            </div>

            <div className="plans-grid">
                {plans.map(plan => (
                    <div key={plan.id} className={`plan-card ${plan.name} ${editingPlan?.id === plan.id ? 'editing' : ''}`}>
                        {/* Plan Header */}
                        <div className="plan-header">
                            <h2>{getDisplayName(plan)}</h2>
                            <p className="plan-description">{getDescription(plan)}</p>
                            <div className="subscriber-badge">
                                {plan.subscriber_count || 0} {txt.subscribers}
                            </div>
                        </div>

                        {/* Editing Mode */}
                        {editingPlan?.id === plan.id ? (
                            <div className="plan-edit-form">
                                {/* Names */}
                                <div className="form-section">
                                    <label>TR: <input type="text" value={editingPlan.display_name_tr} onChange={(e) => handleInputChange('display_name_tr', e.target.value)} /></label>
                                    <label>DE: <input type="text" value={editingPlan.display_name_de} onChange={(e) => handleInputChange('display_name_de', e.target.value)} /></label>
                                    <label>EN: <input type="text" value={editingPlan.display_name_en} onChange={(e) => handleInputChange('display_name_en', e.target.value)} /></label>
                                </div>

                                {/* Prices */}
                                <div className="form-section">
                                    <label>
                                        {txt.priceMonthly}
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={editingPlan.price_monthly}
                                            onChange={(e) => handleInputChange('price_monthly', e.target.value)}
                                        />
                                    </label>
                                    <label>
                                        {txt.priceYearly}
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={editingPlan.price_yearly}
                                            onChange={(e) => handleInputChange('price_yearly', e.target.value)}
                                        />
                                    </label>
                                </div>

                                {/* Product Limit */}
                                <div className="form-section">
                                    <label>
                                        {txt.productLimit}
                                        <input
                                            type="number"
                                            value={editingPlan.product_limit}
                                            onChange={(e) => handleInputChange('product_limit', e.target.value)}
                                        />
                                        <small>-1 = {txt.unlimited}</small>
                                    </label>
                                </div>

                                {/* Features */}
                                <div className="form-section features-section">
                                    <h4>{txt.features}</h4>
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={editingPlan.has_priority_listing}
                                            onChange={(e) => handleInputChange('has_priority_listing', e.target.checked)}
                                        />
                                        {txt.priorityListing}
                                    </label>
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={editingPlan.has_analytics}
                                            onChange={(e) => handleInputChange('has_analytics', e.target.checked)}
                                        />
                                        {txt.analytics}
                                    </label>
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={editingPlan.has_featured_homepage}
                                            onChange={(e) => handleInputChange('has_featured_homepage', e.target.checked)}
                                        />
                                        {txt.featuredHomepage}
                                    </label>
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={editingPlan.has_vip_badge}
                                            onChange={(e) => handleInputChange('has_vip_badge', e.target.checked)}
                                        />
                                        {txt.vipBadge}
                                    </label>
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={editingPlan.has_affiliate_access}
                                            onChange={(e) => handleInputChange('has_affiliate_access', e.target.checked)}
                                        />
                                        {txt.affiliateAccess}
                                    </label>
                                </div>

                                {/* Active */}
                                <div className="form-section">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={editingPlan.is_active}
                                            onChange={(e) => handleInputChange('is_active', e.target.checked)}
                                        />
                                        {txt.active}
                                    </label>
                                </div>

                                {/* Actions */}
                                <div className="form-actions">
                                    <button className="btn-cancel" onClick={handleCancel}>{txt.cancel}</button>
                                    <button className="btn-save" onClick={handleSave} disabled={saving}>
                                        {saving ? txt.saving : txt.save}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* View Mode */}
                                <div className="plan-pricing">
                                    <div className="price-monthly">
                                        <span className="price">{plan.price_monthly}€</span>
                                        <span className="period">/{language === 'de' ? 'Mo' : language === 'en' ? 'mo' : 'ay'}</span>
                                    </div>
                                    <div className="price-yearly">
                                        {plan.price_yearly}€/{language === 'de' ? 'Jahr' : language === 'en' ? 'year' : 'yıl'}
                                    </div>
                                </div>

                                <div className="plan-features">
                                    <div className="feature-item">
                                        <span className="feature-label">{txt.productLimit}:</span>
                                        <span className="feature-value">
                                            {plan.product_limit === -1 ? txt.unlimited : plan.product_limit}
                                        </span>
                                    </div>
                                    <div className="feature-item">
                                        <span className={`feature-check ${plan.has_priority_listing ? 'yes' : 'no'}`}>
                                            {plan.has_priority_listing ? '✓' : '✗'}
                                        </span>
                                        {txt.priorityListing}
                                    </div>
                                    <div className="feature-item">
                                        <span className={`feature-check ${plan.has_analytics ? 'yes' : 'no'}`}>
                                            {plan.has_analytics ? '✓' : '✗'}
                                        </span>
                                        {txt.analytics}
                                    </div>
                                    <div className="feature-item">
                                        <span className={`feature-check ${plan.has_featured_homepage ? 'yes' : 'no'}`}>
                                            {plan.has_featured_homepage ? '✓' : '✗'}
                                        </span>
                                        {txt.featuredHomepage}
                                    </div>
                                    <div className="feature-item">
                                        <span className={`feature-check ${plan.has_vip_badge ? 'yes' : 'no'}`}>
                                            {plan.has_vip_badge ? '✓' : '✗'}
                                        </span>
                                        {txt.vipBadge}
                                    </div>
                                    <div className="feature-item">
                                        <span className={`feature-check ${plan.has_affiliate_access ? 'yes' : 'no'}`}>
                                            {plan.has_affiliate_access ? '✓' : '✗'}
                                        </span>
                                        {txt.affiliateAccess}
                                    </div>
                                </div>

                                <div className="plan-status">
                                    <span className={`status-badge ${plan.is_active ? 'active' : 'inactive'}`}>
                                        {plan.is_active ? txt.active : 'Deaktif'}
                                    </span>
                                </div>

                                <button className="btn-edit" onClick={() => handleEdit(plan)}>
                                    ✏️ {txt.edit}
                                </button>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminShopPlans;
