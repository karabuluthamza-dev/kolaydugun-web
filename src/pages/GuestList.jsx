import React, { useState } from 'react';
import { usePlanning } from '../context/PlanningContext';
import { useLanguage } from '../context/LanguageContext';

const GuestList = () => {
    const { guests, addGuest, removeGuest } = usePlanning();
    const { t } = useLanguage();
    const [newGuest, setNewGuest] = useState("");

    const handleAddGuest = (e) => {
        e.preventDefault();
        if (!newGuest.trim()) return;
        addGuest({ name: newGuest, rsvp: "Pending", meal: "-" });
        setNewGuest("");
    };

    const getRsvpLabel = (status) => {
        if (status === 'Confirmed') return t('guestsManager.confirmed') || 'Confirmed';
        if (status === 'Declined') return t('guestsManager.declined') || 'Declined';
        return t('guestsManager.pending') || 'Pending';
    };

    return (
        <div className="section container" style={{ marginTop: '80px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>{t('guestsManager.title') || 'Davetli Listesi'}</h2>
                <div style={{ fontSize: '1.2rem', fontWeight: '500' }}>
                    {t('guestsManager.totalGuests') || 'Toplam Davetli'}: <span style={{ color: 'var(--color-primary)' }}>{guests.length}</span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                <div style={{ background: 'white', borderRadius: 'var(--border-radius)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f9f9f9', borderBottom: '1px solid #eee' }}>
                            <tr>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>{t('guestsManager.name') || 'Ad Soyad'}</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>{t('guestsManager.rsvp') || 'LCV (RSVP)'}</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>{t('guestsManager.meal') || 'Yemek Tercihi'}</th>
                                <th style={{ padding: '1rem', textAlign: 'right' }}>{t('guestsManager.action') || 'İşlem'}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {guests.map(guest => (
                                <tr key={guest.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '1rem' }}>{guest.name}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '0.8rem',
                                            background: guest.rsvp === 'Confirmed' ? '#e6f4ea' : guest.rsvp === 'Declined' ? '#fce8e6' : '#fff7e6',
                                            color: guest.rsvp === 'Confirmed' ? '#1e8e3e' : guest.rsvp === 'Declined' ? '#d93025' : '#f1c232'
                                        }}>
                                            {getRsvpLabel(guest.rsvp)}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>{guest.meal}</td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <button
                                            onClick={() => removeGuest(guest.id)}
                                            style={{ color: '#d93025', background: 'none', cursor: 'pointer' }}
                                        >
                                            {t('guestsManager.remove') || 'Kaldır'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div style={{ height: 'fit-content', background: 'white', padding: '1.5rem', borderRadius: 'var(--border-radius)', boxShadow: 'var(--shadow-sm)' }}>
                    <h3 style={{ marginBottom: '1rem' }}>{t('guestsManager.addGuest') || 'Davetli Ekle'}</h3>
                    <form onSubmit={handleAddGuest}>
                        <input
                            type="text"
                            placeholder={t('guestsManager.guestNamePlaceholder') || 'Davetli Adı Soyadı'}
                            value={newGuest}
                            onChange={(e) => setNewGuest(e.target.value)}
                            style={{ width: '100%', padding: '10px', marginBottom: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                        <button className="btn btn-primary" style={{ width: '100%' }}>{t('guestsManager.addGuest') || 'Davetli Ekle'}</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default GuestList;
