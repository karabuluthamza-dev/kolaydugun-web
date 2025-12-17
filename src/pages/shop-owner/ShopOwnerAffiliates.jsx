import React, { useState, useEffect } from 'react';
import { useShopOwner } from '../../context/ShopOwnerContext';
import { useLanguage } from '../../context/LanguageContext';
import { supabase } from '../../supabaseClient';

const ShopOwnerAffiliates = () => {
    const { shopAccount } = useShopOwner();
    const { language } = useLanguage();
    const [affiliateStats, setAffiliateStats] = useState({
        totalClicks: 0,
        last30DaysClicks: 0,
        totalApplications: 0,
        conversionRate: 0,
        totalEarnings: 0,
        pendingEarnings: 0,
        paidEarnings: 0
    });
    const [earnings, setEarnings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionMessage, setActionMessage] = useState(''); // New state for feedback
    const [copied, setCopied] = useState(false);

    // Campaign States
    const [campaigns, setCampaigns] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newCampaignLabel, setNewCampaignLabel] = useState('');
    const [creatingCampaign, setCreatingCampaign] = useState(false);
    const [campaignStats, setCampaignStats] = useState({});

    const texts = {
        tr: {
            title: 'Affiliate Programı',
            subtitle: 'Referans linkinizi paylaşarak kazanç sağlayın',
            yourLink: 'Referans Linkiniz',
            copyLink: 'Linki Kopyala',
            copied: 'Kopyalandı!',
            howItWorks: 'Nasıl Çalışır?',
            step1: 'Referans linkinizi paylaşın',
            step2: 'Birileri linkinizden başvuru yapsın',
            step3: 'Başvuru onaylanınca %10 komisyon kazanın',
            totalEarnings: 'Toplam Kazanç',
            pendingEarnings: 'Bekleyen',
            paidEarnings: 'Ödenen',
            totalClicks: 'Toplam Tıklama',
            last30Days: 'Son 30 Gün',
            conversions: 'Dönüşüm',
            earningsHistory: 'Kazanç Geçmişi',
            date: 'Tarih',
            source: 'Kaynak',
            amount: 'Tutar',
            status: 'Durum',
            noEarnings: 'Henüz kazanç yok',
            pending: 'Beklemede',
            approved: 'Onaylandı',
            paid: 'Ödendi',
            cancelled: 'İptal',
            shareOn: 'Paylaş:'
        },
        de: {
            title: 'Affiliate-Programm',
            subtitle: 'Verdienen Sie durch Teilen Ihres Empfehlungslinks',
            yourLink: 'Ihr Empfehlungslink',
            copyLink: 'Link kopieren',
            copied: 'Kopiert!',
            howItWorks: 'Wie funktioniert es?',
            step1: 'Teilen Sie Ihren Empfehlungslink',
            step2: 'Jemand bewirbt sich über Ihren Link',
            step3: 'Verdienen Sie 10% Provision bei Genehmigung',
            totalEarnings: 'Gesamtverdienst',
            pendingEarnings: 'Ausstehend',
            paidEarnings: 'Ausgezahlt',
            totalClicks: 'Gesamtklicks',
            last30Days: 'Letzte 30 Tage',
            conversions: 'Konversionen',
            earningsHistory: 'Verdienstverlauf',
            date: 'Datum',
            source: 'Quelle',
            amount: 'Betrag',
            status: 'Status',
            noEarnings: 'Noch keine Einnahmen',
            pending: 'Ausstehend',
            approved: 'Genehmigt',
            paid: 'Ausgezahlt',
            cancelled: 'Storniert',
            shareOn: 'Teilen:'
        },
        en: {
            title: 'Affiliate Program',
            subtitle: 'Earn by sharing your referral link',
            yourLink: 'Your Referral Link',
            copyLink: 'Copy Link',
            copied: 'Copied!',
            howItWorks: 'How It Works?',
            step1: 'Share your referral link',
            step2: 'Someone applies through your link',
            step3: 'Earn 10% commission when approved',
            totalEarnings: 'Total Earnings',
            pendingEarnings: 'Pending',
            paidEarnings: 'Paid',
            totalClicks: 'Total Clicks',
            last30Days: 'Last 30 Days',
            conversions: 'Conversions',
            earningsHistory: 'Earnings History',
            date: 'Date',
            source: 'Source',
            amount: 'Amount',
            status: 'Status',
            noEarnings: 'No earnings yet',
            pending: 'Pending',
            approved: 'Approved',
            paid: 'Paid',
            cancelled: 'Cancelled',
            shareOn: 'Share:',
            campaigns: {
                title: 'Campaign Links',
                createBtn: 'Create Custom Link',
                label: 'Label',
                slug: 'Slug / URL',
                clicks: 'Clicks',
                applications: 'Apps',
                earnings: 'Earnings',
                actions: 'Actions',
                delete: 'Delete',
                createTitle: 'Create New Campaign Link',
                labelPlaceholder: 'e.g. Instagram Bio, Facebook Group',
                create: 'Create',
                cancel: 'Cancel',
                noCampaigns: 'No custom links created yet.',
                copy: 'Copy',
                copied: 'Copied!'
            }
        }
    };

    // Text translations for campaigns (quick fix for missing translations above)
    texts.tr.campaigns = {
        title: 'Özel Kampanya Linkleri',
        createBtn: 'Yeni Link Oluştur',
        label: 'Etiket',
        slug: 'URL Uzantısı',
        clicks: 'Tık',
        applications: 'Başvuru',
        earnings: 'Kazanç',
        actions: 'İşlemler',
        delete: 'Sil',
        createTitle: 'Yeni Kampanya Linki Oluştur',
        labelPlaceholder: 'Örn: Instagram Bio, Ahmet Influencer',
        create: 'Oluştur',
        cancel: 'İptal',
        noCampaigns: 'Henüz özel link oluşturmadınız.',
        copy: 'Kopyala',
        copied: 'Kopyalandı!'
    };
    texts.de.campaigns = {
        title: 'Benutzerdefinierte Kampagnenlinks',
        createBtn: 'Neuen Link erstellen',
        label: 'Etikett',
        slug: 'URL-Erweiterung',
        clicks: 'Klicks',
        applications: 'Anwendungen',
        earnings: 'Verdienst',
        actions: 'Aktionen',
        delete: 'Löschen',
        createTitle: 'Neuen Kampagnenlink erstellen',
        labelPlaceholder: 'z.B. Instagram Bio, Facebook Gruppe',
        create: 'Erstellen',
        cancel: 'Abbrechen',
        noCampaigns: 'Noch keine benutzerdefinierten Links erstellt.',
        copy: 'Kopieren',
        copied: 'Kopiert!'
    };

    const txt = texts[language] || texts.tr;

    const referralLink = `https://kolaydugun.de/shop/basvuru?ref=${shopAccount?.affiliate_code || ''}`;

    useEffect(() => {
        if (shopAccount?.id) {
            fetchAffiliateData();
        }
    }, [shopAccount]);

    const fetchAffiliateData = async () => {
        try {
            setLoading(true);

            // Fetch click stats
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const { data: clicksData, error: clicksError } = await supabase
                .from('shop_affiliate_clicks')
                .select('id, created_at')
                .eq('shop_account_id', shopAccount.id);

            if (!clicksError && clicksData) {
                const last30 = clicksData.filter(c => new Date(c.created_at) >= thirtyDaysAgo);
                setAffiliateStats(prev => ({
                    ...prev,
                    totalClicks: clicksData.length,
                    last30DaysClicks: last30.length
                }));
            }

            // Fetch applications that came from this affiliate
            const { data: appsData, error: appsError } = await supabase
                .from('shop_applications')
                .select('id')
                .eq('referred_by_shop_id', shopAccount.id);

            if (!appsError && appsData) {
                const totalApps = appsData.length;
                const totalClicks = clicksData?.length || 1;
                setAffiliateStats(prev => ({
                    ...prev,
                    totalApplications: totalApps,
                    conversionRate: totalClicks > 0 ? ((totalApps / totalClicks) * 100).toFixed(1) : 0
                }));
            }

            // Fetch earnings history (from new shop_affiliate_earnings table)
            // Note: No JOIN used due to missing foreign key constraints
            const { data: earningsData, error: earningsError } = await supabase
                .from('shop_affiliate_earnings')
                .select('*')
                .eq('earning_shop_id', shopAccount.id)
                .order('created_at', { ascending: false });

            if (!earningsError && earningsData) {
                // Fetch referred shop data separately
                const referredShopIds = [...new Set(earningsData.map(e => e.referred_shop_id).filter(Boolean))];
                let shopsMap = {};

                if (referredShopIds.length > 0) {
                    const { data: shopsData } = await supabase
                        .from('shop_accounts')
                        .select('id, business_name, slug')
                        .in('id', referredShopIds);

                    if (shopsData) {
                        shopsData.forEach(shop => {
                            shopsMap[shop.id] = shop;
                        });
                    }
                }

                // Attach shop info to earnings
                const enrichedEarnings = earningsData.map(e => ({
                    ...e,
                    referred_shop: shopsMap[e.referred_shop_id] || null
                }));

                // Calculate earnings stats
                const totalEarnings = earningsData.reduce((sum, e) => sum + parseFloat(e.commission_amount || 0), 0);
                const pendingEarnings = earningsData
                    .filter(e => e.status === 'pending' || e.status === 'approved')
                    .reduce((sum, e) => sum + parseFloat(e.commission_amount || 0), 0);
                const paidEarnings = earningsData
                    .filter(e => e.status === 'paid')
                    .reduce((sum, e) => sum + parseFloat(e.commission_amount || 0), 0);

                setAffiliateStats(prev => ({
                    ...prev,
                    totalEarnings,
                    pendingEarnings,
                    paidEarnings
                }));

                setEarnings(enrichedEarnings || []);

                // Fetch Campaigns
                const { data: campaignsData, error: campaignsError } = await supabase
                    .from('shop_affiliate_campaigns')
                    .select('*')
                    .eq('shop_id', shopAccount.id)
                    .order('created_at', { ascending: false });

                if (!campaignsError && campaignsData) {
                    setCampaigns(campaignsData);

                    // Calculate stats per campaign
                    const stats = {};
                    campaignsData.forEach(c => {
                        stats[c.slug] = { clicks: 0, apps: 0, earnings: 0 };
                    });

                    // Clicks by campaign
                    if (clicksData) {
                        clicksData.forEach(click => {
                            if (click.campaign_slug && stats[click.campaign_slug]) {
                                stats[click.campaign_slug].clicks++;
                            }
                        });
                    }

                    // Apps by campaign
                    // Need to fetch campaign_slug for apps (added in migration)
                    const { data: appsWithCampaign } = await supabase
                        .from('shop_applications')
                        .select('id, affiliate_campaign_slug')
                        .eq('referred_by_shop_id', shopAccount.id);

                    if (appsWithCampaign) {
                        appsWithCampaign.forEach(app => {
                            if (app.affiliate_campaign_slug && stats[app.affiliate_campaign_slug]) {
                                stats[app.affiliate_campaign_slug].apps++;
                            }
                        });
                    }

                    // Earnings by campaign
                    if (earningsData) {
                        earningsData.forEach(earning => {
                            if (earning.campaign_slug && stats[earning.campaign_slug]) {
                                stats[earning.campaign_slug].earnings += parseFloat(earning.amount);
                            }
                        });
                    }

                    setCampaignStats(stats);
                }
            }

        } catch (error) {
            console.error('Error fetching affiliate data:', error);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(referralLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            // Fallback
            const textArea = document.createElement('textarea');
            textArea.value = referralLink;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const shareOnWhatsApp = () => {
        window.open(`https://wa.me/?text=${encodeURIComponent(referralLink)}`, '_blank');
    };

    const shareOnTwitter = () => {
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(referralLink)}`, '_blank');
    };

    const shareOnFacebook = () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`, '_blank');
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('de-DE');
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            pending: { class: 'pending', text: txt.pending },
            approved: { class: 'approved', text: txt.approved },
            paid: { class: 'paid', text: txt.paid },
            cancelled: { class: 'cancelled', text: txt.cancelled }
        };
        const s = statusMap[status] || statusMap.pending;
        return <span className={`status-badge ${s.class}`}>{s.text}</span>;
    };

    const handleCreateCampaign = async (e) => {
        e.preventDefault();
        if (!newCampaignLabel.trim()) return;
        setCreatingCampaign(true);

        const slug = newCampaignLabel.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '') + '-' + Math.random().toString(36).substring(2, 6);

        try {
            const { data, error } = await supabase
                .from('shop_affiliate_campaigns')
                .insert([{
                    shop_id: shopAccount.id,
                    label: newCampaignLabel,
                    slug: slug
                }])
                .select()
                .single();

            if (error) throw error;

            setCampaigns([data, ...campaigns]);
            setCampaignStats(prev => ({ ...prev, [slug]: { clicks: 0, apps: 0, earnings: 0 } }));
            setNewCampaignLabel('');
            setShowCreateModal(false);
        } catch (error) {
            console.error('Error creating campaign:', error);
            alert('Error creating campaign');
        } finally {
            setCreatingCampaign(false);
        }
    };

    const handleDeleteCampaign = async (id, slug, e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        // Temporary bypass verify
        // if (!window.confirm(`"${slug}" kampanyasını silmek istediğinize emin misiniz?`)) return;

        try {
            const { error } = await supabase
                .from('shop_affiliate_campaigns')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setCampaigns(campaigns.filter(c => c.id !== id));
            setActionMessage(`"${slug}" silindi!`);
            setTimeout(() => setActionMessage(''), 3000);
        } catch (error) {
            console.error('Error deleting campaign:', error);
            setActionMessage('Hata: ' + error.message);
            setTimeout(() => setActionMessage(''), 5000);
        }
    };

    const copyCampaignLink = async (slug, e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        const link = `${window.location.origin}/shop/basvuru?ref=${shopAccount?.affiliate_code}&c=${slug}`;
        try {
            await navigator.clipboard.writeText(link);
            setActionMessage('Link Kopyalandı! ✅');
            setTimeout(() => setActionMessage(''), 3000);
        } catch (err) {
            // Fallback
            try {
                const textArea = document.createElement("textarea");
                textArea.value = link;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                setActionMessage('Link Kopyalandı (Manuel)! ✅');
                setTimeout(() => setActionMessage(''), 3000);
            } catch (fallbackErr) {
                setActionMessage('Kopyalanamadı. Konsola bakın.');
            }
        }
    };

    if (loading) {
        return (
            <div className="affiliate-loading">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="shop-owner-affiliates">
            {actionMessage && (
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    background: '#333',
                    color: '#fff',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    zIndex: 9999,
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                    {actionMessage}
                </div>
            )}
            <div className="shop-page-header">
                <h1>🔗 {txt.title}</h1>
                <p>{txt.subtitle}</p>
            </div>

            {/* Referral Link Section */}
            <div className="shop-card referral-card">
                <h3>📎 {txt.yourLink}</h3>
                <div className="referral-link-box">
                    <input
                        type="text"
                        value={referralLink}
                        readOnly
                        className="referral-input"
                    />
                    <button
                        onClick={copyToClipboard}
                        className={`copy-btn ${copied ? 'copied' : ''}`}
                    >
                        {copied ? '✅ ' + txt.copied : '📋 ' + txt.copyLink}
                    </button>
                </div>
                <div className="share-buttons">
                    <span className="share-label">{txt.shareOn}</span>
                    <button onClick={shareOnWhatsApp} className="share-btn whatsapp">
                        <span>WhatsApp</span>
                    </button>
                    <button onClick={shareOnTwitter} className="share-btn twitter">
                        <span>Twitter</span>
                    </button>
                    <button onClick={shareOnFacebook} className="share-btn facebook">
                        <span>Facebook</span>
                    </button>
                </div>
            </div>

            {/* How It Works */}
            <div className="shop-card how-it-works">
                <h3>💡 {txt.howItWorks}</h3>
                <div className="steps">
                    <div className="step">
                        <span className="step-number">1</span>
                        <p>{txt.step1}</p>
                    </div>
                    <div className="step-arrow">→</div>
                    <div className="step">
                        <span className="step-number">2</span>
                        <p>{txt.step2}</p>
                    </div>
                    <div className="step-arrow">→</div>
                    <div className="step">
                        <span className="step-number">3</span>
                        <p>{txt.step3}</p>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="affiliate-stats-grid">
                <div className="stat-card earnings-total">
                    <div className="stat-icon">💰</div>
                    <div className="stat-info">
                        <span className="stat-label">{txt.totalEarnings}</span>
                        <span className="stat-value">{affiliateStats.totalEarnings.toFixed(2)}€</span>
                    </div>
                </div>
                <div className="stat-card earnings-pending">
                    <div className="stat-icon">⏳</div>
                    <div className="stat-info">
                        <span className="stat-label">{txt.pendingEarnings}</span>
                        <span className="stat-value">{affiliateStats.pendingEarnings.toFixed(2)}€</span>
                    </div>
                </div>
                <div className="stat-card earnings-paid">
                    <div className="stat-icon">✅</div>
                    <div className="stat-info">
                        <span className="stat-label">{txt.paidEarnings}</span>
                        <span className="stat-value">{affiliateStats.paidEarnings.toFixed(2)}€</span>
                    </div>
                </div>
                <div className="stat-card clicks">
                    <div className="stat-icon">🖱️</div>
                    <div className="stat-info">
                        <span className="stat-label">{txt.totalClicks}</span>
                        <span className="stat-value">{affiliateStats.totalClicks}</span>
                    </div>
                </div>
                <div className="stat-card clicks-30">
                    <div className="stat-icon">📊</div>
                    <div className="stat-info">
                        <span className="stat-label">{txt.last30Days}</span>
                        <span className="stat-value">{affiliateStats.last30DaysClicks}</span>
                    </div>
                </div>
                <div className="stat-card conversion">
                    <div className="stat-icon">🎯</div>
                    <div className="stat-info">
                        <span className="stat-label">{txt.conversions}</span>
                        <span className="stat-value">{affiliateStats.conversionRate}%</span>
                    </div>
                </div>
            </div>

            {/* Earnings History */}
            <div className="shop-card earnings-history">
                <h3>📜 {txt.earningsHistory}</h3>
                {earnings.length === 0 ? (
                    <div className="empty-state">
                        <span className="empty-icon">💸</span>
                        <p>{txt.noEarnings}</p>
                    </div>
                ) : (
                    <div className="earnings-table">
                        <div className="table-header">
                            <span>{txt.date}</span>
                            <span>{txt.source}</span>
                            <span>{txt.amount}</span>
                            <span>{txt.status}</span>
                        </div>
                        {earnings.map(earning => (
                            <div key={earning.id} className="table-row">
                                <span>{formatDate(earning.created_at)}</span>
                                <span>{earning.referred_shop?.business_name || earning.earning_type || '-'}</span>
                                <span className="amount">{parseFloat(earning.commission_amount || 0).toFixed(2)}€</span>
                                <span>{getStatusBadge(earning.status)}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Campaigns Section */}
            <div className="shop-card campaigns-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3>🏷️ {txt.campaigns.title}</h3>
                    <button onClick={() => setShowCreateModal(true)} className="btn-secondary">
                        + {txt.campaigns.createBtn}
                    </button>
                </div>

                {campaigns.length === 0 ? (
                    <p className="no-data">{txt.campaigns.noCampaigns}</p>
                ) : (
                    <div className="campaigns-table">
                        <div className="table-header" style={{ gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 1fr' }}>
                            <span>{txt.campaigns.label}</span>
                            <span>{txt.campaigns.slug}</span>
                            <span style={{ textAlign: 'center' }}>{txt.campaigns.clicks}</span>
                            <span style={{ textAlign: 'center' }}>{txt.campaigns.applications}</span>
                            <span style={{ textAlign: 'center' }}>{txt.campaigns.earnings}</span>
                            <span style={{ textAlign: 'right' }}>{txt.campaigns.actions}</span>
                        </div>
                        {campaigns.map(c => {
                            const stats = campaignStats[c.slug] || { clicks: 0, apps: 0, earnings: 0 };
                            return (
                                <div key={c.id} className="table-row" style={{ gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 1fr' }}>
                                    <span style={{ fontWeight: 600 }}>{c.label}</span>
                                    <span style={{ fontSize: '0.8rem', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.slug}</span>
                                    <span style={{ textAlign: 'center' }}>{stats.clicks}</span>
                                    <span style={{ textAlign: 'center' }}>{stats.apps}</span>
                                    <span style={{ textAlign: 'center', color: '#10b981' }}>{stats.earnings}€</span>
                                    <div style={{ textAlign: 'right', display: 'flex', gap: '5px', justifyContent: 'flex-end', zIndex: 100, position: 'relative' }}>
                                        <span
                                            role="button"
                                            onClick={(e) => {
                                                console.log('Copy clicked');
                                                copyCampaignLink(c.slug, e);
                                            }}
                                            className="action-btn copy"
                                            style={{ cursor: 'pointer', position: 'relative', zIndex: 101, padding: '8px', fontSize: '1.2rem', display: 'inline-block' }}
                                            title="Linki Kopyala"
                                        >
                                            🔗
                                        </span>
                                        <span
                                            role="button"
                                            onClick={(e) => {
                                                console.log('Delete clicked');
                                                handleDeleteCampaign(c.id, c.slug, e);
                                            }}
                                            className="action-btn delete"
                                            style={{ cursor: 'pointer', position: 'relative', zIndex: 101, padding: '8px', color: 'red', fontSize: '1.2rem', display: 'inline-block' }}
                                            title="Kampanyayı Sil"
                                        >
                                            🗑️
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Create Campaign Modal */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                        <h3 style={{ marginTop: 0 }}>{txt.campaigns.createTitle}</h3>
                        <form onSubmit={handleCreateCampaign}>
                            <div className="form-group">
                                <label>{txt.campaigns.label}</label>
                                <input
                                    type="text"
                                    placeholder={txt.campaigns.labelPlaceholder}
                                    value={newCampaignLabel}
                                    onChange={e => setNewCampaignLabel(e.target.value)}
                                    autoFocus
                                    required
                                />
                            </div>
                            <div className="form-actions" style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-cancel" style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ddd', background: 'white' }}>
                                    {txt.campaigns.cancel}
                                </button>
                                <button type="submit" disabled={creatingCampaign} className="btn-primary" style={{ flex: 1 }}>
                                    {creatingCampaign ? '...' : txt.campaigns.create}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .shop-owner-affiliates {
                    padding: 0;
                }

                .referral-card {
                    background: linear-gradient(135deg, #fdf2f8 0%, #f5f3ff 100%);
                    border: 2px solid #FF6B9D20;
                }

                .referral-link-box {
                    display: flex;
                    gap: 0.75rem;
                    margin: 1rem 0;
                }

                .referral-input {
                    flex: 1;
                    padding: 14px 16px;
                    border: 2px solid #e5e7eb;
                    border-radius: 12px;
                    font-size: 0.95rem;
                    background: white;
                    color: #374151;
                }

                .copy-btn {
                    padding: 14px 24px;
                    background: linear-gradient(135deg, #FF6B9D 0%, #c084fc 100%);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    white-space: nowrap;
                }

                .copy-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(255, 107, 157, 0.3);
                }

                .copy-btn.copied {
                    background: #10b981;
                }

                .share-buttons {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-top: 1rem;
                }

                .share-label {
                    color: #6b7280;
                    font-size: 0.9rem;
                }

                .share-btn {
                    padding: 10px 16px;
                    border: none;
                    border-radius: 8px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                    color: white;
                }

                .share-btn.whatsapp { background: #25D366; }
                .share-btn.twitter { background: #1DA1F2; }
                .share-btn.facebook { background: #4267B2; }

                .share-btn:hover {
                    transform: translateY(-2px);
                    opacity: 0.9;
                }

                .how-it-works .steps {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 1rem;
                    margin-top: 1.5rem;
                    flex-wrap: wrap;
                }

                .step {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    flex: 1;
                    min-width: 120px;
                }

                .step-number {
                    width: 40px;
                    height: 40px;
                    background: linear-gradient(135deg, #FF6B9D 0%, #c084fc 100%);
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 1.1rem;
                    margin-bottom: 0.5rem;
                }

                .step p {
                    color: #4b5563;
                    font-size: 0.9rem;
                    margin: 0;
                }

                .step-arrow {
                    color: #d1d5db;
                    font-size: 1.5rem;
                }

                .affiliate-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 1rem;
                    margin: 1.5rem 0;
                }

                .affiliate-stats-grid .stat-card {
                    background: white;
                    border-radius: 16px;
                    padding: 1.25rem;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
                    border: 1px solid #f0f0f0;
                }

                .stat-icon {
                    font-size: 1.75rem;
                }

                .stat-info {
                    display: flex;
                    flex-direction: column;
                }

                .stat-label {
                    font-size: 0.8rem;
                    color: #6b7280;
                }

                .stat-value {
                    font-size: 1.4rem;
                    font-weight: 700;
                    color: #111827;
                }

                .earnings-total .stat-value { color: #10b981; }
                .earnings-pending .stat-value { color: #f59e0b; }
                .earnings-paid .stat-value { color: #3b82f6; }

                .earnings-history .empty-state {
                    text-align: center;
                    padding: 3rem;
                    color: #6b7280;
                }

                .empty-icon {
                    font-size: 3rem;
                    display: block;
                    margin-bottom: 1rem;
                }

                .earnings-table {
                    margin-top: 1rem;
                }

                .table-header, .table-row {
                    display: grid;
                    grid-template-columns: 1fr 2fr 1fr 1fr;
                    gap: 1rem;
                    padding: 1rem;
                    align-items: center;
                }

                .table-header {
                    background: #f9fafb;
                    border-radius: 10px;
                    font-weight: 600;
                    color: #374151;
                    font-size: 0.85rem;
                }

                .table-row {
                    border-bottom: 1px solid #f0f0f0;
                }

                .table-row:last-child {
                    border-bottom: none;
                }

                .table-row .amount {
                    font-weight: 600;
                    color: #10b981;
                }

                .status-badge {
                    padding: 4px 10px;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 500;
                }

                .status-badge.pending { background: #fef3c7; color: #92400e; }
                .status-badge.approved { background: #d1fae5; color: #065f46; }
                .status-badge.paid { background: #dbeafe; color: #1e40af; }
                .status-badge.cancelled { background: #fee2e2; color: #991b1b; }

                .affiliate-loading {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 300px;
                }

                @media (max-width: 768px) {
                    .referral-link-box {
                        flex-direction: column;
                    }

                    .affiliate-stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }

                    .step-arrow {
                        display: none;
                    }

                    .table-header, .table-row {
                        grid-template-columns: 1fr 1fr 1fr;
                        font-size: 0.85rem;
                    }

                    .table-header span:nth-child(2),
                    .table-row span:nth-child(2) {
                        display: none;
                    }
                }

                .btn-secondary {
                    padding: 8px 16px;
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-secondary:hover {
                    border-color: #FF6B9D;
                    color: #FF6B9D;
                }

                .no-data {
                    text-align: center;
                    color: #9ca3af;
                    padding: 2rem;
                }

                .action-btn {
                    padding: 6px;
                    border: none;
                    background: #f3f4f6;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 1rem;
                }
                .action-btn:hover { background: #e5e7eb; }
                .action-btn.delete:hover { background: #fee2e2; color: #dc2626; }

                .modal-overlay {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.5);
                    display: flex; align-items: center; justifyContent: center;
                    z-index: 1000;
                }
                .modal-content {
                    background: white; padding: 24px; borderRadius: 16px; width: 90%;
                }
                .form-group label { display: block; margin-bottom: 5px; font-weight: 500; }
                .form-group input { width: 100%; padding: 10px; border: 1px solid #ddd; borderRadius: 8px; }
            `}</style>
        </div>
    );
};

export default ShopOwnerAffiliates;
