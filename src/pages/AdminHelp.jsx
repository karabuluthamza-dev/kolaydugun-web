import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import './AdminAnalytics.css';
import { HelpCircle, Shield, UserPlus, Star } from 'lucide-react';
import { dictionary } from '../locales/dictionary';

const AdminHelp = () => {
    const { language } = useLanguage();
    const strings = dictionary.adminPanel.helpGuide;

    const getT = (obj) => {
        if (!obj) return '';
        if (typeof obj === 'string') return obj;
        return obj[language] || obj['en'] || '';
    };

    if (!strings) return null;

    return (
        <div className="section container" style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                <HelpCircle size={32} color="#e91e63" />
                <div>
                    <h1 style={{ margin: 0 }}>{getT(strings.title)}</h1>
                    <p style={{ color: '#666', margin: 0 }}>{getT(strings.subtitle)}</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '25px' }}>

                {/* CLAIM SYSTEM SECTION */}
                <div style={{ background: '#fff', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                        <Shield color="#10b981" />
                        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{getT(strings.sections.claim.title)}</h2>
                    </div>
                    <div style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#4b5563' }}>
                        <h3>{getT(strings.sections.claim.q1)}</h3>
                        <p>{getT(strings.sections.claim.a1)}</p>

                        <h3>{getT(strings.sections.claim.q2)}</h3>
                        <ol style={{ paddingLeft: '20px' }}>
                            {strings.sections.claim.steps.map((step, i) => (
                                <li key={i}>{getT(step)}</li>
                            ))}
                        </ol>

                        <h3>{getT(strings.sections.claim.q3)}</h3>
                        <p>{getT(strings.sections.claim.a3)}</p>
                    </div>
                </div>

                {/* RANKING SYSTEM SECTION */}
                <div style={{ background: '#fff', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                        <Star color="#f59e0b" />
                        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{getT(strings.sections.ranking.title)}</h2>
                    </div>
                    <div style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#4b5563' }}>
                        <p>{getT(strings.sections.ranking.intro)}</p>
                        <ul style={{ paddingLeft: '20px' }}>
                            {strings.sections.ranking.factors.map((f, i) => (
                                <li key={i}>{getT(f)}</li>
                            ))}
                        </ul>
                        <p>{getT(strings.sections.ranking.footer)}</p>
                    </div>
                </div>

                {/* USER ROLES SECTION */}
                <div style={{ background: '#fff', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                        <UserPlus color="#3b82f6" />
                        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{getT(strings.sections.roles.title)}</h2>
                    </div>
                    <div style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#4b5563' }}>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            <li><strong>{getT(strings.sections.roles.couple).split(':')[0]}:</strong>{getT(strings.sections.roles.couple).split(':')[1]}</li>
                            <li><strong>{getT(strings.sections.roles.vendor).split(':')[0]}:</strong>{getT(strings.sections.roles.vendor).split(':')[1]}</li>
                            <li><strong>{getT(strings.sections.roles.admin).split(':')[0]}:</strong>{getT(strings.sections.roles.admin).split(':')[1]}</li>
                        </ul>
                    </div>
                </div>

                {/* FINANCE SYSTEM SECTION */}
                <div style={{ background: '#fff', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                        <div style={{ background: '#ecfdf5', padding: '8px', borderRadius: '10px' }}>
                            <span style={{ fontSize: '1.2rem' }}>💰</span>
                        </div>
                        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{getT(strings.sections.finance.title)}</h2>
                    </div>
                    <div style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#4b5563' }}>
                        <p>{getT(strings.sections.finance.intro)}</p>
                        <ul style={{ paddingLeft: '20px' }}>
                            {strings.sections.finance.tiers.map((t, i) => (
                                <li key={i}><strong>{getT(t).split(':')[0]}:</strong>{getT(t).split(':')[1]}</li>
                            ))}
                        </ul>
                        <p>{getT(strings.sections.finance.footer)}</p>
                    </div>
                </div>

                {/* COMMISSION SYSTEM SECTION */}
                <div style={{ background: '#fff', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                        <div style={{ background: '#eff6ff', padding: '8px', borderRadius: '10px' }}>
                            <span style={{ fontSize: '1.2rem' }}>📊</span>
                        </div>
                        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{getT(strings.sections.commission.title)}</h2>
                    </div>
                    <div style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#4b5563' }}>
                        <p>{getT(strings.sections.commission.intro)}</p>
                        <ul style={{ paddingLeft: '20px' }}>
                            {strings.sections.commission.rules.map((r, i) => (
                                <li key={i}>{getT(r)}</li>
                            ))}
                        </ul>
                    </div>
                </div>

            </div>

            <div style={{ marginTop: '40px', padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <p style={{ color: '#64748b', margin: 0 }}>{getT(strings.footerNote)}</p>
            </div>
        </div >
    );
};

export default AdminHelp;
