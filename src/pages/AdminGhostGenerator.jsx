import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { GoogleGenerativeAI } from "@google/generative-ai";
import DOMPurify from 'dompurify';

const AdminGhostGenerator = () => {
    const [activeTab, setActiveTab] = useState('factory'); // 'factory', 'scenario'
    const [loading, setLoading] = useState(false);
    const [ghosts, setGhosts] = useState([]);
    const [categories, setCategories] = useState([]);

    // Factory State
    const [factoryLang, setFactoryLang] = useState('tr');
    const [factoryCount, setFactoryCount] = useState(5);

    // Scenario State
    const [scenarioTopic, setScenarioTopic] = useState('');
    const [scenarioLang, setScenarioLang] = useState('tr');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [generatedScript, setGeneratedScript] = useState(null);

    useEffect(() => {
        fetchGhosts();
        fetchCategories();
    }, []);

    const fetchGhosts = async () => {
        const { data } = await supabase.from('profiles').select('*').eq('is_bot', true).limit(50);
        if (data) setGhosts(data);
    };

    const fetchCategories = async () => {
        const { data } = await supabase.from('forum_categories').select('*').order('order_index');
        if (data) setCategories(data);
    };

    const getApiKey = () => {
        return localStorage.getItem('admin_gemini_api_key')?.trim() || import.meta.env.VITE_GEMINI_API_KEY?.trim();
    };

    // Helper: Retry with different models if 404/400 occurs
    const generateWithFallback = async (genAI, prompt) => {
        const models = ["gemini-2.0-flash-exp", "gemini-1.5-pro", "gemini-1.5-flash", "gemini-pro"];
        let lastError = null;

        for (const modelName of models) {
            try {
                console.log(`Trying AI model: ${modelName}`);
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(prompt);
                const response = await result.response;
                return response.text();
            } catch (error) {
                console.warn(`Model ${modelName} failed:`, error);
                lastError = error;
                // If error is NOT 404/400 (e.g. valid key but logic error), maybe stop? 
                // But mostly we assume model unavailability.
                continue;
            }
        }
        throw lastError || new Error("All models failed.");
    };

    // 1. GHOST FACTORY - Creates real bot profiles in database
    const handleCreateGhosts = async () => {
        setLoading(true);
        try {
            const apiKey = getApiKey();
            if (!apiKey) throw new Error("API Key eksik (.env veya Ayarlar).");

            // Fetch available avatars for assignment
            const { data: avatars } = await supabase
                .from('default_avatars')
                .select('image_url')
                .order('sort_order');

            const avatarUrls = avatars?.map(a => a.image_url) || [];

            const genAI = new GoogleGenerativeAI(apiKey);
            const prompt = `
                Generate ${factoryCount} fake user profiles for a wedding forum.
                Language/Nationality: ${factoryLang.toUpperCase()}.
                Output purely a valid JSON array. Do not use markdown blocks.
                Structure: 
                [{"first_name": "...", "last_name": "...", "city": "..."}]
                
                Names should be realistic for the nationality.
                Cities should be real cities from that country.
            `;

            const text = await generateWithFallback(genAI, prompt);
            const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const profiles = JSON.parse(cleanJson);

            // Insert each bot profile into database
            let successCount = 0;
            for (const p of profiles) {
                const fakeId = crypto.randomUUID();
                const fakeEmail = `bot_${fakeId.slice(0, 8)}@ghost.local`;
                const randomAvatar = avatarUrls.length > 0
                    ? avatarUrls[Math.floor(Math.random() * avatarUrls.length)]
                    : null;

                const { error } = await supabase.from('profiles').insert({
                    id: fakeId,
                    first_name: p.first_name,
                    last_name: p.last_name,
                    full_name: `${p.first_name} ${p.last_name}`,
                    email: fakeEmail,
                    city: p.city,
                    is_bot: true,
                    forum_role: 'user',
                    forum_avatar_url: randomAvatar
                });

                if (!error) successCount++;
                else console.warn('Insert error:', error);
            }

            alert(`✅ ${successCount}/${profiles.length} bot başarıyla oluşturuldu!`);
            fetchGhosts(); // Refresh the list

        } catch (error) {
            console.error(error);
            alert("Hata: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    // 2. SCENARIO BUILDER (The Cool Part)
    const handleGenerateScenario = async () => {
        if (!selectedCategory) return alert('Lütfen kategori seçin.');
        setLoading(true);
        try {
            const apiKey = getApiKey();
            if (!apiKey) throw new Error("API Key eksik.");

            const genAI = new GoogleGenerativeAI(apiKey);

            // Better slugify
            const slugify = (text) => {
                const trMap = { 'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u', 'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u' };
                return text
                    .replace(/[çğıöşüÇĞİÖŞÜ]/g, char => trMap[char] || char)
                    .toLowerCase()
                    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
                    .trim()
                    .replace(/\s+/g, '-') // Replace spaces with -
                    .replace(/-+/g, '-'); // Remove duplicate -
            };

            const prompt = `
                Create a realistic forum discussion for a wedding site.
                Topic: ${scenarioTopic}
                Category ID: ${selectedCategory}
                Language: ${scenarioLang}
                
                Actors: Create 3-4 distinct personas.
                
                Output JSON format ONLY (no markdown):
                {
                    "title": "Discussion Title",
                    "content": "Main post html content",
                    "slug": "${slugify(scenarioTopic)}-${Math.floor(Math.random() * 1000)}",
                    "replies": [
                        { "persona": "Helpful_Aunt", "content": "Reply content..." },
                        { "persona": "Budget_Bride", "content": "Reply content..." }
                    ]
                }
            `;

            const text = await generateWithFallback(genAI, prompt);
            const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const scenario = JSON.parse(cleanJson);

            setGeneratedScript(scenario);
        } catch (error) {
            console.error(error);
            alert('Senaryo üretilemedi: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePublishScenario = async () => {
        if (!generatedScript) return;
        setLoading(true);
        try {
            // 1. Pick random ghost user for OP
            const op = ghosts[Math.floor(Math.random() * ghosts.length)];
            if (!op) throw new Error("Hiç hayalet üye (Bot) bulunamadı. Önce 'Hayalet Fabrikası'ndan bot üretmelisiniz.");

            // 2. Create Post
            const { data: post, error: postError } = await supabase
                .from('forum_posts')
                .insert([{
                    user_id: op.id,
                    category_id: selectedCategory,
                    title: generatedScript.title,
                    content: generatedScript.content,
                    slug: generatedScript.slug,
                    language: scenarioLang,
                    is_simulated: true,
                    status: 'published'
                }])
                .select()
                .single();

            if (postError) throw postError;

            // 3. Create Comments with staggered timestamps for realism
            const baseTime = new Date();
            for (let i = 0; i < generatedScript.replies.length; i++) {
                const reply = generatedScript.replies[i];
                const replier = ghosts[Math.floor(Math.random() * ghosts.length)];
                if (replier) {
                    // Add 5-30 minutes delay for each comment
                    const minutesDelay = (i + 1) * (5 + Math.floor(Math.random() * 25));
                    const commentTime = new Date(baseTime.getTime() + minutesDelay * 60000);

                    await supabase.from('forum_comments').insert([{
                        post_id: post.id,
                        user_id: replier.id,
                        content: reply.content,
                        is_simulated: true,
                        status: 'published',
                        created_at: commentTime.toISOString()
                    }]);
                }
            }

            if (confirm('✅ Senaryo başarıyla yayınlandı! Görüntülemek ister misiniz?')) {
                // Redirect to the new topic
                window.open(`/community/topic/${post.slug}`, '_blank');
            }
            setGeneratedScript(null);

        } catch (error) {
            console.error(error);
            alert('Yayınlama hatası: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-container p-6">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">👻 Hayalet Modu (Simülasyon)</h1>

            {/* Tabs */}
            <div className="flex gap-4 border-b mb-6">
                <button
                    className={`pb-2 px-4 ${activeTab === 'factory' ? 'border-b-2 border-purple-600 font-bold text-purple-600' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('factory')}
                >
                    🏭 Hayalet Fabrikası
                </button>
                <button
                    className={`pb-2 px-4 ${activeTab === 'scenario' ? 'border-b-2 border-purple-600 font-bold text-purple-600' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('scenario')}
                >
                    🎭 Senaryo Yazarı
                </button>
            </div>

            {activeTab === 'factory' && (
                <div className="bg-white p-6 rounded shadow max-w-2xl">
                    <h3 className="font-bold text-lg mb-4">Yeni Bot Profilleri Üret</h3>
                    <p className="text-gray-600 mb-4 text-sm">
                        Bu araç, veritabanına "sahte" kullanıcılar ekler. Bu kullanıcılar login olamaz ama forumda yazabilir.
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-bold mb-1">Dil / Uyruk</label>
                            <select className="form-control w-full border p-2 rounded" value={factoryLang} onChange={e => setFactoryLang(e.target.value)}>
                                <option value="tr">🇹🇷 Türk</option>
                                <option value="de">🇩🇪 Alman</option>
                                <option value="en">🇺🇸 İngiliz/Amerikan</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Adet</label>
                            <select className="form-control w-full border p-2 rounded" value={factoryCount} onChange={e => setFactoryCount(Number(e.target.value))}>
                                <option value="5">5 Adet</option>
                                <option value="10">10 Adet</option>
                                <option value="20">20 Adet</option>
                            </select>
                        </div>
                    </div>

                    <button
                        onClick={handleCreateGhosts}
                        disabled={loading}
                        className="w-full bg-purple-600 text-white py-3 rounded font-bold hover:bg-purple-700 disabled:opacity-50"
                    >
                        {loading ? 'Üretiliyor...' : '✨ Hayaletleri Çağır'}
                    </button>

                    <div className="mt-6 bg-yellow-50 p-4 rounded text-sm text-yellow-800 border-l-4 border-yellow-400">
                        <strong>Mevcut Bot Sayısı:</strong> {ghosts.length} <br />
                        Bunlar senaryolarda "Aktör" olarak kullanılacaktır.
                    </div>
                </div>
            )}

            {activeTab === 'scenario' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* INPUT SIDE */}
                    <div className="bg-white p-6 rounded shadow">
                        <h3 className="font-bold text-lg mb-4">Senaryo Kurgusu</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold">Konu Başlığı</label>
                                <input
                                    type="text"
                                    className="w-full border p-2 rounded"
                                    placeholder="Örn: 2025 Gelinlik Fiyatları ne kadar?"
                                    value={scenarioTopic}
                                    onChange={e => setScenarioTopic(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold">Dil</label>
                                    <select className="w-full border p-2 rounded" value={scenarioLang} onChange={e => setScenarioLang(e.target.value)}>
                                        <option value="tr">🇹🇷 Türkçe</option>
                                        <option value="de">🇩🇪 Almanca</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold">Kategori</label>
                                    <select className="w-full border p-2 rounded" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
                                        <option value="">Seçiniz...</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name_tr}</option>)}
                                    </select>
                                </div>
                            </div>

                            <button
                                onClick={handleGenerateScenario}
                                disabled={loading || !scenarioTopic}
                                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                            >
                                {loading ? 'Yazılıyor...' : '🖊️ Senaryoyu Yazdır (AI)'}
                            </button>
                        </div>
                    </div>

                    {/* PREVIEW SIDE */}
                    <div className="bg-gray-50 p-6 rounded shadow border">
                        <h3 className="font-bold text-lg mb-4 text-gray-700">Önizleme</h3>

                        {generatedScript ? (
                            <div className="space-y-4">
                                <div className="bg-white p-4 rounded border l-4 border-blue-500">
                                    <h4 className="font-bold text-blue-800">{generatedScript.title}</h4>
                                    <div className="text-sm text-gray-600 mt-2" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(generatedScript.content) }}></div>
                                </div>

                                <div className="pl-4 space-y-3 border-l-2 border-gray-200">
                                    {generatedScript.replies.map((r, idx) => (
                                        <div key={idx} className="bg-white p-3 rounded text-sm shadow-sm">
                                            <span className="font-bold text-purple-600 text-xs uppercase">{r.persona}:</span>
                                            <p>{r.content}</p>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={handlePublishScenario}
                                    className="w-full bg-green-600 text-white py-3 rounded font-bold shadow hover:bg-green-700 mt-4"
                                >
                                    ✅ Onayla ve Yayınla
                                </button>
                            </div>
                        ) : (
                            <div className="text-gray-400 text-center py-10">
                                Henüz bir senaryo oluşturulmadı. <br />
                                Soldaki formu doldurup yapay zekayı çalıştırın.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminGhostGenerator;
