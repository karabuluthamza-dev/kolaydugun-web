import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { useLanguage } from '../context/LanguageContext';
import './DirectoryPage.css';

const DirectoryPage = () => {
    const { t, language } = useLanguage();

    const cities = [
        'Berlin', 'Hamburg', 'Muenchen', 'Koeln', 'Frankfurt',
        'Stuttgart', 'Duesseldorf', 'Leipzig', 'Dortmund', 'Essen',
        'Bremen', 'Dresden', 'Hannover', 'Nuerneberg', 'Duisburg'
    ];

    const categories = [
        { name: 'wedding_venues', slug: 'dugun-salonlari' },
        { name: 'wedding_photography', slug: 'dugun-fotografcilari' },
        { name: 'djs', slug: 'djs' },
        { name: 'wedding_planners', slug: 'wedding-planners' },
        { name: 'bridal_fashion', slug: 'bridal-fashion' },
        { name: 'catering_party', slug: 'catering' },
        { name: 'hair_makeup', slug: 'hair-makeup' }
    ];

    return (
        <div className="directory-page section container">
            <SEO
                title={t('directory.title') || 'Dizin - Tüm Şehirler ve Kategoriler | KolayDugun'}
                description={t('directory.description') || 'Almanya genelindeki tüm düğün mekanları ve hizmetleri şehir şehir keşfedin.'}
                url="/directory"
            />

            <div className="directory-header">
                <h1>{t('directory.title') || 'Düğün Hizmetleri Dizini'}</h1>
                <p>{t('directory.subtitle') || 'Şehir ve kategoriye göre profesyonelleri bulun.'}</p>
            </div>

            <div className="directory-grid">
                {cities.map(city => (
                    <div key={city} className="directory-city-section">
                        <h2>{city.replace('Muenchen', 'München').replace('Koeln', 'Köln')}</h2>
                        <ul className="directory-links">
                            <li>
                                <Link to={`/locations/${city.toLowerCase()}`}>
                                    {t('directory.all_in') || 'Tüm Hizmetler'} - {city}
                                </Link>
                            </li>
                            {categories.map(cat => (
                                <li key={cat.slug}>
                                    <Link to={`/locations/${city.toLowerCase()}/${cat.slug}`}>
                                        {t(`categories.${cat.name}`)} - {city}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DirectoryPage;
