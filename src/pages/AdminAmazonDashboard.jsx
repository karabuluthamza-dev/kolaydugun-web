import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { usePageTitle } from '../hooks/usePageTitle';
import { Link } from 'react-router-dom';
import './AdminAmazonDashboard.css';

const AdminAmazonDashboard = () => {
    usePageTitle('Amazon Affiliate');
    const { user } = useAuth();

    // Stats
    const [stats, setStats] = useState({
        totalProducts: 0,
        activeProducts: 0,
        unavailableProducts: 0,
        todayClicks: 0,
        monthlyClicks: 0
    });

    // AI Recommendations
    const [recommendations, setRecommendations] = useState([]);

    // Daily Tasks
    const [dailyTasks, setDailyTasks] = useState([]);

    // Top Performing Products
    const [topProducts, setTopProducts] = useState([]);

    // AI Brain
    const [aiScore, setAiScore] = useState(null);
    const [aiSummary, setAiSummary] = useState('');
    const [runningAI, setRunningAI] = useState(false);

    // Settings
    const [settings, setSettings] = useState({
        affiliate_tag: 'kolaydg1-21',
        gemini_api_key: ''
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    const fetchDashboardData = async () => {
        setLoading(true);

        try {
            // Fetch Amazon product stats
            const { data: products, error: productsError } = await supabase
                .from('shop_products')
                .select('id, product_type, check_status, click_count')
                .eq('product_type', 'amazon');

            if (!productsError && products) {
                setStats({
                    totalProducts: products.length,
                    activeProducts: products.filter(p => p.check_status === 'active' || p.check_status === 'pending').length,
                    unavailableProducts: products.filter(p => p.check_status === 'unavailable').length,
                    todayClicks: 0, // Will calculate from performance log
                    monthlyClicks: products.reduce((sum, p) => sum + (p.click_count || 0), 0)
                });
            }

            // Fetch AI recommendations
            const { data: recs, error: recsError } = await supabase
                .from('shop_ai_recommendations')
                .select('*')
                .in('status', ['new', 'seen'])
                .order('priority', { ascending: true })
                .order('created_at', { ascending: false })
                .limit(5);

            if (!recsError && recs) {
                setRecommendations(recs);
            }

            // Fetch daily tasks
            const today = new Date().toISOString().split('T')[0];
            const { data: tasks, error: tasksError } = await supabase
                .from('shop_daily_tasks')
                .select('*')
                .eq('task_date', today)
                .order('is_completed', { ascending: true });

            if (!tasksError && tasks) {
                setDailyTasks(tasks);
            }

            // Fetch settings
            const { data: settingsData, error: settingsError } = await supabase
                .from('shop_amazon_settings')
                .select('key, value');

            if (!settingsError && settingsData) {
                const settingsObj = {};
                settingsData.forEach(s => {
                    settingsObj[s.key] = s.value;
                });
                setSettings(settingsObj);
            }

            // Fetch top performing products
            const { data: topProds } = await supabase
                .from('shop_products')
                .select('id, name_de, name_tr, click_count, images, amazon_asin')
                .eq('product_type', 'amazon')
                .gt('click_count', 0)
                .order('click_count', { ascending: false })
                .limit(5);

            if (topProds) {
                setTopProducts(topProds);
            }

        } catch (err) {
            console.error('Error fetching dashboard data:', err);
        }

        setLoading(false);
    };

    const handleDismissRecommendation = async (id) => {
        try {
            await supabase
                .from('shop_ai_recommendations')
                .update({ status: 'dismissed' })
                .eq('id', id);

            setRecommendations(prev => prev.filter(r => r.id !== id));
        } catch (err) {
            console.error('Error dismissing recommendation:', err);
        }
    };

    const handleCompleteTask = async (id) => {
        try {
            await supabase
                .from('shop_daily_tasks')
                .update({ is_completed: true, completed_at: new Date().toISOString() })
                .eq('id', id);

            setDailyTasks(prev => prev.map(t =>
                t.id === id ? { ...t, is_completed: true } : t
            ));
        } catch (err) {
            console.error('Error completing task:', err);
        }
    };

    // Run AI Brain analysis (CLIENT-SIDE IMPLEMENTATION)
    const runAIBrain = async () => {
        console.log('Starting Client-Side AI Brain...');
        setRunningAI(true);
        setLoading(true);

        try {
            // 1. Fetch Key (Support both DB settings and LocalStorage/Env like Blog Generator)
            // Priority: LocalStorage (Admin override) -> DB Settings -> Env
            let apiKey = localStorage.getItem('admin_gemini_api_key');

            if (!apiKey) {
                const { data: settingsData } = await supabase
                    .from('shop_amazon_settings')
                    .select('value')
                    .eq('key', 'gemini_api_key')
                    .single();
                apiKey = settingsData?.value;
            }

            if (!apiKey) {
                apiKey = import.meta.env.VITE_GEMINI_API_KEY;
            }

            if (!apiKey) {
                throw new Error('Gemini API anahtarı bulunamadı! Ayarlardan veya .env dosyasından ekleyin.');
            }

            // 2. Gather Stats (Simple counts to avoid column errors)
            const { count: totalProducts } = await supabase.from('shop_products').select('*', { count: 'exact', head: true }).eq('product_type', 'amazon');
            const { count: activeProducts } = await supabase.from('shop_products').select('*', { count: 'exact', head: true }).eq('product_type', 'amazon').eq('status', 'active');

            // Fetch recent products for context
            const { data: recentProducts } = await supabase
                .from('shop_products')
                .select('name_tr, name_de, category_id')
                .eq('product_type', 'amazon')
                .order('created_at', { ascending: false })
                .limit(5);

            const productNames = recentProducts?.map(p => p.name_tr || p.name_de).join(', ') || 'Yok';

            const analyticsContext = `
                Analiz Tarihi: ${new Date().toLocaleDateString('tr-TR')}
                Toplam Ürün: ${totalProducts || 0}
                Aktif Ürün: ${activeProducts || 0}
                Son Eklenenler: ${productNames}
            `;

            console.log('Stats gathered:', analyticsContext);

            // 3. Call Gemini API
            const { GoogleGenerativeAI } = await import("@google/generative-ai");

            // Auto-detect model to avoid 404s
            let selectedModelName = "gemini-1.5-flash";
            try {
                console.log('Fetching available models...');
                const modelsRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
                const modelsData = await modelsRes.json();

                if (modelsData.models) {
                    const availableModels = modelsData.models
                        .filter(m => m.supportedGenerationMethods?.includes("generateContent"))
                        .map(m => m.name.replace("models/", ""));

                    console.log('Available Models:', availableModels);

                    if (availableModels.includes("gemini-1.5-flash")) selectedModelName = "gemini-1.5-flash";
                    else if (availableModels.includes("gemini-2.0-flash-exp")) selectedModelName = "gemini-2.0-flash-exp";
                    else if (availableModels.includes("gemini-pro")) selectedModelName = "gemini-pro";
                    else if (availableModels.length > 0) selectedModelName = availableModels[0];
                }
            } catch (e) {
                console.error('Model fetch error, using default:', e);
            }

            console.log('Using Model:', selectedModelName);
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: selectedModelName });

            const prompt = `Sen bir e-ticaret uzmanısın. Aşağıdaki düğün ürünleri sitesinin verilerini analiz et ve Türkçe olarak öneriler ver.
            
            "${analyticsContext}"
            
            Şu formatta SAF JSON yanıt ver (Markdown YOK):
            {
              "daily_tasks": [
                {"title": "Görev başlığı", "description": "Kısa açıklama", "priority": 1, "type": "add_products"}
              ],
              "insights": [
                {"title": "İçgörü başlığı", "message": "Kısa açıklama", "type": "info"}
              ],
              "recommendations": [
                {"title": "Öneri başlığı", "description": "Detaylı açıklama", "priority": 1, "action_type": "add_product"}
              ],
              "performance_score": 75,
              "performance_summary": "Kısa performans özeti"
            }`;

            console.log('Calling Gemini...');
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            console.log('Gemini Response:', text);

            // Clean & Parse JSON
            const jsonText = text.replace(/```json|```/g, '').trim();
            const aiData = JSON.parse(jsonText);

            // 4. Save to Database
            const today = new Date().toISOString().split('T')[0];

            // Save Tasks
            if (aiData.daily_tasks?.length > 0) {
                await supabase.from('shop_daily_tasks').delete().eq('task_date', today);
                const allowedTaskTypes = ['add_products', 'write_content', 'share_social', 'check_products', 'analyze_stats', 'custom'];

                const tasks = aiData.daily_tasks.map((t, i) => ({
                    task_date: today,
                    // Map unknown types to 'custom' to avoid check constraint violation
                    task_type: allowedTaskTypes.includes(t.type) ? t.type : 'custom',
                    title: t.title,
                    description: t.description,
                    // priority removed as it doesn't exist in shop_daily_tasks table
                    is_completed: false,
                    target_count: 1,
                    current_count: 0,
                    ai_generated: true
                }));
                const { error: taskErr } = await supabase.from('shop_daily_tasks').insert(tasks);
                if (taskErr) console.error('Task Save Error:', taskErr);
            }

            // Save Recommendations
            if (aiData.recommendations?.length > 0) {
                await supabase.from('shop_ai_recommendations').delete().eq('status', 'new');
                const recs = aiData.recommendations.map((r, i) => ({
                    type: 'product',
                    title: r.title,
                    description: r.description,
                    priority: r.priority || 3,
                    status: 'new',
                    action_type: r.action_type || 'check',
                    action_data: {}
                }));
                const { error: recErr } = await supabase.from('shop_ai_recommendations').insert(recs);
                if (recErr) console.error('Rec Save Error:', recErr);
            }

            // Success Update
            setAiScore(aiData.performance_score || 0);
            setAiSummary(aiData.performance_summary || 'Analiz tamamlandı.');
            fetchDashboardData(); // Refresh UI
            alert('✅ AI Analizi Başarıyla Tamamlandı!');

        } catch (err) {
            console.error('Client-Side AI Error:', err);
            alert(`AI Analizi Başarısız: ${err.message}`);
        } finally {
            setRunningAI(false);
            setLoading(false);
        }
    };

    const getRecommendationIcon = (type) => {
        switch (type) {
            case 'product': return '🛒';
            case 'trend': return '📈';
            case 'content': return '📝';
            case 'task': return '✅';
            case 'alert': return '⚠️';
            default: return '💡';
        }
    };

    const getTaskIcon = (taskType) => {
        switch (taskType) {
            case 'add_products': return '📦';
            case 'write_content': return '✍️';
            case 'share_social': return '📱';
            case 'check_products': return '🔍';
            case 'analyze_stats': return '📊';
            default: return '📋';
        }
    };

    if (loading) {
        return (
            <div className="admin-amazon-dashboard loading">
                <div className="loading-spinner"></div>
                <p>Yükleniyor...</p>
            </div>
        );
    }

    return (
        <div className="admin-amazon-dashboard">
            {/* Header */}
            <div className="dashboard-header">
                <div className="header-content">
                    <h1>💰 Para Kazanma Makinesi</h1>
                    <p>Amazon Affiliate + AI Brain Dashboard</p>
                </div>
                <div className="header-actions">
                    <button
                        onClick={runAIBrain}
                        disabled={runningAI}
                        className="btn btn-ai"
                    >
                        {runningAI ? '🧠 Analiz...' : '🧠 AI Brain'}
                    </button>
                    <Link to="/admin/amazon/products" className="btn btn-secondary">
                        📦 Ürünler
                    </Link>
                    <Link to="/admin/amazon/bulk" className="btn btn-secondary">
                        📋 Toplu Ekle
                    </Link>
                    <Link to="/admin/amazon/add" className="btn btn-primary">
                        ➕ Ürün Ekle
                    </Link>
                </div>
            </div>

            {/* Quick Start Guide */}
            <div className="quick-start-guide">
                <div className="guide-header">
                    <span>🚀</span>
                    <strong>Nasıl Para Kazanırım?</strong>
                </div>
                <div className="guide-content">
                    <div className="guide-step">
                        <span className="guide-num">1</span>
                        <div>
                            <strong>Ürün Ekle</strong>
                            <p>Amazon.de'den düğün ile ilgili ürünleri ekleyin. AI otomatik çeviri yapar.</p>
                        </div>
                    </div>
                    <div className="guide-step">
                        <span className="guide-num">2</span>
                        <div>
                            <strong>Ziyaretçi Gelir</strong>
                            <p>SEO optimizasyonu sayesinde Google'dan organik trafik gelir.</p>
                        </div>
                    </div>
                    <div className="guide-step">
                        <span className="guide-num">3</span>
                        <div>
                            <strong>Komisyon Kazanın</strong>
                            <p>Ziyaretçiler "Amazon'da Gör" butonuna tıklayıp satın alırsa %1-10 komisyon!</p>
                        </div>
                    </div>
                </div>
                <div className="guide-tip">
                    💡 <strong>İpucu:</strong> Yeni başlayanlar için hedef: Haftada 5-10 yeni ürün ekleyin!
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">📦</div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.totalProducts}</span>
                        <span className="stat-label">Toplam Ürün</span>
                    </div>
                </div>
                <div className="stat-card success">
                    <div className="stat-icon">✅</div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.activeProducts}</span>
                        <span className="stat-label">Aktif Ürün</span>
                    </div>
                </div>
                <div className="stat-card warning">
                    <div className="stat-icon">⚠️</div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.unavailableProducts}</span>
                        <span className="stat-label">Mevcut Değil</span>
                    </div>
                </div>
                <div className="stat-card info">
                    <div className="stat-icon">👆</div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.monthlyClicks}</span>
                        <span className="stat-label">Toplam Tıklama</span>
                    </div>
                </div>
            </div>

            {/* Top Performing Products */}
            {topProducts.length > 0 && (
                <div className="top-products-section">
                    <h3>🏆 En Çok Tıklanan Ürünler</h3>
                    <div className="top-products-list">
                        {topProducts.map((product, idx) => (
                            <div key={product.id} className="top-product-item">
                                <span className={`rank rank-${idx + 1}`}>{idx + 1}</span>
                                <div className="product-thumb">
                                    {product.images && product.images[0] ? (
                                        <img src={product.images[0]} alt="" />
                                    ) : (
                                        <div className="no-img">📦</div>
                                    )}
                                </div>
                                <div className="product-info">
                                    <span className="product-name">{product.name_tr || product.name_de}</span>
                                    <span className="product-asin">{product.amazon_asin}</span>
                                </div>
                                <div className="product-clicks">
                                    <span className="click-count">{product.click_count}</span>
                                    <span className="click-label">tıklama</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {/* API Key Warning */}
            {!settings.gemini_api_key && (
                <div className="alert-banner warning">
                    <span className="alert-icon">⚠️</span>
                    <div className="alert-content">
                        <strong>Gemini API Anahtarı Eksik!</strong>
                        <p>Otomatik ürün bilgisi çekme için API anahtarı gerekli.</p>
                    </div>
                    <Link to="/admin/amazon/settings" className="btn btn-sm">
                        Ayarlara Git
                    </Link>
                </div>
            )}

            {/* Main Content Grid */}
            <div className="dashboard-grid">
                {/* AI Recommendations */}
                <div className="dashboard-card recommendations-card">
                    <div className="card-header">
                        <h2>🧠 AI Önerileri</h2>
                        <span className="badge">{recommendations.length} yeni</span>
                    </div>
                    <div className="card-content">
                        {recommendations.length === 0 ? (
                            <div className="empty-state">
                                <span className="empty-icon">💡</span>
                                <p>Henüz öneri yok. Ürün eklemeye başlayın!</p>
                            </div>
                        ) : (
                            <div className="recommendations-list">
                                {recommendations.map(rec => (
                                    <div key={rec.id} className={`recommendation-item priority-${rec.priority}`}>
                                        <div className="rec-icon">
                                            {getRecommendationIcon(rec.type)}
                                        </div>
                                        <div className="rec-content">
                                            <h4>{rec.title}</h4>
                                            <p>{rec.description}</p>
                                        </div>
                                        <div className="rec-actions">
                                            {rec.action_type === 'add_product' && rec.action_data?.url && (
                                                <Link
                                                    to={`/admin/amazon/add?url=${encodeURIComponent(rec.action_data.url)}`}
                                                    className="btn btn-sm btn-primary"
                                                >
                                                    Ekle
                                                </Link>
                                            )}
                                            <button
                                                className="btn btn-sm btn-ghost"
                                                onClick={() => handleDismissRecommendation(rec.id)}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Daily Tasks */}
                <div className="dashboard-card tasks-card">
                    <div className="card-header">
                        <h2>✅ Bugünkü Görevler</h2>
                        <span className="badge">
                            {dailyTasks.filter(t => t.is_completed).length}/{dailyTasks.length}
                        </span>
                    </div>
                    <div className="card-content">
                        {dailyTasks.length === 0 ? (
                            <div className="empty-state">
                                <span className="empty-icon">📋</span>
                                <p>Bugün için görev yok.</p>
                                <button
                                    className="btn btn-sm btn-secondary"
                                    onClick={runAIBrain}
                                    disabled={runningAI}
                                >
                                    {runningAI ? 'Oluşturuluyor...' : 'AI Görev Oluştur'}
                                </button>
                            </div>
                        ) : (
                            <div className="tasks-list">
                                {dailyTasks.map(task => (
                                    <div
                                        key={task.id}
                                        className={`task-item ${task.is_completed ? 'completed' : ''}`}
                                    >
                                        <button
                                            className="task-checkbox"
                                            onClick={() => !task.is_completed && handleCompleteTask(task.id)}
                                            disabled={task.is_completed}
                                        >
                                            {task.is_completed ? '✓' : ''}
                                        </button>
                                        <div className="task-content">
                                            <span className="task-icon">{getTaskIcon(task.task_type)}</span>
                                            <div className="task-details">
                                                <h4>{task.title}</h4>
                                                {task.target_count > 1 && (
                                                    <div className="task-progress">
                                                        <div className="progress-bar">
                                                            <div
                                                                className="progress-fill"
                                                                style={{ width: `${(task.current_count / task.target_count) * 100}%` }}
                                                            ></div>
                                                        </div>
                                                        <span>{task.current_count}/{task.target_count}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
                <h3>Hızlı İşlemler</h3>
                <div className="actions-grid">
                    <Link to="/admin/amazon/add" className="action-card">
                        <span className="action-icon">➕</span>
                        <span className="action-label">Tek Ürün Ekle</span>
                    </Link>
                    <Link to="/admin/amazon/bulk" className="action-card">
                        <span className="action-icon">📊</span>
                        <span className="action-label">Toplu Import</span>
                    </Link>
                    <Link to="/admin/amazon/products" className="action-card">
                        <span className="action-icon">📦</span>
                        <span className="action-label">Ürün Listesi</span>
                    </Link>
                    <Link to="/admin/amazon/settings" className="action-card">
                        <span className="action-icon">⚙️</span>
                        <span className="action-label">Ayarlar</span>
                    </Link>
                </div>
            </div>

            {/* Affiliate Info */}
            <div className="affiliate-info">
                <div className="info-content">
                    <span className="info-icon">🔗</span>
                    <div>
                        <strong>Affiliate ID:</strong> {settings.affiliate_tag}
                        <p className="info-text">Tüm Amazon linklerine otomatik eklenir</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAmazonDashboard;
