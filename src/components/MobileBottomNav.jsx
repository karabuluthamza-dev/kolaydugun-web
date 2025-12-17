import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    Home,
    ShoppingBag,
    Users,
    MessageSquare,
    User
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import './MobileBottomNav.css';

const MobileBottomNav = () => {
    const { t, language } = useLanguage();

    return (
        <nav className="mobile-bottom-nav lg:hidden">
            <div className="mobile-nav-container">
                <NavLink to="/" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
                    <Home className="nav-icon" />
                    <span>{t('mobileNav.home')}</span>
                </NavLink>

                <NavLink to={`/${language}/shop`} className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
                    <ShoppingBag className="nav-icon" />
                    <span>{t('mobileNav.shop')}</span>
                </NavLink>

                <div className="mobile-nav-action-wrapper">
                    <NavLink to="/contact" className="mobile-nav-action-btn">
                        <div className="action-btn-inner">
                            <span className="action-icon">💌</span>
                        </div>
                        <span className="action-label">{t('hero.getFreeQuote') || t('mobileNav.quote')}</span>
                    </NavLink>
                </div>

                <NavLink to="/vendors" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
                    <Users className="nav-icon" />
                    <span>{t('mobileNav.vendors')}</span>
                </NavLink>

                <NavLink to="/community" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
                    <MessageSquare className="nav-icon" />
                    <span>{t('mobileNav.forum')}</span>
                </NavLink>

                <NavLink to="/profile" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
                    <User className="nav-icon" />
                    <span>{t('mobileNav.profile')}</span>
                </NavLink>
            </div>
        </nav>
    );
};

export default MobileBottomNav;
