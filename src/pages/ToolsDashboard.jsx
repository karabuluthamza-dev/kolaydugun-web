import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import usePageTitle from '../hooks/usePageTitle';
import './ToolsDashboard.css';

const ToolCard = ({ title, desc, icon, link, progress, t }) => (
    <Link to={link} className="tool-card-link">
        <div className="tool-card">
            <div>
                <div className="tool-icon">{icon}</div>
                <h3 className="tool-title">{title}</h3>
                <p className="tool-desc">{desc}</p>
            </div>

            {progress !== undefined && (
                <div className="tool-progress-container">
                    <div className="tool-progress-label">
                        <span>{t('planningTools.progress') || 'İlerleme'}</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="tool-progress-bar-bg">
                        <div className="tool-progress-bar-fill" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
            )}
        </div>
    </Link>
);

const ToolsDashboard = () => {
    usePageTitle('Planning Tools');
    const { t } = useLanguage();

    return (
        <div className="section container tools-dashboard">
            <h2 className="mb-lg">{t('planningTools.title') || 'Düğün Planlama Araçları'}</h2>
            <p className="tools-intro">
                {t('planningTools.intro') || 'Düğününüzü mükemmel şekilde planlamak için ihtiyacınız olan her şey, tek bir yerde.'}
            </p>

            <div className="tools-grid">
                <ToolCard
                    t={t}
                    title={`🌐 ${t('planningTools.website.title') || 'Web Sitem'}`}
                    desc={t('planningTools.website.desc') || 'Düğününüz için özel bir web sitesi oluşturun. Hikayenizi paylaşın ve LCV toplayın.'}
                    icon="💌"
                    link="/tools/website"
                    progress={0}
                />
                <ToolCard
                    t={t}
                    title={`📅 ${t('planningTools.agenda.title') || t('planningTools.agenda') || 'Ajandam'}`}
                    desc={t('planningTools.agenda.desc') || t('planningTools.agendaDesc') || 'Düğün tarihinize göre aylık yapılacaklar listesi.'}
                    icon="📋"
                    link="/tools/timeline"
                    progress={0}
                />
                <ToolCard
                    t={t}
                    title={`💰 ${t('planningTools.budget.title') || 'Bütçem'}`}
                    desc={t('planningTools.budget.desc') || 'Toplam bütçenizi belirleyin, harcama kalemlerini yönetin ve ödemelerinizi takip edin.'}
                    icon="💳"
                    link="/tools/budget"
                    progress={0}
                />
                <ToolCard
                    t={t}
                    title={`👥 ${t('planningTools.guests.title') || 'Davetli Listesi'}`}
                    desc={t('planningTools.guests.desc') || 'Davetlilerinizi listeleyin, LCV (RSVP) durumlarını ve yemek tercihlerini takip edin.'}
                    icon="👥"
                    link="/tools/guests"
                    progress={0}
                />
                <ToolCard
                    t={t}
                    title={`🪑 ${t('planningTools.seating.title') || 'Oturma Planı'}`}
                    desc={t('planningTools.seating.desc') || 'Misafirlerinizi masalara yerleştirin, oturma düzenini kolayca oluşturun.'}
                    icon="🪑"
                    link="/tools/seating"
                    progress={0}
                />
                <ToolCard
                    t={t}
                    title={`🌤️ ${t('planningTools.weather.title') || 'Hava Durumu'}`}
                    desc={t('planningTools.weather.desc') || 'Düğün tarihi ve şehrinize göre hava tahmini alın, ortalama sıcaklık ve gün batımı saatini öğrenin.'}
                    icon="☀️"
                    link="/tools/weather"
                />
            </div>
        </div>
    );
};

export default ToolsDashboard;
