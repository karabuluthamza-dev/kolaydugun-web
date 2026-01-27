import React, { useEffect } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import SEO from '../components/SEO';
import './PartnershipProposal.css';

const PartnershipProposal = () => {
    const { category = 'venues' } = useParams();
    const [searchParams] = useSearchParams();
    const venueName = searchParams.get('venue') || 'Seçkin İş Ortağımız';
    const cityName = searchParams.get('city') || 'Almanya';

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const renderVenuesTemplate = () => (
        <div className="proposal-content">
            {/* PAGE 1: DEUTSCH (GERMAN) */}
            <article className="proposal-page">
                <header className="proposal-hero">
                    <div className="proposal-logo-area">
                        <div className="proposal-logo">KOLAYDUGUN</div>
                        <div className="proposal-tagline">ELITE PARTNER SERIES 2026</div>
                    </div>
                    <h1>Einladung für die Hochzeitssäle der Zukunft</h1>
                    <p>Eine 360°-Ökosystem-Partnerschaft, die die elitärsten Veranstaltungsorte Deutschlands mit den digitalen Erwartungen moderner Paare verbindet.</p>

                    <div className="lang-indicator">PARTNERSCHAFTSANGEBOT: DEUTSCH</div>
                </header>

                <main className="proposal-main">
                    <section className="vision-section">
                        <div className="proposal-section-title">
                            <h2>Unsere Vision & Ziel</h2>
                            <div className="proposal-line"></div>
                        </div>

                        <div className="lang-block">
                            <h3>🇩🇪 Unser Ziel</h3>
                            <p>Sehr geehrtes Team von <strong>{venueName}</strong>, Ihre angesehene Position im deutschen Hochzeitssektor hat Sie zu einem exzellenten Kandidaten für unser <strong>KolayDugun Elite Partner</strong> Netzwerk gemacht. Unser Ziel ist es, die Qualität Ihres Hauses der neuen Generation von Paaren, die ihre Entscheidungen digital in Sekundenschnelle treffen, hochprofessionell zu präsentieren.</p>
                        </div>

                        <div className="lang-block" style={{ marginTop: '2rem' }}>
                            <h3>🤝 Win-Win Strategie</h3>
                            <p>Unsere Zusammenarbeit basiert auf gegenseitigem Wachstum. Der gesamte technische Einrichtungsprozess wird von uns <strong>kostenlos</strong> durchgeführt. Während wir das digitale Management der Zusatzleistungen (Musik, Foto, Organisation) übernehmen, konzentrieren Sie sich auf Ihr Kerngeschäft: exzellente Events.</p>
                        </div>
                    </section>

                    <div className="value-grid">
                        <div className="value-card">
                            <span className="icon">🚀</span>
                            <h3>Digital Speed</h3>
                            <p>Sofortige Angebote und schnelle Konvertierung für moderne Paare.</p>
                        </div>
                        <div className="value-card">
                            <span className="icon">🎯</span>
                            <h3>Targeted Leads</h3>
                            <p>Vollständig ausgefüllte, ernsthafte Kundenanfragen direkt in Ihr Postfach.</p>
                        </div>
                        <div className="value-card">
                            <span className="icon">🌍</span>
                            <h3>360° Ecosystem</h3>
                            <p>Zertifiziertes Partnernetzwerk in über 20 verschiedenen Kategorien.</p>
                        </div>
                    </div>

                    <div className="proposal-section-title" style={{ marginTop: '3rem' }}>
                        <h2>Technische Module</h2>
                        <div className="proposal-line"></div>
                    </div>

                    <div className="data-grid">
                        <div className="data-card">
                            <h3>Kapazität & Preise</h3>
                            <p>Transparente und schnelle Informationen durch dynamische Tabellen.</p>
                            <div className="mockup-table">
                                <div className="table-row head"><span>Saal</span><span>Menü</span><span>Cocktail</span></div>
                                <div className="table-row"><span>Hauptsaal</span><span>500</span><span>750</span></div>
                                <div className="table-row"><span>Garten</span><span>1200</span><span>1500</span></div>
                            </div>
                        </div>

                        <div className="data-card">
                            <h3>Live Kalender</h3>
                            <p>Wir ermöglichen es Paaren, Ihre Verfügbarkeit sofort zu sehen.</p>
                            <div className="calendar-mock">
                                <div className="cal-day available">Mai ✓</div>
                                <div className="cal-day full">Jun ✗</div>
                                <div className="cal-day full">Jul ✗</div>
                                <div className="cal-day critical">Aug !</div>
                                <div className="cal-day available">Sep ✓</div>
                            </div>
                        </div>
                    </div>
                </main>

                <footer className="proposal-footer">
                    <div className="founder-box">
                        <span className="role">Founder & CEO</span>
                        <h4>Hamza Karabulut</h4>
                        <p>KolayDugun Strategy Manager & Offizieller Musikdirektor</p>
                    </div>
                    <div className="contact-details">
                        <div className="contact-item"><span>WhatsApp</span> 0162 872 61 92</div>
                        <div className="contact-item"><span>E-Mail</span> kontakt@kolaydugun.de</div>
                        <div className="contact-item"><span>Web</span> kolaydugun.de</div>
                    </div>
                </footer>
            </article>

            {/* PAGE 2: TÜRKÇE (TURKISH) */}
            <article className="proposal-page">
                <header className="proposal-hero">
                    <div className="proposal-logo-area">
                        <div className="proposal-logo">KOLAYDUGUN</div>
                        <div className="proposal-tagline">ELITE PARTNER SERIES 2026</div>
                    </div>
                    <h1>Geleceğin Düğün Salonlarına Davet</h1>
                    <p>Almanya'nın en elit mekanlarını, modern çiftlerin dijital beklentileriyle buluşturan 360° ekosistem ortaklığı.</p>

                    <div className="lang-indicator">İŞ BİRLİĞİ TEKLİFİ: TÜRKÇE</div>
                </header>

                <main className="proposal-main">
                    <section className="vision-section">
                        <div className="proposal-section-title">
                            <h2>Vizyonumuz ve Amacımız</h2>
                            <div className="proposal-line"></div>
                        </div>

                        <div className="lang-block">
                            <h3>🇹🇷 İletişim Amacımız</h3>
                            <p>Sayın <strong>{venueName}</strong> ekibi, işletmenizin Almanya düğün sektöründeki prestijli konumu, sizi <strong>KolayDugun Elite Partner</strong> ağımız için seçkin bir aday haline getirdi. Amacımız, salonunuzun kalitesini dijital dünyada saniyeler içinde karar veren yeni nesil çiftlere en profesyonel şekilde yansıtmaktır.</p>
                        </div>

                        <div className="lang-block" style={{ marginTop: '2rem' }}>
                            <h3>🤝 Kazan-Kazan Stratejisi</h3>
                            <p>İş birliğimizin temeli karşılıklı büyümeye dayanır. Tüm teknik kurulum süreci tarafımızdan <strong>ücretsiz</strong> olarak yürütülür. Biz yan hizmetlerin (müzik, fotoğraf, organizasyon) dijital yönetimini üstlenirken, siz asıl işiniz olan mükemmel etkinliklere odaklanırsınız.</p>
                        </div>
                    </section>

                    <div className="value-grid">
                        <div className="value-card">
                            <span className="icon">🚀</span>
                            <h3>Dijital Hız</h3>
                            <p>Yeni nesil çiftler için anlık teklifler ve hızlı dönüşüm oranları.</p>
                        </div>
                        <div className="value-card">
                            <span className="icon">🎯</span>
                            <h3>Hedefli Talepler</h3>
                            <p>Doğrudan sisteminize düşen, verisi tam dolu ciddi müşteri talepleri.</p>
                        </div>
                        <div className="value-card">
                            <span className="icon">🌍</span>
                            <h3>360° Ekosistem</h3>
                            <p>20'den fazla farklı kategoride onaylı ve sertifikalı partner ağı.</p>
                        </div>
                    </div>

                    <div className="proposal-section-title" style={{ marginTop: '3rem' }}>
                        <h2>Teknik VIP Modülleri</h2>
                        <div className="proposal-line"></div>
                    </div>

                    <div className="data-grid">
                        <div className="data-card">
                            <h3>Akıllı Lead Formu</h3>
                            <p>Size her zaman hazır ve nitelikli veri paketi sunar.</p>
                            <ul className="check-list">
                                <li>✓ Ad / Soyad / Telefon</li>
                                <li>✓ Kesin Düğün Tarihi</li>
                                <li>✓ Net Misafir Sayısı</li>
                            </ul>
                        </div>

                        <div className="data-card">
                            <h3>Analiz Paneli</h3>
                            <p>Profilinizin performansını gerçek zamanlı olarak takip edin.</p>
                            <div className="stats-row">
                                <div className="stat"><strong>12K+</strong><small>Görüntülenme</small></div>
                                <div className="stat"><strong>47</strong><small>Yeni Talep</small></div>
                            </div>
                        </div>
                    </div>

                    <div className="proposal-section-title" style={{ marginTop: '3rem' }}>
                        <h2>Sahiplenme Modeli</h2>
                        <div className="proposal-line"></div>
                    </div>
                    <div className="claim-box">
                        <p>Bu profesyonel sayfayı <strong>"🔐 Profili Sahiplen"</strong> butonu ile ücretsiz doğrulayıp hemen kontrol etmeye başlayabilirsiniz.</p>
                    </div>
                </main>

                <footer className="proposal-footer">
                    <div className="founder-box">
                        <span className="role">Kurucu & CEO</span>
                        <h4>Hamza Karabulut</h4>
                        <p>KolayDugun Strateji Yöneticisi & Resmi Müzik Direktörü</p>
                    </div>
                    <div className="contact-details">
                        <div className="contact-item"><span>WhatsApp</span> 0162 872 61 92</div>
                        <div className="contact-item"><span>E-Mail</span> kontakt@kolaydugun.de</div>
                        <div className="contact-item"><span>Web</span> kolaydugun.de</div>
                    </div>
                </footer>
            </article>
        </div>
    );

    const renderDefaultTemplate = () => (
        <div className="proposal-content">
            <article className="proposal-page">
                <header className="proposal-hero">
                    <h1>KolayDugun İş Ortaklığı</h1>
                    <p>{category.toUpperCase()} kategorisi için özel çözüm ortaklığı.</p>
                </header>
                <main className="proposal-main">
                    <p>Bu kategori için teklif içeriği hazırlanmaktadır.</p>
                </main>
            </article>
        </div>
    );

    return (
        <div className="proposal-wrapper">
            <SEO
                title={`${venueName} - VIP İş Birliği Teklifi | KolayDugun`}
                description="Almanya'nın en elit düğün mekanları için dijital dönüşüm ve VIP ortaklık sunumu."
            />
            {category === 'venues' ? renderVenuesTemplate() : renderDefaultTemplate()}
        </div>
    );
};

export default PartnershipProposal;
