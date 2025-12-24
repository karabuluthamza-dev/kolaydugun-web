import React, { useState } from 'react';
import { X, BookOpen, Bot, Zap, LayoutList, Mail, MapPin, Wand2, HelpCircle, ChevronRight, PlayCircle, Sparkles } from 'lucide-react';

const AdminImportsHelp = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('start');

    if (!isOpen) return null;

    const tabs = [
        { id: 'start', label: 'Başlangıç & Akış', icon: PlayCircle },
        { id: 'tools', label: 'Akıllı Araçlar', icon: Bot },
        { id: 'growth', label: 'Büyüme & Davet', icon: Zap },
        { id: 'faq', label: 'Sıkça Sorulanlar', icon: HelpCircle },
    ];

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Panel */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[80vh] flex overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Sidebar */}
                <div className="w-64 bg-gray-50 border-r border-gray-100 flex flex-col">
                    <div className="p-6 border-b border-gray-100 mb-2">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <BookOpen className="w-6 h-6 text-pink-600" />
                            Kılavuz
                        </h2>
                        <p className="text-xs text-gray-400 mt-1">Veri Yönetim Paneli</p>
                    </div>

                    <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all
                                ${activeTab === tab.id
                                        ? 'bg-white text-pink-600 shadow-lg shadow-gray-100 ring-1 ring-gray-100'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-pink-600' : 'text-gray-400'}`} />
                                    {tab.label}
                                </div>
                                {activeTab === tab.id && <ChevronRight className="w-4 h-4 text-pink-500" />}
                            </button>
                        ))}
                    </nav>

                    <div className="p-4 border-t border-gray-200">
                        <button
                            onClick={onClose}
                            className="w-full py-2.5 px-4 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors shadow-lg"
                        >
                            Kapat
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto bg-white">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full z-10"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <div className="p-8 max-w-3xl">

                        {/* Tab: Başlangıç */}
                        {activeTab === 'start' && (
                            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Otomatik Veri Akışı</h3>
                                    <p className="text-gray-500 text-lg">
                                        sistem, rakip sitelerden sürekli olarak yeni veri toplar ve sizin onayınıza sunar.
                                    </p>
                                </div>

                                <div className="grid gap-6">
                                    <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-10">
                                            <Bot className="w-24 h-24 text-blue-900" />
                                        </div>
                                        <h4 className="text-lg font-bold text-blue-900 mb-2 flex items-center gap-2">
                                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">1</div>
                                            Hızlı Gezinti & Caching
                                        </h4>
                                        <p className="text-blue-800/80 leading-relaxed text-sm">
                                            Sayfalar arası her geçişte "Yükleniyor" beklemezsiniz. Sistem verileri hafızada tutar ve geri geldiğinizde anında gösterir. Arka planda ise sessizce (ekranı dondurmadan) güncel verileri çeker.
                                        </p>
                                    </div>

                                    <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
                                        <h4 className="text-lg font-bold text-green-900 mb-2 flex items-center gap-2">
                                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-600">2</div>
                                            Otomatik vs Manüel Güncelleme
                                        </h4>
                                        <p className="text-green-800/80 leading-relaxed text-sm">
                                            Sağ üstteki <strong>"Otomatik Güncelleme"</strong> kutucuğu ile sayfanın kendi kendine yenilenmesini kapatabilirsiniz. Bu, veri girerken listenin değişmesini engeller. İstediğinizde "Listeyi Yenile" diyebilirsiniz.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab: Akıllı Araçlar */}
                        {activeTab === 'tools' && (
                            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Yapay Zeka Araçları</h3>
                                    <p className="text-gray-500 text-lg">
                                        Veri kalitesini arttırmak için geliştirdiğimiz özel araçlar.
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    <div className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-gray-50">
                                        <h4 className="flex items-center gap-3 text-lg font-bold text-gray-900 mb-4">
                                            <div className="p-2 bg-purple-100 rounded-lg">
                                                <Wand2 className="w-6 h-6 text-purple-600" />
                                            </div>
                                            Smart Merge (Akıllı Birleştirme)
                                        </h4>
                                        <p className="text-gray-600 mb-4">
                                            Mükerrer kayıtları silmek yerine birleştirin. "Olası Tekrar" sekmesinde <strong>"Tekrarları Tara"</strong> diyerek sistemin benzer kayıtları bulmasını sağlayın. Ardından sihirli değnek ile eksik verileri tamamlayın.
                                        </p>
                                        <div className="bg-purple-50 text-purple-700 px-4 py-2 rounded-lg text-sm font-medium inline-block">
                                            💡 İpucu: Sadece telefon veya web sitesi eksik olan eski kayıtlarınızı bu sayede güncelleyebilirsiniz.
                                        </div>
                                    </div>

                                    <div className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-gray-50">
                                        <h4 className="flex items-center gap-3 text-lg font-bold text-gray-900 mb-4">
                                            <div className="p-2 bg-pink-100 rounded-lg">
                                                <Sparkles className="w-6 h-6 text-pink-600" />
                                            </div>
                                            AI İçerik Yazarı & Düzenleme
                                        </h4>
                                        <p className="text-gray-600 mb-4">
                                            Listenin üzerindeki <strong>Kalem İkonuna</strong> basarak veriyi düzenleyebilirsiniz. Açılan pencerede <strong>"AI ile Yaz"</strong> butonuna basarsanız, sistem o işletme için profesyonel ve SEO uyumlu bir tanıtım yazısı oluşturur.
                                        </p>
                                        <div className="bg-pink-50 text-pink-700 px-4 py-2 rounded-lg text-sm font-medium inline-block">
                                            <span className="font-bold">Güvenlik:</span> AI metni oluşturur, ancak yayınlamaz. Siz okuyup onaylamadan (Kaydet demeden) hiçbir şey siteye eklenmez.
                                        </div>
                                    </div>

                                    <div className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-gray-50">
                                        <h4 className="flex items-center gap-3 text-lg font-bold text-gray-900 mb-4">
                                            <div className="p-2 bg-orange-100 rounded-lg">
                                                <MapPin className="w-6 h-6 text-orange-600" />
                                            </div>
                                            Toplu AI Şehir Onarımı
                                        </h4>
                                        <p className="text-gray-600 mb-4">
                                            Seçtiğiniz onlarca kaydın şehir bilgilerini tek seferde düzeltebilirsiniz. Listeden kayıtları seçin ve pembe bardaki <strong>"Toplu AI Onar"</strong> butonuna basın. AI, ham verileri sizin yerinize analiz edip sisteme uygun hale getirir.
                                        </p>
                                        <div className="bg-orange-50 text-orange-700 px-4 py-2 rounded-lg text-sm font-medium inline-block">
                                            🚀 Hız: Saniyeler içinde yüzlerce "Tanımsız Şehir" hatasını sıfıra indirebilirsiniz.
                                        </div>
                                    </div>

                                    <div className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-gray-50">
                                        <h4 className="flex items-center gap-3 text-lg font-bold text-gray-900 mb-4">
                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                <Zap className="w-6 h-6 text-blue-600" />
                                            </div>
                                            💎 Yüksek Kalitelileri Seç
                                        </h4>
                                        <p className="text-gray-600">
                                            Vaktiniz kısıtlıysa sadece "en iyi" adaylara odaklanın. Bu buton, ekranda gördüğünüz listeden hem kategorisi eşleşmiş, hem de telefon ve e-postası tam olan tüm kayıtları anında seçer. Tek tıkla onaylamaya hazır hale getirir.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab: Büyüme */}
                        {activeTab === 'growth' && (
                            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Büyüme Motoru 🚀</h3>
                                    <p className="text-gray-500 text-lg">
                                        İşletmeleri platforma davet ederek ekosistemi büyütün.
                                    </p>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="border border-gray-200 rounded-2xl p-6 hover:border-pink-300 transition-colors group">
                                        <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <Mail className="w-6 h-6 text-pink-600" />
                                        </div>
                                        <h4 className="text-lg font-bold text-gray-900 mb-2">Otomatik Davet</h4>
                                        <p className="text-gray-500 text-sm">
                                            Liste üzerindeki mektup ikonuna tıkladığınızda, o işletme için özel hazırlanmış, profesyonel Almanca davet metni açılır.
                                        </p>
                                    </div>

                                    <div className="border border-gray-200 rounded-2xl p-6 hover:border-indigo-300 transition-colors group">
                                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <LayoutList className="w-6 h-6 text-indigo-600" />
                                        </div>
                                        <h4 className="text-lg font-bold text-gray-900 mb-2">Güvenli Toplu Gönderim</h4>
                                        <p className="text-gray-500 text-sm">
                                            Birden fazla işletme seçip "Toplu Davet" diyebilirsiniz. Sistem spam riskini önlemek için gönderimi otomatik olarak <strong>40 kişiyle sınırlar</strong> ve BCC ("Gizli") yöntemini kullanır.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab: FAQ */}
                        {activeTab === 'faq' && (
                            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Sıkça Sorulan Sorular</h3>
                                    <p className="text-gray-500 text-lg">
                                        Hızlı çözümler ve ipuçları.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    {[
                                        { q: "Sistemdeki araçlar (Tekrar Tarama, AI Onarım) güvenli mi?", a: "Kesinlikle evet! Bu araçlar verileri silmez veya bozmaz. 'Tekrarları Tara' sadece eşleşenleri ayırır, 'AI Şehir Onar' ise sadece hatalı konumları iyileştirir. Tüm işlemler sizin onayınızdan geçer." },
                                        { q: "Onayla & Yayınla butonu verileri nasıl işler?", a: "Bu buton, aday tedarikçiyi tüm bilgileriyle (yeni eklenen iletişim alanları dahil) ana listeye kusursuz şekilde aktarır. Bir hata yaparsanız, ana listeden her zaman silebilirsiniz." },
                                        { q: "Neden sayfa geçişlerinde 'F5' (Yenilenme) hissi olmuyor?", a: "Sessiz Güncelleme (Silent Refresh) teknolojisi sayesinde; veriler siz gezinirken arka planda çekilir. Ekran bembeyaz olmaz, mevcut veriler siz hazır olana kadar yerinde kalır." },
                                        { q: "Otomatik Güncelleme kapalıyken veri gelir mi?", a: "Hayır. Siz 'Listeyi Yenile' butonuna basana kadar liste sabit kalır. Bu sayede veri işlerken listenin kayması veya değişmesi gibi sorunlar yaşamazsınız." },
                                        { q: "Toplu AI Onar (Şehir) her veriyi düzeltir mi?", a: "AI oldukça yeteneklidir ancak gelen ham veri (city_raw) tamamen boş veya anlamsızsa (örn: '---') düzeltemeyebilir. Bu durumlarda manuel düzenleme gerekebilir." },
                                        { q: "Kalitelileri Seç (💎) kriterleri nelerdir?", a: "Sistem, o anki filtrenizde bulunan kayıtlardan e-postası olan, telefonu olan ve kategorisi sisteme uygun şekilde eşleşmiş olanları otomatik olarak işaretler." }
                                    ].map((faq, i) => (
                                        <div key={i} className="bg-gray-50 rounded-2xl p-6 hover:bg-white hover:shadow-md transition-all border border-gray-100">
                                            <h4 className="font-bold text-gray-900 mb-2 flex gap-3 text-lg">
                                                <span className="text-pink-500">Q.</span>
                                                {faq.q}
                                            </h4>
                                            <p className="text-gray-600 pl-8 leading-relaxed">
                                                {faq.a}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminImportsHelp;
