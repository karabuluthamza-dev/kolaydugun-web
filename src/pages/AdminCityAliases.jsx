import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';
import { MapPin, Plus, Trash2, CheckCircle } from 'lucide-react';
import './AdminVendors.css';

const AdminCityAliases = () => {
    const { t } = useLanguage();
    const [aliases, setAliases] = useState([]);
    const [cities, setCities] = useState([]); // Internal cities
    const [loading, setLoading] = useState(true);
    const [newAlias, setNewAlias] = useState({ alias_name: '', target_city_id: '' });
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [deletingId, setDeletingId] = useState(null);


    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const [aliasRes, cityRes] = await Promise.all([
            supabase.from('city_aliases').select('*').order('alias_name'),
            supabase.from('cities').select('id, name').order('name')
        ]);
        setAliases(aliasRes.data || []);
        setCities(cityRes.data || []);
        setLoading(false);
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newAlias.alias_name || !newAlias.target_city_id) return;

        setSuccessMessage('');
        setErrorMessage('');

        const { error } = await supabase
            .from('city_aliases')
            .insert([newAlias]);

        if (error) {
            setErrorMessage(t('poaching.admin.error') + error.message);
            setTimeout(() => setErrorMessage(''), 5000);
        } else {
            setSuccessMessage(t('poaching.admin.success'));
            setTimeout(() => setSuccessMessage(''), 3000);
            setNewAlias({ alias_name: '', target_city_id: '' });
            fetchData();
        }
    };


    const handleDelete = async (id) => {
        setDeletingId(null);
        await supabase.from('city_aliases').delete().eq('id', id);
        setSuccessMessage(t('poaching.admin.success'));
        setTimeout(() => setSuccessMessage(''), 3000);
        fetchData();
    };

    if (loading) return <div>{t('poaching.admin.loading')}</div>;


    return (
        <div className="admin-vendors">
            <div className="admin-page-header">
                <h1>{t('poaching.admin.aliasesTitle')}</h1>
                <p>{t('poaching.admin.aliasesDesc')}</p>
            </div>

            {successMessage && (
                <div style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #16a34a' }}>
                    {successMessage}
                </div>
            )}
            {errorMessage && (
                <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #ef4444' }}>
                    {errorMessage}
                </div>
            )}

            <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
                <h3>{t('poaching.admin.addNewAlias')}</h3>
                <form onSubmit={handleAdd} style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <input
                        type="text"
                        placeholder={t('poaching.admin.placeholderAlias')}
                        className="form-control"
                        value={newAlias.alias_name}
                        onChange={(e) => setNewAlias({ ...newAlias, alias_name: e.target.value })}
                    />
                    <select
                        className="form-control"
                        value={newAlias.target_city_id}
                        onChange={(e) => setNewAlias({ ...newAlias, target_city_id: e.target.value })}
                    >
                        <option value="">{t('poaching.admin.selectTargetCity')}</option>
                        {cities.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                    <button className="btn-primary" style={{ padding: '0 2rem' }}>
                        <Plus size={18} /> {t('poaching.admin.add')}
                    </button>

                </form>
            </div>

            <div className="table-responsive" style={{ background: 'white', borderRadius: '12px', padding: '1rem' }}>
                <table className="vendors-table">
                    <thead>
                        <tr>
                            <th>{t('poaching.admin.tableHeader.aliasName')}</th>
                            <th>{t('poaching.admin.tableHeader.targetCity')}</th>
                            <th>{t('poaching.admin.tableHeader.actions')}</th>

                        </tr>
                    </thead>
                    <tbody>
                        {aliases.map(a => (
                            <tr key={a.id}>
                                <td style={{ fontWeight: 600 }}>{a.alias_name}</td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <CheckCircle size={14} color="#10b981" />
                                        {cities.find(c => c.id === a.target_city_id)?.name || t('adminPanel.sidebar.notSpecified')}

                                    </div>
                                </td>
                                <td>
                                    {deletingId === a.id ? (
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <button
                                                onClick={() => handleDelete(a.id)}
                                                style={{ border: 'none', background: '#ef4444', color: 'white', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                                            >
                                                {t('common.delete') || 'Sil'}
                                            </button>
                                            <button
                                                onClick={() => setDeletingId(null)}
                                                style={{ border: 'none', background: '#94a3b8', color: 'white', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                                            >
                                                {t('common.cancel') || 'Vazgeç'}
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setDeletingId(a.id)}
                                            style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </td>

                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminCityAliases;
