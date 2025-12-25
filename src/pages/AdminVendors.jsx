import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { usePageTitle } from '../hooks/usePageTitle';
import VendorCreateModal from '../components/Admin/VendorCreateModal';
import VendorEditModal from '../components/Admin/VendorEditModal';
import VendorImportModal from '../components/Admin/VendorImportModal';
import { useLanguage } from '../context/LanguageContext';
import { getCategoryTranslationKey } from '../constants/vendorData';
import { formatExternalUrl } from '../utils/urlUtils';
import { Brain, Layout, BarChart, TrendingUp, X, Sparkles, ExternalLink } from 'lucide-react';
import { categoryImages, defaultImage } from '../constants/categoryImages';
import './AdminVendors.css';

const AdminVendors = () => {
    const { t, language } = useLanguage();
    usePageTitle(t('adminPanel.vendors.title', 'Vendor Yönetimi'));
    const { user } = useAuth();
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, premium, free
    const [sourceFilter, setSourceFilter] = useState('all'); // all, organic, imported
    const [visualFilter, setVisualFilter] = useState('all'); // all, has_image, no_image

    // Search & Pagination State
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const PAGE_SIZE = 20;

    // Modal States
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [editingVendor, setEditingVendor] = useState(null);
    const [confirmingFeatured, setConfirmingFeatured] = useState(null);

    // Showcase Modal State
    const [showShowcaseModal, setShowShowcaseModal] = useState(false);
    const [showcaseVendor, setShowcaseVendor] = useState(null);
    const [showcaseDuration, setShowcaseDuration] = useState('1_month'); // 1_week, 1_month, 3_months, custom, unlimited
    const [showcaseCustomDate, setShowcaseCustomDate] = useState('');
    const [showcaseOrder, setShowcaseOrder] = useState(0);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null); // Inline delete confirmation state
    const [managingSubscription, setManagingSubscription] = useState(null); // Vendor being managed
    const [subModalPlan, setSubModalPlan] = useState('');
    const [subModalEndDate, setSubModalEndDate] = useState('');
    const [subModalCredits, setSubModalCredits] = useState(0);
    const [isSavingSub, setIsSavingSub] = useState(false);

    // AI Insight State
    const [aiInsightVendor, setAiInsightVendor] = useState(null);
    const [aiReport, setAiReport] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [isBulkGenerating, setIsBulkGenerating] = useState(false);
    const [sortConfig, setSortConfig] = useState({ column: 'created_at', direction: 'desc' });

    // Dashboard Metrics State
    const [dashboardMetrics, setDashboardMetrics] = useState({
        totalVendors: 0,
        verifiedVendors: 0,
        claimedVendors: 0,
        weeklyViews: 0,
        totalLeads: 0
    });
    const [vendorIdsWithImages, setVendorIdsWithImages] = useState([]);
    const [categoryMap, setCategoryMap] = useState({});

    const handleSort = (column) => {
        let direction = 'desc';
        if (sortConfig.column === column && sortConfig.direction === 'desc') {
            direction = 'asc';
        }
        setSortConfig({ column, direction });
        setPage(1); // Reset to first page when sorting changes
    };

    useEffect(() => {
        fetchVendors();
        fetchCategories();
    }, [filter]);

    const fetchCategories = async () => {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('name, image_url');
            if (error) throw error;

            const map = {};
            data.forEach(cat => {
                map[cat.name] = cat.image_url;
            });
            setCategoryMap(map);
        } catch (error) {
            console.error('Error fetching categories for map:', error);
        }
    };

    // Fetch existing AI insight when a vendor is selected
    useEffect(() => {
        const fetchExistingInsight = async () => {
            if (!aiInsightVendor) return;

            setIsAnalyzing(true);
            try {
                const { data, error } = await supabase
                    .from('vendor_insights')
                    .select('*')
                    .eq('vendor_id', aiInsightVendor.id)
                    .order('updated_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();

                if (error) {
                    console.error('Error fetching insight:', error);
                    setAiReport(null);
                } else if (data) {
                    setAiReport({
                        summary: data.summary,
                        recommendations: data.recommendations,
                        visibility_score: data.performance_score,
                        conversion_rate: data.metrics?.conversion_rate || 0,
                        is_published: data.is_published
                    });
                }
            } catch (err) {
                console.error('Insight fetch error:', err);
            } finally {
                setIsAnalyzing(false);
            }
        };

        fetchExistingInsight();
    }, [aiInsightVendor]);

    useEffect(() => {
        window.supabase = supabase; // DEBUG: Expose for console access
        if (user) {
            // Debounce search
            const timer = setTimeout(() => {
                fetchVendors();
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [user, filter, sourceFilter, visualFilter, searchTerm, page, sortConfig]);

    const fetchVendors = async () => {
        setLoading(true);
        console.log('🔍 FETCH VENDORS START - Filter:', filter, 'Search:', searchTerm);

        let query = supabase
            .from('vendors')
            .select('*, vendor_insights(performance_score, updated_at, metrics)', { count: 'exact' })
            .is('deleted_at', null);

        // Apply Ordering
        if (sortConfig.column === 'ai_performance_score') {
            query = query.order('ai_performance_score', {
                ascending: sortConfig.direction === 'asc',
                nullsFirst: false
            });
        } else {
            query = query.order(sortConfig.column, { ascending: sortConfig.direction === 'asc' });
        }

        if (filter !== 'all') {
            query = query.eq('subscription_tier', filter);
        }

        if (sourceFilter === 'organic') {
            query = query.eq('is_claimed', true);
        } else if (sourceFilter === 'imported') {
            query = query.eq('is_claimed', false);
        }

        // Visual Filter will be applied using pre-fetched vendor IDs
        // This is more efficient than client-side filtering

        // Apply Search Filter
        if (searchTerm) {
            query = query.ilike('business_name', `%${searchTerm}%`);
        }

        // Apply Visual Filter using vendor IDs from dashboard metrics
        if (visualFilter === 'has_image' && vendorIdsWithImages.length > 0) {
            console.log('🖼️ Applying HAS_IMAGE filter with', vendorIdsWithImages.length, 'IDs');
            query = query.in('id', vendorIdsWithImages);
        } else if (visualFilter === 'no_image' && vendorIdsWithImages.length > 0) {
            console.log('⚠️ Applying NO_IMAGE filter (excluding', vendorIdsWithImages.length, 'IDs)');
            // For no_image, we need to exclude vendors with images
            // This is tricky with Supabase, so we'll do it differently
        }

        // Apply Pagination
        const from = (page - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;
        query = query.range(from, to);

        const { data: vendorsData, count, error: vendorsError } = await query;

        if (vendorsError) {
            console.error('❌ Error fetching vendors:', vendorsError);
            setLoading(false);
            return;
        }

        // For no_image filter, we need to apply client-side filtering
        let filteredVendors = vendorsData || [];
        if (visualFilter === 'no_image') {
            filteredVendors = filteredVendors.filter(v =>
                !vendorIdsWithImages.includes(v.id)
            );
        }

        setVendors(filteredVendors);

        // Adjust total count based on filter
        if (visualFilter === 'has_image') {
            setTotalCount(vendorIdsWithImages.length);
        } else if (visualFilter === 'no_image') {
            setTotalCount((count || 0) - vendorIdsWithImages.length);
        } else {
            setTotalCount(count || 0);
        }
        setLoading(false);
    };

    // Fetch Dashboard Metrics
    const fetchDashboardMetrics = async () => {
        try {
            // Total vendors
            const { count: total } = await supabase
                .from('vendors')
                .select('*', { count: 'exact', head: true })
                .is('deleted_at', null);

            // Verified vendors
            const { count: verified } = await supabase
                .from('vendors')
                .select('*', { count: 'exact', head: true })
                .is('deleted_at', null)
                .eq('is_verified', true);

            // Claimed vendors
            const { count: claimed } = await supabase
                .from('vendors')
                .select('*', { count: 'exact', head: true })
                .is('deleted_at', null)
                .eq('is_claimed', true);

            // Total leads this month
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);

            const { count: leads } = await supabase
                .from('leads')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', startOfMonth.toISOString());

            // Count vendors with/without images (fetch id and gallery columns)
            // We need to fetch ALL vendors in chunks because Supabase limits to 1000 rows
            let allGalleryData = [];
            let offset = 0;
            const batchSize = 1000;
            let hasMore = true;

            while (hasMore) {
                const { data, error } = await supabase
                    .from('vendors')
                    .select('id, gallery')
                    .is('deleted_at', null)
                    .range(offset, offset + batchSize - 1);

                if (error) {
                    console.error('Error fetching gallery chunk:', error);
                    break;
                }

                if (data && data.length > 0) {
                    allGalleryData = [...allGalleryData, ...data];
                    offset += batchSize;
                    if (data.length < batchSize) hasMore = false;
                } else {
                    hasMore = false;
                }
            }

            const vendorsWithGallery = allGalleryData.filter(v =>
                v.gallery && Array.isArray(v.gallery) && v.gallery.length > 0
            ) || [];
            const withImages = vendorsWithGallery.length;
            const withoutImages = (total || 0) - withImages;

            // Save IDs of vendors with images for filtering
            setVendorIdsWithImages(vendorsWithGallery.map(v => v.id));

            setDashboardMetrics({
                totalVendors: total || 0,
                verifiedVendors: verified || 0,
                claimedVendors: claimed || 0,
                weeklyViews: 0,
                totalLeads: leads || 0,
                withImages,
                withoutImages
            });
        } catch (error) {
            console.error('Error fetching dashboard metrics:', error);
        }
    };

    // Fetch metrics on mount
    useEffect(() => {
        fetchDashboardMetrics();
    }, []);

    // Bulk Selection State
    const [selectedVendors, setSelectedVendors] = useState(new Set());
    const [showBulkConfirm, setShowBulkConfirm] = useState(false);

    const toggleSelectAll = () => {
        if (selectedVendors.size === vendors.length) {
            setSelectedVendors(new Set());
        } else {
            setSelectedVendors(new Set(vendors.map(v => v.id)));
        }
    };

    const toggleSelectVendor = (id) => {
        const newSelected = new Set(selectedVendors);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedVendors(newSelected);
    };

    const handleBulkVerify = async () => {
        try {
            const { error } = await supabase
                .from('vendors')
                .update({ is_verified: true })
                .in('id', Array.from(selectedVendors));

            if (error) throw error;

            // Update local state
            setVendors(vendors.map(v =>
                selectedVendors.has(v.id) ? { ...v, is_verified: true } : v
            ));

            alert('✅ ' + t('adminPanel.vendors.feedback.successVerify', 'Seçilen tedarikçiler onaylandı.'));
            setSelectedVendors(new Set());
            setShowBulkConfirm(false);
        } catch (err) {
            console.error('Bulk verify error:', err);
            alert(t('common.error', 'Hata: ') + err.message);
        }
    };

    const handleBulkDelete = async () => {
        console.log('🗑️ BULK DELETE BAŞLATILDI');
        console.log('Seçilenler:', Array.from(selectedVendors));

        try {
            const { error } = await supabase
                .from('vendors')
                .update({ deleted_at: new Date().toISOString() })
                .in('id', Array.from(selectedVendors));

            if (error) {
                console.error('❌ Bulk Delete Error:', error);
                throw error;
            }

            console.log('✅ Bulk Delete Başarılı');
            alert('✅ ' + t('adminPanel.vendors.feedback.successDelete', 'Seçilen tedarikçiler silindi.'));
            setSelectedVendors(new Set());
            setShowBulkConfirm(false);
            fetchVendors();
        } catch (err) {
            console.error('Bulk delete catch:', err);
            alert(t('common.error', 'Hata: ') + err.message);
        }
    };

    const openShowcaseModal = (vendor) => {
        setShowcaseVendor(vendor);
        setShowcaseOrder(vendor.featured_sort_order || 0);
        setShowcaseDuration('1_month');
        setShowShowcaseModal(true);
    };

    const handleShowcaseSubmit = async () => {
        if (!showcaseVendor) return;

        let expiresAt = null;
        const now = new Date();

        switch (showcaseDuration) {
            case '1_week':
                now.setDate(now.getDate() + 7);
                expiresAt = now.toISOString();
                break;
            case '1_month':
                now.setMonth(now.getMonth() + 1);
                expiresAt = now.toISOString();
                break;
            case '3_months':
                now.setMonth(now.getMonth() + 3);
                expiresAt = now.toISOString();
                break;
            case 'custom':
                if (showcaseCustomDate) {
                    expiresAt = new Date(showcaseCustomDate).toISOString();
                }
                break;
            case 'unlimited':
                expiresAt = null;
                break;
        }

        await toggleFeatured(showcaseVendor.id, true, expiresAt, showcaseOrder);
        setShowShowcaseModal(false);
        setShowcaseVendor(null);
    };

    const openSubscriptionModal = (vendor) => {
        setManagingSubscription(vendor);
        setSubModalPlan(vendor.subscription_tier || 'free');
        setSubModalEndDate(vendor.subscription_end_date ? vendor.subscription_end_date.split('T')[0] : '');
        setSubModalCredits(0);
        setShowShowcaseModal(false); // Close others
        setEditingVendor(null);
    };

    const handleSubscriptionSubmit = async () => {
        if (!managingSubscription) return;

        // Premium seçiliyse tarih zorunlu olsun
        if (subModalPlan === 'premium' && !subModalEndDate) {
            alert('❌ ' + t('adminPanel.vendors.feedback.dateRequired', 'Premium paket için lütfen bir bitiş tarihi seçiniz.'));
            return;
        }

        setIsSavingSub(true);
        try {
            const vendorId = managingSubscription.id;
            const updates = {
                subscription_tier: subModalPlan,
                subscription_end_date: subModalEndDate ? new Date(subModalEndDate).toISOString() : null,
                credit_balance: (managingSubscription.credit_balance || 0) + parseInt(subModalCredits || 0),
                updated_at: new Date().toISOString()
            };

            // 1. Update vendors table
            const { error: vError } = await supabase
                .from('vendors')
                .update(updates)
                .eq('id', vendorId);

            if (vError) throw vError;

            // 2. Sync with vendor_subscriptions table
            const { data: planData } = await supabase
                .from('subscription_plans')
                .select('id')
                .eq('name', subModalPlan)
                .maybeSingle();

            if (planData) {
                await supabase
                    .from('vendor_subscriptions')
                    .upsert({
                        vendor_id: vendorId,
                        plan_id: planData.id,
                        status: 'active',
                        current_period_start: new Date().toISOString(),
                        current_period_end: updates.subscription_end_date,
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'vendor_id' });
            }

            // 3. Record transaction if credits added
            if (parseInt(subModalCredits) !== 0) {
                await supabase.from('transactions').insert({
                    user_id: vendorId,
                    type: 'admin_adjustment',
                    status: 'approved',
                    credits_added: parseInt(subModalCredits),
                    description: `Admin tarafından manuel kredi düzenlemesi.`,
                    amount: 0
                });
            }

            alert('✅ ' + t('adminPanel.vendors.feedback.successUpdate', 'Abonelik bilgileri güncellendi.'));
            setManagingSubscription(null);
            fetchVendors();
        } catch (err) {
            console.error('Sub update error:', err);
            alert('❌ ' + err.message);
        } finally {
            setIsSavingSub(false);
        }
    };

    const toggleFeatured = async (vendorId, newValue, expiresAt = null, sortOrder = 0) => {
        try {
            const { error } = await supabase.rpc('toggle_featured_vendor', {
                vendor_uuid: vendorId,
                is_featured_status: newValue,
                expires_at: expiresAt,
                sort_order: sortOrder
            });

            if (error) throw error;

            // Update local state immediately
            setVendors(vendors.map(v =>
                v.id === vendorId ? {
                    ...v,
                    is_featured: newValue,
                    featured_expires_at: expiresAt,
                    featured_sort_order: sortOrder
                } : v
            ));

        } catch (err) {
            console.error('Toggle featured error:', err);
            alert(t('common.error', 'Hata: ') + err.message);
        }
    };

    const toggleVerified = async (vendorId, newValue) => {
        try {
            const { error } = await supabase
                .from('vendors')
                .update({ is_verified: newValue })
                .eq('id', vendorId);

            if (error) throw error;

            // Update local state
            setVendors(vendors.map(v =>
                v.id === vendorId ? { ...v, is_verified: newValue } : v
            ));

        } catch (err) {
            console.error('Toggle verified error:', err);
            alert(t('common.error', 'Hata: ') + err.message);
        }
    };

    const updateSubscription = async (vendorId, newTier) => {
        try {
            // 1. Update vendors table
            const { error } = await supabase
                .from('vendors')
                .update({ subscription_tier: newTier })
                .eq('id', vendorId);

            if (error) throw error;

            // 2. Sync with vendor_subscriptions table
            try {
                const { data: plan } = await supabase
                    .from('subscription_plans')
                    .select('id')
                    .eq('name', newTier === 'premium' ? 'pro_monthly' : 'free')
                    .maybeSingle();

                if (plan) {
                    // Check for active subscription
                    const { data: activeSub } = await supabase
                        .from('vendor_subscriptions')
                        .select('id')
                        .eq('vendor_id', vendorId)
                        .eq('status', 'active')
                        .maybeSingle();

                    if (activeSub) {
                        await supabase
                            .from('vendor_subscriptions')
                            .update({
                                plan_id: plan.id,
                                updated_at: new Date().toISOString()
                            })
                            .eq('id', activeSub.id);
                    } else {
                        await supabase
                            .from('vendor_subscriptions')
                            .insert([{
                                vendor_id: vendorId,
                                plan_id: plan.id,
                                status: 'active',
                                started_at: new Date().toISOString(),
                                auto_renew: true
                            }]);
                    }
                }
            } catch (subErr) {
                console.warn('Subscription table update failed, but vendor table updated:', subErr);
            }

            fetchVendors();
        } catch (err) {
            console.error('Update error:', err);
            alert(t('common.error', 'Hata: ') + err.message);
        }
    };


    const handleGenerateInsight = async (vendor) => {
        setIsAnalyzing(true);
        try {
            // Call the upgraded SQL RPC (V2)
            const { data: rpcData, error: rpcError } = await supabase.rpc('generate_vendor_performance_report', {
                target_vendor_id: vendor.id
            });

            if (rpcError) throw rpcError;

            // Fetch the updated insight record
            const { data: insight, error: fetchError } = await supabase
                .from('vendor_insights')
                .select('*')
                .eq('vendor_id', vendor.id)
                .maybeSingle();

            if (fetchError) throw fetchError;

            if (insight) {
                setAiReport({
                    summary: insight.summary,
                    recommendations: insight.recommendations,
                    visibility_score: insight.performance_score,
                    conversion_rate: insight.metrics?.conversion_rate || 0,
                    review_count: insight.metrics?.review_count || 0,
                    favorite_count: insight.metrics?.favorite_count || 0,
                    avg_rating: insight.metrics?.avg_rating || 0
                });
            }

        } catch (err) {
            console.error('Insight error:', err);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handlePublishInsight = async () => {
        if (!aiInsightVendor || !aiReport) return;
        setIsPublishing(true);
        try {
            // Use the centralized RPC function for consistency
            const { error } = await supabase.rpc('generate_vendor_performance_report', {
                target_vendor_id: aiInsightVendor.id
            });

            if (error) throw error;
            alert('✅ ' + t('adminPanel.vendors.feedback.successPublish', 'Rapor başarıyla yayınlandı ve işletmeciye gönderildi.'));
            setAiInsightVendor(null);
            fetchVendors(); // Refresh status in table
        } catch (err) {
            console.error('Publish error:', err);
            alert(t('common.error', 'Hata: ') + err.message);
        } finally {
            setIsPublishing(false);
        }
    };

    const handleBulkGenerateInsights = async () => {
        console.log('🚀 Bulk AI Update: Start attempt');

        // Use a more modern confirmation check or ensure it's not being blocked
        const confirmed = window.confirm(t('adminPanel.vendors.feedback.bulkAiConfirm', 'Tüm aktif tedarikçiler için AI raporlarını toplu olarak güncellemek istediğinize emin misiniz? Bu işlem birkaç dakika sürebilir.'));

        if (!confirmed) {
            console.log('❌ Bulk update: Explicitly cancelled by user via dialog');
            return;
        }

        console.log('⏳ Bulk update: Commencing generation...');
        setIsBulkGenerating(true);
        try {
            console.log('📡 Bulk update: Calling RPC generate_all_active_vendor_reports');
            const { data, error } = await supabase.rpc('generate_all_active_vendor_reports');

            if (error) {
                console.error('📡 Bulk update: RPC Error:', error);
                throw error;
            }

            console.log('✅ Bulk update: Success! Processed count:', data);
            alert('✅ ' + t('adminPanel.vendors.feedback.successBulkAi', 'Tüm tedarikçiler için AI raporu başarıyla oluşturuldu.') + ` (${data} ${t('adminPanel.vendors.ai.reportTitle', 'rapor')} ${t('adminPanel.leads.status.contacted', 'işlendi')})`);
            fetchVendors(); // Refresh the score status in the table
        } catch (err) {
            console.error('❌ Bulk update: Fatal error:', err);
            alert(t('common.error', 'Hata: ') + err.message);
        } finally {
            setIsBulkGenerating(false);
            console.log('🏁 Bulk update: Process finished.');
        }
    };

    const confirmDelete = async (vendorId) => {
        console.log('🔴 HARD DELETE BAŞLADI - Vendor ID:', vendorId);

        try {
            // Use RPC function for hard delete to handle all dependencies
            // Note: definitive migration uses target_vendor_id as parameter name
            const { error } = await supabase.rpc('force_delete_vendor', {
                target_vendor_id: vendorId
            });

            if (error) {
                console.error('🔴 DELETE HATASI:', error);
                alert(t('common.error', 'Hata: ') + error.message);
                return;
            }

            console.log('✅ SİLME BAŞARILI');
            // alert('✅ ' + t('adminPanel.vendors.feedback.hardDeleteSuccess', 'Tedarikçi ve ilişkili tüm veriler başarıyla silindi.'));
            setConfirmDeleteId(null);
            fetchVendors();
        } catch (err) {
            console.error('Beklenmeyen hata:', err);
            alert(t('common.error', 'Hata: ') + err.message);
            setConfirmDeleteId(null);
        }
    };

    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    if (loading && !vendors.length) {
        return (
            <div className="section container" style={{ marginTop: '100px', textAlign: 'center' }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="section container admin-vendors-container">
            <div className="admin-vendors-header">
                <div>
                    <h1>{t('adminPanel.vendors.title', 'Vendor Yönetimi')} ({totalCount})</h1>
                    <p>{t('adminPanel.vendors.subtitle', 'Tüm tedarikçileri görüntüleyin ve yönetin')}</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                        ➕ {t('adminPanel.vendors.actions.addNew', 'Yeni Tedarikçi')}
                    </button>
                    <button className="btn btn-success" onClick={() => setShowImportModal(true)}>
                        📥 {t('adminPanel.vendors.actions.import', 'Excel İçe Aktar')}
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={handleBulkGenerateInsights}
                        disabled={isBulkGenerating}
                        style={{ background: '#1e1b4b', borderColor: '#1e1b4b', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        {isBulkGenerating ? t('adminPanel.vendors.ai.updating', '⌛ Güncelleniyor...') : <><Brain size={16} /> {t('adminPanel.vendors.ai.bulkUpdate', 'Toplu AI Güncelle')}</>}
                    </button>
                </div>
            </div>

            {/* Dashboard Metrics */}
            <div className="dashboard-metrics">
                <div className="metric-card">
                    <div className="metric-icon purple">📊</div>
                    <div className="metric-content">
                        <div className="metric-value">{dashboardMetrics.totalVendors}</div>
                        <div className="metric-label">{t('adminPanel.vendors.metrics.total', 'Toplam Tedarikçi')}</div>
                    </div>
                </div>
                <div className="metric-card">
                    <div className="metric-icon green">✅</div>
                    <div className="metric-content">
                        <div className="metric-value">{dashboardMetrics.verifiedVendors}</div>
                        <div className="metric-label">{t('adminPanel.vendors.metrics.verified', 'Onaylı')}</div>
                    </div>
                </div>
                <div className="metric-card">
                    <div className="metric-icon blue">👤</div>
                    <div className="metric-content">
                        <div className="metric-value">{dashboardMetrics.claimedVendors}</div>
                        <div className="metric-label">{t('adminPanel.vendors.metrics.claimed', 'Sahipli')}</div>
                    </div>
                </div>
                <div className="metric-card">
                    <div className="metric-icon orange">📈</div>
                    <div className="metric-content">
                        <div className="metric-value">{dashboardMetrics.totalLeads}</div>
                        <div className="metric-label">{t('adminPanel.vendors.metrics.monthlyLeads', 'Bu Ay Lead')}</div>
                    </div>
                </div>
            </div>

            {/* Filters & Search - NEW Flex Container */}
            <div style={{
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: '20px',
                marginBottom: '20px',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#fff',
                padding: '15px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                    <div className="filter-tabs" style={{ marginBottom: 0 }}>
                        <button
                            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                            onClick={() => { setFilter('all'); setPage(1); }}
                        >
                            📋 {t('adminPanel.vendors.filters.all', 'Tümü')}
                        </button>
                        <button
                            className={`filter-tab ${filter === 'premium' ? 'active' : ''}`}
                            onClick={() => { setFilter('premium'); setPage(1); }}
                        >
                            👑 {t('adminPanel.vendors.filters.premium', 'Premium')}
                        </button>
                        <button
                            className={`filter-tab ${filter === 'free' ? 'active' : ''}`}
                            onClick={() => { setFilter('free'); setPage(1); }}
                        >
                            🆓 {t('adminPanel.vendors.filters.free', 'Free')}
                        </button>
                    </div>

                    <div className="filter-tabs" style={{ marginBottom: 0 }}>
                        <button
                            className={`filter-tab ${sourceFilter === 'all' ? 'active' : ''}`}
                            onClick={() => { setSourceFilter('all'); setPage(1); }}
                        >
                            🌐 {t('common.all', 'Tümü')}
                        </button>
                        <button
                            className={`filter-tab ${sourceFilter === 'organic' ? 'active' : ''}`}
                            onClick={() => { setSourceFilter('organic'); setPage(1); }}
                        >
                            👤 {t('adminPanel.vendors.filters.organic', 'Üyeler')}
                        </button>
                        <button
                            className={`filter-tab ${sourceFilter === 'imported' ? 'active' : ''}`}
                            onClick={() => { setSourceFilter('imported'); setPage(1); }}
                        >
                            📥 {t('adminPanel.vendors.filters.imported', 'Adaylar')}
                        </button>
                    </div>

                    {/* Visual Filter Buttons - Clickable to filter by photo status */}
                    <div className="filter-tabs" style={{ marginBottom: 0, gap: '8px' }}>
                        <button
                            onClick={() => { setVisualFilter(visualFilter === 'has_image' ? 'all' : 'has_image'); setPage(1); }}
                            style={{
                                padding: '6px 12px',
                                borderRadius: '8px',
                                background: visualFilter === 'has_image' ? '#10b981' : 'rgba(16, 185, 129, 0.1)',
                                color: visualFilter === 'has_image' ? 'white' : '#10b981',
                                fontSize: '0.85rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            📸 <strong>{dashboardMetrics.withImages || 0}</strong> {t('adminPanel.vendors.filters.hasImage', 'Fotoğraflı')}
                        </button>
                        <button
                            onClick={() => { setVisualFilter(visualFilter === 'no_image' ? 'all' : 'no_image'); setPage(1); }}
                            style={{
                                padding: '6px 12px',
                                borderRadius: '8px',
                                background: visualFilter === 'no_image' ? '#ef4444' : 'rgba(239, 68, 68, 0.1)',
                                color: visualFilter === 'no_image' ? 'white' : '#ef4444',
                                fontSize: '0.85rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            ⚠️ <strong>{dashboardMetrics.withoutImages || 0}</strong> {t('adminPanel.vendors.filters.noImage', 'Fotoğrafsız')}
                        </button>
                    </div>
                </div>

                {/* SEARCH BAR */}
                <div style={{ flex: '1', minWidth: '250px', maxWidth: '400px' }}>
                    <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px' }}>🔍</span>
                        <input
                            type="text"
                            placeholder={t('adminPanel.vendors.filters.searchPlaceholder', 'Tedarikçi ara (işletme adı)...')}
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setPage(1); // Reset to page 1 on search
                            }}
                            style={{
                                width: '100%',
                                padding: '10px 10px 10px 40px',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '14px',
                                outline: 'none'
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Bulk Actions Bar */}
            {selectedVendors.size > 0 && (
                <div style={{
                    background: '#ffebee',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: '1px solid #ffcdd2'
                }}>
                    <span style={{ color: '#c62828', fontWeight: 'bold' }}>
                        {selectedVendors.size} {t('adminPanel.vendors.bulk.selected', 'tedarikçi seçildi')}
                    </span>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            className="btn btn-success"
                            onClick={handleBulkVerify}
                        >
                            ✅ {t('adminPanel.vendors.bulk.verify', 'Seçilenleri Onayla')}
                        </button>

                        {showBulkConfirm ? (
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <span style={{ fontWeight: 'bold', color: '#d32f2f' }}>{t('adminPanel.vendors.bulk.confirmDelete', 'Silmek istediğine emin misin?')}</span>
                                <button
                                    className="btn btn-danger"
                                    onClick={handleBulkDelete}
                                >
                                    {t('common.yes', 'Evet')}, {t('common.delete', 'Sil')}
                                </button>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setShowBulkConfirm(false)}
                                >
                                    {t('common.cancel', 'İptal')}
                                </button>
                            </div>
                        ) : (
                            <button
                                className="btn btn-danger"
                                onClick={() => setShowBulkConfirm(true)}
                            >
                                🗑️ {t('adminPanel.vendors.bulk.delete', 'Seçilenleri Sil')}
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Vendors Table */}
            {vendors.length === 0 ? (
                <div className="empty-state">
                    <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔍</div>
                    <h3>{t('adminPanel.vendors.feedback.noVendors', 'Tedarikçi bulunamadı')}</h3>
                    <p>{t('adminPanel.vendors.feedback.noVendorsDesc', 'Bu filtreye veya aramaya uygun tedarikçi yok.')}</p>
                </div>
            ) : (
                <>
                    <div className="vendors-table">
                        <table>
                            <thead>
                                <tr>
                                    <th style={{ width: '40px' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedVendors.size === vendors.length && vendors.length > 0}
                                            onChange={toggleSelectAll}
                                        />
                                    </th>
                                    <th style={{ width: '50px', textAlign: 'center', color: '#888' }}>#</th>
                                    <th style={{ width: '80px' }}>{t('adminPanel.vendors.table.thumbnail', 'Önizleme')}</th>
                                    <th onClick={() => handleSort('business_name')} style={{ cursor: 'pointer' }}>
                                        {t('adminPanel.vendors.table.businessName', 'İşletme Adı')} {sortConfig.column === 'business_name' && (sortConfig.direction === 'asc' ? '🔼' : '🔽')}
                                    </th>
                                    <th onClick={() => handleSort('category')} style={{ cursor: 'pointer' }}>
                                        {t('adminPanel.vendors.table.category', 'Kategori')} {sortConfig.column === 'category' && (sortConfig.direction === 'asc' ? '🔼' : '🔽')}
                                    </th>
                                    <th onClick={() => handleSort('city')} style={{ cursor: 'pointer' }}>
                                        {t('adminPanel.vendors.table.city', 'Şehir')} {sortConfig.column === 'city' && (sortConfig.direction === 'asc' ? '🔼' : '🔽')}
                                    </th>
                                    <th onClick={() => handleSort('subscription_tier')} style={{ cursor: 'pointer' }}>
                                        {t('adminPanel.vendors.table.membership', 'Üyelik')} {sortConfig.column === 'subscription_tier' && (sortConfig.direction === 'asc' ? '🔼' : '🔽')}
                                    </th>
                                    <th onClick={() => handleSort('ai_performance_score')} style={{ cursor: 'pointer' }}>
                                        {t('adminPanel.vendors.table.aiReport', 'AI Rapor')} {sortConfig.column === 'ai_performance_score' && (sortConfig.direction === 'asc' ? '🔼' : '🔽')}
                                    </th>
                                    <th>{t('adminPanel.vendors.table.source', 'Kaynak')}</th>
                                    <th onClick={() => handleSort('is_featured')} style={{ cursor: 'pointer' }}>
                                        {t('adminPanel.vendors.table.showcase', 'Vitrin')} {sortConfig.column === 'is_featured' && (sortConfig.direction === 'asc' ? '🔼' : '🔽')}
                                    </th>
                                    <th style={{ textAlign: 'center' }}>🖼️ {t('adminPanel.vendors.table.visual', 'Görsel')}</th>
                                    <th onClick={() => handleSort('is_verified')} style={{ cursor: 'pointer' }}>
                                        {t('adminPanel.vendors.table.status', 'Durum')} {sortConfig.column === 'is_verified' && (sortConfig.direction === 'asc' ? '🔼' : '🔽')}
                                    </th>
                                    <th>{t('adminPanel.vendors.table.actions', 'İşlemler')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vendors.map((vendor, index) => (
                                    <tr key={vendor.id} className={selectedVendors.has(vendor.id) ? 'selected-row' : ''}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedVendors.has(vendor.id)}
                                                onChange={() => toggleSelectVendor(vendor.id)}
                                            />
                                        </td>
                                        <td>
                                            <div style={{
                                                width: '50px',
                                                height: '50px',
                                                borderRadius: '8px',
                                                overflow: 'hidden',
                                                backgroundColor: '#f3f4f6',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                border: '1px solid #e5e7eb',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                            }}>
                                                {(() => {
                                                    const normalizedCat = vendor.category?.trim();
                                                    const dbCategoryImage = categoryMap[normalizedCat] || categoryMap[vendor.category];
                                                    const categoryDefault = dbCategoryImage || categoryImages[normalizedCat] || defaultImage;
                                                    const validImage = vendor.image || (Array.isArray(vendor.gallery) && vendor.gallery.length > 0 ? vendor.gallery[0] : categoryDefault);

                                                    return (
                                                        <img
                                                            src={validImage}
                                                            alt={vendor.business_name}
                                                            style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                objectFit: 'cover'
                                                            }}
                                                            onError={(e) => {
                                                                e.target.src = categoryDefault;
                                                            }}
                                                        />
                                                    );
                                                })()}
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'center', fontWeight: 'bold', color: '#888' }}>
                                            {vendors.length - index}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                                {/* Vendor Thumbnail */}
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                        <a
                                                            href={`/vendors/${vendor.slug || vendor.id}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            style={{
                                                                fontWeight: 'bold',
                                                                color: '#4f46e5',
                                                                textDecoration: 'none',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '6px'
                                                            }}
                                                            className="vendor-link-hover"
                                                            title={t('adminPanel.vendors.actions.viewProfile', 'Profili Görüntüle')}
                                                        >
                                                            🏢 {vendor.business_name}
                                                        </a>
                                                        {vendor.is_claimed ? (
                                                            <span title={t('common.claimed', 'Sahipli')} style={{ fontSize: '0.65rem', backgroundColor: '#f3e8ff', color: '#7e22ce', padding: '1px 5px', borderRadius: '4px', fontWeight: 'bold' }}>👤 {t('common.claimed', 'Sahipli')}</span>
                                                        ) : (
                                                            <span title={t('common.unclaimed', 'Sahipsiz')} style={{ fontSize: '0.65rem', backgroundColor: '#f1f5f9', color: '#64748b', padding: '1px 5px', borderRadius: '4px', fontWeight: 'bold' }}>👤 {t('common.unclaimed', 'Sahipsiz')}</span>
                                                        )}
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                                                        {vendor.contact_phone && (
                                                            <a href={`tel:${vendor.contact_phone}`}
                                                                style={{ fontSize: '0.7rem', color: '#059669', textDecoration: 'none', fontWeight: '600', backgroundColor: '#ecfdf5', padding: '2px 6px', borderRadius: '4px', border: '1px solid #d1fae5' }}
                                                                title={vendor.contact_phone}
                                                            >📞 Ara</a>
                                                        )}
                                                        {vendor.contact_email && (
                                                            <a href={`mailto:${vendor.contact_email}`}
                                                                style={{ fontSize: '0.7rem', color: '#2563eb', textDecoration: 'none', fontWeight: '600', backgroundColor: '#eff6ff', padding: '2px 6px', borderRadius: '4px', border: '1px solid #dbeafe' }}
                                                                title={vendor.contact_email}
                                                            >📧 Mail</a>
                                                        )}
                                                        {(vendor.scraper_source_url || vendor.website_url) && (
                                                            <a href={formatExternalUrl(vendor.scraper_source_url || vendor.website_url)}
                                                                target="_blank" rel="noopener noreferrer"
                                                                style={{ fontSize: '0.7rem', color: '#7c3aed', textDecoration: 'none', fontWeight: '600', backgroundColor: '#f5f3ff', padding: '2px 6px', borderRadius: '4px', border: '1px solid #ede9fe' }}
                                                                title={vendor.scraper_source_url ? 'Scraper Kaynak' : 'Web Sitesi'}
                                                            >🔗 Kaynak</a>
                                                        )}
                                                        {(vendor.is_verified || vendor.is_claimed) && (() => {
                                                            const insight = (vendor.vendor_insights && Array.isArray(vendor.vendor_insights)) ? vendor.vendor_insights[0] : (vendor.vendor_insights && typeof vendor.vendor_insights === 'object' ? vendor.vendor_insights : null);
                                                            const viewCount = insight?.metrics?.view_count || 0;
                                                            return (
                                                                <span title={t('adminPanel.vendors.table.viewCount', 'Toplam Görüntülenme')} style={{ fontSize: '0.7rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                                    👁️ {viewCount}
                                                                </span>
                                                            );
                                                        })()}
                                                    </div>
                                                    <div style={{ fontSize: '0.65rem', color: '#9ca3af', marginTop: '2px' }}>{vendor.id.substring(0, 8)}...</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            {t('categories.' + getCategoryTranslationKey(vendor.category))}
                                        </td>
                                        <td>{vendor.city}</td>
                                        <td>
                                            <select
                                                value={vendor.subscription_tier}
                                                onChange={(e) => updateSubscription(vendor.id, e.target.value)}
                                                className={`status-badge ${vendor.subscription_tier === 'premium' ? 'status-premium' : 'status-free'}`}
                                                style={{ border: 'none', cursor: 'pointer' }}
                                            >
                                                <option value="free">Free</option>
                                                <option value="premium">Premium</option>
                                            </select>
                                        </td>
                                        <td>
                                            {(() => {
                                                const insight = (vendor.vendor_insights && Array.isArray(vendor.vendor_insights))
                                                    ? vendor.vendor_insights[0]
                                                    : (vendor.vendor_insights && typeof vendor.vendor_insights === 'object' ? vendor.vendor_insights : null);

                                                return insight ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.8rem' }}>
                                                        <span style={{
                                                            color: insight.performance_score > 70 ? '#10b981' : '#f59e0b',
                                                            fontWeight: 'bold'
                                                        }}>
                                                            🌟 {insight.performance_score} {t('adminPanel.vendors.ai.score', 'Puan')}
                                                        </span>
                                                        <span style={{ fontSize: '0.7rem', color: '#888' }}>
                                                            {new Date(insight.updated_at).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'de-DE')}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span style={{ fontSize: '0.8rem', color: '#ccc' }}>{t('adminPanel.vendors.ai.noReport', 'Henüz yok')}</span>
                                                );
                                            })()}
                                        </td>
                                        <td>
                                            {(() => {
                                                const sourceUrl = vendor.scraper_source_url || vendor.website_url;
                                                const isScraper = !!vendor.scraper_source_url;

                                                return sourceUrl ? (
                                                    <a
                                                        href={formatExternalUrl(sourceUrl)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="btn-sm btn-outline-secondary"
                                                        style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem' }}
                                                        title={isScraper ? 'Orijinal Kaynak (Scraper)' : 'İşletme Web Sitesi'}
                                                    >
                                                        <ExternalLink size={12} />
                                                        {isScraper ? 'Scraper' : 'Web site'}
                                                    </a>
                                                ) : (
                                                    <span style={{ fontSize: '0.7rem', color: '#ccc' }}>{t('adminPanel.vendors.ai.noReport', 'Henüz yok')}</span>
                                                );
                                            })()}
                                        </td>
                                        <td>
                                            {vendor.is_featured ? (
                                                <div>
                                                    <span className="badge badge-success">{t('adminPanel.vendors.status.featured', 'Vitrinde')}</span>
                                                    {vendor.featured_expires_at && (
                                                        <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
                                                            {t('adminPanel.vendors.table.expires', 'Bitiş')}: {new Date(vendor.featured_expires_at).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'de-DE')}
                                                        </div>
                                                    )}
                                                    {vendor.featured_sort_order > 0 && (
                                                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                                                            {t('adminPanel.vendors.modals.order', 'Sıra')}: {vendor.featured_sort_order}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="badge badge-secondary">{t('adminPanel.vendors.status.passive', 'Pasif')}</span>
                                            )}
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            {(vendor.image || vendor.image_url || (Array.isArray(vendor.gallery) && vendor.gallery.length > 0)) ? (
                                                <span title="Görsel Mevcut" style={{ color: '#10b981', fontSize: '1.2rem', cursor: 'help' }}>✅</span>
                                            ) : (
                                                <span title="Görsel Eksik (Kategori Fallback Aktif)" style={{ color: '#ef4444', fontSize: '1.2rem', cursor: 'help' }}>❌</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className={`status-badge ${vendor.is_verified ? 'status-verified' : 'status-pending'}`}>
                                                {vendor.is_verified ? t('adminPanel.vendors.status.verified', 'Onaylı') : t('adminPanel.vendors.status.pending', 'Bekliyor')}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                {!vendor.is_verified && (
                                                    <button
                                                        className="btn-sm btn-success"
                                                        onClick={() => toggleVerified(vendor.id, true)}
                                                        title="Onayla"
                                                    >
                                                        ✅
                                                    </button>
                                                )}

                                                {vendor.is_featured ? (
                                                    <button
                                                        className="btn-sm btn-warning"
                                                        onClick={() => toggleFeatured(vendor.id, false)}
                                                        title="Vitrinden Kaldır"
                                                    >
                                                        ⭐
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="btn-sm btn-secondary"
                                                        onClick={() => openShowcaseModal(vendor)}
                                                        title="Vitrine Ekle"
                                                    >
                                                        ☆
                                                    </button>
                                                )}

                                                {vendor.subscription_tier === 'premium' ? (
                                                    <button
                                                        className="btn-sm btn-secondary"
                                                        onClick={() => updateSubscription(vendor.id, 'free')}
                                                        title={t('adminPanel.vendors.actions.makeFree', 'Free Yap')}
                                                    >
                                                        📉
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="btn-sm btn-premium"
                                                        onClick={() => updateSubscription(vendor.id, 'premium')}
                                                        title={t('adminPanel.vendors.actions.makePremium', 'Premium Yap')}
                                                    >
                                                        👑
                                                    </button>
                                                )}

                                                <button
                                                    className="btn-sm btn-secondary"
                                                    onClick={() => openSubscriptionModal(vendor)}
                                                    title={t('adminPanel.vendors.actions.manageSubscription', 'Abonelik Yönetimi')}
                                                    style={{ backgroundColor: '#f59e0b', color: 'white', borderColor: '#f59e0b' }}
                                                >
                                                    💎
                                                </button>
                                                <button
                                                    className="btn-sm btn-info"
                                                    onClick={() => setAiInsightVendor(vendor)}
                                                    title={t('adminPanel.vendors.actions.aiAnalysis', 'AI Analiz')}
                                                >
                                                    <Brain size={14} />
                                                </button>
                                                <button
                                                    className="btn-sm btn-primary"
                                                    onClick={() => setEditingVendor(vendor)}
                                                    title={t('adminPanel.vendors.actions.edit', 'Düzenle')}
                                                >
                                                    ✏️
                                                </button>
                                                {confirmDeleteId === vendor.id ? (
                                                    <>
                                                        <button
                                                            className="btn-sm btn-danger pulsing-delete"
                                                            onClick={() => confirmDelete(vendor.id)}
                                                            title="Kesin Sil"
                                                            style={{ animation: 'pulse 1s infinite' }}
                                                        >
                                                            🗑️ ONAYLA
                                                        </button>
                                                        <button
                                                            className="btn-sm btn-secondary"
                                                            onClick={() => setConfirmDeleteId(null)}
                                                            title="İptal"
                                                        >
                                                            ❌
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        className="btn-sm btn-danger"
                                                        onClick={() => setConfirmDeleteId(vendor.id)}
                                                        title={t('adminPanel.vendors.actions.delete', 'Sil')}
                                                    >
                                                        🗑️
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {
                        totalPages > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px', gap: '15px' }}>
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    style={{
                                        padding: '8px 16px',
                                        border: '1px solid #d1d5db',
                                        background: page === 1 ? '#f3f4f6' : '#fff',
                                        color: page === 1 ? '#9ca3af' : '#374151',
                                        borderRadius: '6px',
                                        cursor: page === 1 ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    ← {t('adminPanel.vendors.pagination.previous', 'Önceki')}
                                </button>
                                <span style={{ fontSize: '14px', color: '#4b5563' }}>
                                    {t('adminPanel.vendors.pagination.page', 'Sayfa')} <strong>{page}</strong> / {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    style={{
                                        padding: '8px 16px',
                                        border: '1px solid #d1d5db',
                                        background: page === totalPages ? '#f3f4f6' : '#fff',
                                        color: page === totalPages ? '#9ca3af' : '#374151',
                                        borderRadius: '6px',
                                        cursor: page === totalPages ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {t('adminPanel.vendors.pagination.next', 'Sonraki')} →
                                </button>
                            </div>
                        )
                    }
                </>
            )}

            {/* Modals */}
            {
                showCreateModal && (
                    <VendorCreateModal
                        onClose={() => setShowCreateModal(false)}
                        onSuccess={() => {
                            setShowCreateModal(false);
                            fetchVendors();
                        }}
                    />
                )
            }

            {
                showImportModal && (
                    <VendorImportModal
                        onClose={() => setShowImportModal(false)}
                        onSuccess={() => {
                            setShowImportModal(false);
                            fetchVendors();
                        }}
                    />
                )
            }

            {
                editingVendor && (
                    <VendorEditModal
                        isOpen={!!editingVendor}
                        vendor={editingVendor}
                        onClose={() => setEditingVendor(null)}
                        onSaveSuccess={() => {
                            setEditingVendor(null);
                            fetchVendors();
                        }}
                    />
                )
            }

            {/* Subscription Management Modal */}
            {
                managingSubscription && (
                    <div className="modal-overlay">
                        <div className="modal-content" style={{ maxWidth: '450px' }}>
                            <h3 style={{ marginBottom: '20px' }}>💎 {t('adminPanel.vendors.actions.manageSubscription', 'Abonelik Yönetimi')}</h3>
                            <p style={{ marginBottom: '15px', color: '#666' }}><strong>{managingSubscription.business_name}</strong> {t('adminPanel.vendors.modals.subDesc', 'için üyelik detaylarını düzenleyin.')}</p>

                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>{t('adminPanel.vendors.table.membership', 'Üyelik Paketi')}</label>
                                <select
                                    value={subModalPlan}
                                    onChange={(e) => setSubModalPlan(e.target.value)}
                                    className="form-control"
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                                >
                                    <option value="free">Free</option>
                                    <option value="premium">Premium</option>
                                </select>
                            </div>

                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>{t('adminPanel.vendors.table.expires', 'Bitiş Tarihi')}</label>
                                <input
                                    type="date"
                                    value={subModalEndDate}
                                    onChange={(e) => setSubModalEndDate(e.target.value)}
                                    className="form-control"
                                    required={subModalPlan === 'premium'}
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                                />
                                {subModalPlan === 'premium' ? (
                                    <small style={{ color: '#ef4444' }}>*{t('adminPanel.vendors.modals.expiryRequired', 'Premium için tarih seçilmesi zorunludur.')}</small>
                                ) : (
                                    <small style={{ color: '#888' }}>{t('adminPanel.vendors.modals.expiryOptional', 'Ücretsiz üyelik için isteğe bağlıdır.')}</small>
                                )}
                            </div>

                            <div className="form-group" style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>➕ {t('adminPanel.vendors.modals.addCredits', 'Kredi Ekle/Çıkar')}</label>
                                <input
                                    type="number"
                                    value={subModalCredits}
                                    onChange={(e) => setSubModalCredits(parseInt(e.target.value))}
                                    className="form-control"
                                    placeholder="Örn: 50 veya -20"
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                                />
                                <small style={{ color: '#888' }}>{t('adminPanel.vendors.modals.currentCredits', 'Mevcut Bakiye')}: <strong>{managingSubscription.credit_balance || 0}</strong></small>
                            </div>

                            <div className="modal-actions" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setManagingSubscription(null)}
                                    disabled={isSavingSub}
                                    style={{ padding: '10px 20px', borderRadius: '6px' }}
                                >
                                    {t('common.cancel', 'İptal')}
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleSubscriptionSubmit}
                                    disabled={isSavingSub}
                                    style={{ padding: '10px 20px', borderRadius: '6px', background: '#f59e0b', borderColor: '#f59e0b' }}
                                >
                                    {isSavingSub ? '...' : t('common.save', 'Kaydet')}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* AI Insight Sidebar */}
            {
                aiInsightVendor && (
                    <div className={`ai-insight-sidebar ${aiInsightVendor ? 'open' : ''}`}>
                        <div className="sidebar-header">
                            <div className="header-title">
                                <Brain className="brain-icon" />
                                <h3>{aiInsightVendor.business_name} - {t('adminPanel.vendors.ai.reportTitle', 'AI Analiz')}</h3>
                            </div>
                            <button className="close-btn" onClick={() => { setAiInsightVendor(null); setAiReport(null); }}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="sidebar-content">
                            {isAnalyzing ? (
                                <div className="sidebar-loading">
                                    <div className="loading-spinner"></div>
                                    <p>{t('adminPanel.vendors.ai.analyzing', 'Veriler analiz ediliyor...')}</p>
                                    <span className="scanning-line"></span>
                                </div>
                            ) : aiReport ? (
                                <div className="ai-report-body fade-in">
                                    <div className="report-card primary">
                                        <h4><Sparkles size={16} /> {t('adminPanel.vendors.ai.summary', 'Performans Özeti')}</h4>
                                        <p>{aiReport.summary}</p>
                                    </div>

                                    <div className="metrics-grid">
                                        <div className="mini-card">
                                            <TrendingUp size={14} />
                                            <span>{t('adminPanel.vendors.ai.visibility', 'Görünürlük')}</span>
                                            <strong>{aiReport.visibility_score}/100</strong>
                                        </div>
                                        <div className="mini-card">
                                            <BarChart size={14} />
                                            <span>{t('adminPanel.vendors.ai.conversion', 'Dönüşüm')}</span>
                                            <strong>{aiReport.conversion_rate}%</strong>
                                        </div>
                                        <div className="mini-card">
                                            <Sparkles size={14} style={{ color: '#f59e0b' }} />
                                            <span>{t('adminPanel.vendors.ai.rating', 'Puan / Yorum')}</span>
                                            <strong>{aiReport.avg_rating} / {aiReport.review_count}</strong>
                                        </div>
                                        <div className="mini-card">
                                            <Layout size={14} style={{ color: '#ec4899' }} />
                                            <span>{t('adminPanel.vendors.ai.favorites', 'Favoriler')}</span>
                                            <strong>{aiReport.favorite_count}</strong>
                                        </div>
                                    </div>

                                    <div className="report-card">
                                        <h4>🎯 {t('adminPanel.vendors.ai.recommendations', 'Tavsiyeler')}</h4>
                                        <ul>
                                            {aiReport.recommendations.map((rec, i) => (
                                                <li key={i}>{rec}</li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button
                                            className="btn btn-success flex-1"
                                            onClick={handlePublishInsight}
                                            disabled={isPublishing || aiReport.is_published}
                                        >
                                            {isPublishing ? t('adminPanel.vendors.ai.publishing', 'Yayınlanıyor...') : aiReport.is_published ? '✅ ' + t('adminPanel.vendors.ai.published', 'Yayında') : '🚀 ' + t('adminPanel.vendors.ai.publish', 'Yayınla ve Paylaş')}
                                        </button>
                                        <button className="btn btn-secondary" onClick={() => setAiInsightVendor(null)}>
                                            {t('common.close', 'Kapat')}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="sidebar-start">
                                    <p>{t('adminPanel.vendors.ai.sidebarDesc', 'Bu tedarikçinin son 30 günlük verileri (Google Trafik + Local Talepler) harmanlanarak bir rapor oluşturulacaktır.')}</p>
                                    <button
                                        className="btn btn-primary w-full"
                                        onClick={() => handleGenerateInsight(aiInsightVendor)}
                                    >
                                        {t('adminPanel.vendors.ai.startAnalysis', 'Analizi Başlat')}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )
            }
            {aiInsightVendor && <div className="sidebar-overlay" onClick={() => setAiInsightVendor(null)}></div>}


        </div >
    );
};

export default AdminVendors;
