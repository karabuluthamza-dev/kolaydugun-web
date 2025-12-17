import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import SocialMediaLinks from './SocialMediaLinks';
import { useSiteSettings } from '../hooks/useSiteSettings';
import './Footer.css';

const Footer = () => {
    const { language } = useLanguage();
    const { settings } = useSiteSettings();

    const texts = {
        tr: {
            vendors: 'Tedarikçiler',
            shop: 'Shop',
            blog: 'Blog',
            forum: 'Forum',
            faq: 'S.S.S.',
            impressum: 'Künye',
            privacy: 'Gizlilik',
            terms: 'Koşullar',
            rights: 'Tüm hakları saklıdır.'
        },
        de: {
            vendors: 'Dienstleister',
            shop: 'Shop',
            blog: 'Blog',
            forum: 'Forum',
            faq: 'FAQ',
            impressum: 'Impressum',
            privacy: 'Datenschutz',
            terms: 'AGB',
            rights: 'Alle Rechte vorbehalten.'
        },
        en: {
            vendors: 'Vendors',
            shop: 'Shop',
            blog: 'Blog',
            forum: 'Forum',
            faq: 'FAQ',
            impressum: 'Imprint',
            privacy: 'Privacy',
            terms: 'Terms',
            rights: 'All rights reserved.'
        }
    };

    const txt = texts[language] || texts.tr;

    return (
        <footer className="footer-compact">
            <div className="container">
                {/* Top Row - Logo & Links */}
                <div className="footer-top">
                    <Link to="/" className="footer-logo">KolayDugun.de</Link>

                    <div className="footer-nav">
                        <Link to="/vendors">{txt.vendors}</Link>
                        <Link to="/shop">{txt.shop}</Link>
                        <Link to="/blog">{txt.blog}</Link>
                        <Link to="/community">{txt.forum}</Link>
                        <Link to="/faq">{txt.faq}</Link>
                        <span className="footer-divider">|</span>
                        <Link to="/p/impressum">{txt.impressum}</Link>
                        <Link to="/p/datenschutz">{txt.privacy}</Link>
                        <Link to="/p/agb">{txt.terms}</Link>
                    </div>
                </div>

                {/* Bottom Row - Copyright & Social */}
                <div className="footer-bottom">
                    <span className="footer-copy">© {new Date().getFullYear()} KolayDugun.de · {txt.rights}</span>

                    <a href="mailto:kontakt@kolaydugun.de" className="footer-email">📧 kontakt@kolaydugun.de</a>

                    <div className="footer-social">
                        {settings?.social_media && (
                            <SocialMediaLinks socialMedia={settings.social_media} />
                        )}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
