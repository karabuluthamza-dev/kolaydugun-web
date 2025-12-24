import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import SocialMediaLinks from './SocialMediaLinks';
import { useSiteSettings } from '../hooks/useSiteSettings';
import './Footer.css';

const Footer = () => {
    const { language, t } = useLanguage();
    const { settings } = useSiteSettings();

    const topCategories = [
        { label: t('categories.wedding_venues'), to: '/locations/deutschland/dugun-salonlari' },
        { label: t('categories.wedding_photography'), to: '/locations/deutschland/dugun-fotografcilari' },
        { label: t('categories.djs'), to: '/locations/deutschland/djs' },
        { label: t('categories.bridal_fashion'), to: '/locations/deutschland/bridal-fashion' },
        { label: t('categories.wedding_planners'), to: '/locations/deutschland/wedding-planners' },
    ];

    const topCities = [
        { label: 'Berlin', to: '/locations/berlin' },
        { label: 'Hamburg', to: '/locations/hamburg' },
        { label: 'München', to: '/locations/muenchen' },
        { label: 'Köln', to: '/locations/koeln' },
        { label: 'Frankfurt', to: '/locations/frankfurt' },
        { label: 'Stuttgart', to: '/locations/stuttgart' },
        { label: 'Düsseldorf', to: '/locations/duesseldorf' },
    ];

    const planningLinks = [
        { label: t('mobileNav.vendors'), to: '/vendors' },
        { label: t('mobileNav.shop'), to: '/shop' },
        { label: t('mobileNav.forum'), to: '/community' },
        { label: t('liveRequest.title'), to: '/canli-istek-sistemi' },
        { label: t('faq.title'), to: '/faq' },
        { label: t('sitemapLink') || 'Site Haritası', to: '/directory' },
    ];

    const legalLinks = [
        { label: t('footer.impressum') || 'Impressum', to: '/p/impressum' },
        { label: t('footer.privacy') || 'Privacy', to: '/p/datenschutz' },
        { label: t('footer.terms') || 'Terms', to: '/p/agb' },
        { label: t('common.about'), to: '/p/ueber-uns' },
        { label: language === 'tr' ? 'Kurucumuz & Vizyonumuz' : 'Founder & Vision', to: '/kurucumuz' },
    ];

    return (
        <footer className="footer-expanded">
            <div className="container">
                <div className="footer-grid">
                    {/* Column 1: Planning */}
                    <div className="footer-col">
                        <h4>{t('footer.planning', language === 'tr' ? 'PLANLAMA' : (language === 'en' ? 'PLANNING' : 'HOCHZEITSPLANUNG'))}</h4>
                        <ul className="footer-links">
                            {planningLinks.map((link, i) => (
                                <li key={i}><Link to={link.to}>{link.label}</Link></li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 2: Services */}
                    <div className="footer-col">
                        <h4>{t('footer.services', language === 'tr' ? 'HİZMETLER' : (language === 'en' ? 'TOP SERVICES' : 'TOP DIENSTLEISTER'))}</h4>
                        <ul className="footer-links">
                            {topCategories.map((link, i) => (
                                <li key={i}><Link to={link.to}>{link.label}</Link></li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 3: Cities */}
                    <div className="footer-col">
                        <h4>{t('footer.cities', language === 'tr' ? 'ŞEHİRLER' : (language === 'en' ? 'CITIES' : 'TOP LOCATIONS'))}</h4>
                        <ul className="footer-links">
                            {topCities.map((link, i) => (
                                <li key={i}><Link to={link.to}>{link.label}</Link></li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 4: About/Legal */}
                    <div className="footer-col">
                        <h4>{t('footer.corporate', language === 'tr' ? 'KURUMSAL' : (language === 'en' ? 'CORPORATE' : 'ÜBER UNS & RECHTLICHES'))}</h4>
                        <ul className="footer-links">
                            {legalLinks.map((link, i) => (
                                <li key={i}><Link to={link.to}>{link.label}</Link></li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="footer-divider-line"></div>

                <div className="footer-bottom-row">
                    <div className="footer-brand">
                        <Link to="/" className="footer-logo">KolayDugun.de</Link>
                        <p className="footer-copy">© {new Date().getFullYear()} KolayDugun.de · {t('footer.rights') || 'Alle Rechte vorbehalten.'}</p>
                    </div>

                    <div className="footer-contact-info">
                        <a href="mailto:kontakt@kolaydugun.de" className="footer-email">📧 kontakt@kolaydugun.de</a>
                        <div className="footer-social-wrapper">
                            {settings?.social_media && (
                                <SocialMediaLinks socialMedia={settings.social_media} />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
