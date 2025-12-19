import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../lib/supabase';
import { usePageTitle } from '../hooks/usePageTitle';
import './AdminConfig.css';

const AdminUsers = () => {
    const navigate = useNavigate();
    const { t, language } = useLanguage();
    usePageTitle(t('adminPanel.users.title', 'Kullanıcı Yönetimi'));
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [editingUser, setEditingUser] = useState(null);
    const [isCreating, setIsCreating] = useState(false);

    // Search & Pagination State
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const PAGE_SIZE = 20;

    // Bulk Selection State
    const [selectedUsers, setSelectedUsers] = useState([]);

    const [formData, setFormData] = useState({
        email: '',
        full_name: '',
        role: 'couple',
        password: ''
    });

    // Custom Modal State
    const [deleteModal, setDeleteModal] = useState({
        show: false,
        userId: null,
        userEmail: null,
        isBulk: false
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers();
        }, 300);
        return () => clearTimeout(timer);
    }, [filter, searchTerm, page, language]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('profiles')
                .select('*', { count: 'exact' })
                .order('created_at', { ascending: false });

            if (filter !== 'all') {
                query = query.eq('role', filter);
            }

            if (searchTerm) {
                query = query.or(`email.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`);
            }

            const from = (page - 1) * PAGE_SIZE;
            const to = from + PAGE_SIZE - 1;
            query = query.range(from, to);

            const { data, count, error } = await query;

            if (error) throw error;
            setUsers(data || []);
            setTotalCount(count || 0);
            setSelectedUsers([]);
        } catch (error) {
            console.error('Error fetching users:', error);
            alert(t('adminPanel.users.messages.fetchError', 'Kullanıcılar yüklenirken hata oluştu: ') + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allUserIds = users.map(u => u.id);
            setSelectedUsers(allUserIds);
        } else {
            setSelectedUsers([]);
        }
    };

    const handleSelectUser = (userId) => {
        if (selectedUsers.includes(userId)) {
            setSelectedUsers(selectedUsers.filter(id => id !== userId));
        } else {
            setSelectedUsers([...selectedUsers, userId]);
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            email: user.email || '',
            full_name: user.full_name || '',
            role: user.role || 'couple',
            password: ''
        });
        setIsCreating(false);
    };

    const handleCreate = () => {
        setEditingUser(null);
        setFormData({
            email: '',
            full_name: '',
            role: 'couple',
            password: ''
        });
        setIsCreating(true);
    };

    const handleSave = async () => {
        try {
            if (!editingUser && !isCreating) return;

            if (isCreating) {
                const { data: newUser, error: createError } = await supabase.auth.signUp({
                    email: formData.email,
                    password: formData.password,
                    options: {
                        data: {
                            full_name: formData.full_name,
                            role: formData.role
                        }
                    }
                });

                if (createError) throw createError;
                alert(t('adminPanel.users.messages.successCreate', 'Yeni kullanıcı başarıyla oluşturuldu!'));
            } else {
                const updateData = {
                    full_name: formData.full_name,
                    role: formData.role,
                    email: formData.email
                };

                const { error } = await supabase
                    .from('profiles')
                    .update(updateData)
                    .eq('id', editingUser.id);

                if (error) throw error;

                if (formData.password && formData.password.trim() !== '') {
                    const { error: pwdError } = await supabase
                        .rpc('admin_set_user_password', {
                            target_user_id: editingUser.id,
                            new_password: formData.password.trim()
                        });

                    if (pwdError) {
                        alert(t('adminPanel.users.messages.passwordUpdateError', 'Profil güncellendi ancak şifre değiştirilemedi: ') + pwdError.message);
                    }
                }

                alert(t('adminPanel.users.messages.successUpdate', 'Kullanıcı başarıyla güncellendi!'));
            }

            setEditingUser(null);
            setIsCreating(false);
            fetchUsers();
        } catch (error) {
            console.error('Save error:', error);
            alert(t('adminPanel.users.messages.saveError', 'Kaydetme hatası: ') + error.message);
        }
    };

    const handleDeleteClick = (userId, userEmail) => {
        setDeleteModal({ show: true, userId, userEmail, isBulk: false });
    };

    const handleBulkDeleteClick = () => {
        if (selectedUsers.length === 0) return;
        setDeleteModal({
            show: true,
            userId: null,
            userEmail: `${selectedUsers.length} ${t('adminPanel.users.table.users', 'kullanıcı')}`,
            isBulk: true
        });
    };

    const confirmDelete = async () => {
        const { userId, isBulk } = deleteModal;
        setDeleteModal({ show: false, userId: null, userEmail: null, isBulk: false });
        setLoading(true);

        try {
            if (isBulk) {
                const deletePromises = selectedUsers.map(id =>
                    supabase.rpc('admin_delete_user', { target_user_id: id })
                );

                const results = await Promise.all(deletePromises);
                const errors = results.filter(r => r.error);

                if (errors.length > 0) {
                    alert(t('adminPanel.users.messages.bulkDeletePartialSuccess', 'İşlem tamamlandı ancak bazı kullanıcılar silinemedi.'));
                } else {
                    alert(t('adminPanel.users.messages.successDelete', 'Seçilen tüm kullanıcılar başarıyla silindi!'));
                }
                setSelectedUsers([]);
            } else {
                if (!userId) return;
                const { error } = await supabase.rpc('admin_delete_user', { target_user_id: userId });
                if (error) throw error;
                alert(t('adminPanel.users.messages.successDelete', 'Kullanıcı başarıyla silindi!'));
            }
            fetchUsers();
        } catch (error) {
            console.error('Delete error:', error);
            alert(t('adminPanel.users.messages.deleteError', 'Silme hatası: ') + error.message);
        } finally {
            setLoading(false);
        }
    };

    const cancelDelete = () => setDeleteModal({ show: false, userId: null, userEmail: null, isBulk: false });
    const handleCancel = () => { setEditingUser(null); setIsCreating(false); };

    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    if (loading && !users.length) {
        return (
            <div className="section container" style={{ marginTop: '100px', textAlign: 'center' }}>
                <div className="loading-spinner"></div>
                <p style={{ marginTop: '10px', color: '#666' }}>{t('common.loading', 'Yükleniyor...')}</p>
            </div>
        );
    }

    if (isCreating || editingUser) {
        return (
            <div className="section container" style={{ maxWidth: '800px', marginTop: '40px' }}>
                <div className="admin-card">
                    <h2>{isCreating ? t('adminPanel.users.actions.addNew') : t('adminPanel.users.actions.edit')}</h2>
                    <div className="form-group" style={{ marginBottom: '20px' }}>
                        <label>{t('adminPanel.users.table.email')}</label>
                        <input
                            type="email"
                            className="form-control"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            disabled={!isCreating}
                            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                    </div>
                    <div className="form-group" style={{ marginBottom: '20px' }}>
                        <label>{t('adminPanel.users.table.name')}</label>
                        <input
                            type="text"
                            className="form-control"
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                    </div>
                    <div className="form-group" style={{ marginBottom: '20px' }}>
                        <label>{t('adminPanel.users.table.role')}</label>
                        <select
                            className="form-control"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                        >
                            <option value="couple">{t('adminPanel.users.roles.couple')}</option>
                            <option value="vendor">{t('adminPanel.users.roles.vendor')}</option>
                            <option value="admin">{t('adminPanel.users.roles.admin')}</option>
                        </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: '20px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                        <label style={{ color: '#dc2626', fontWeight: 'bold' }}>{t('adminPanel.users.passwordLabel', 'Yeni Şifre Belirle')}</label>
                        <input
                            type="text"
                            className="form-control"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder={t('adminPanel.users.passwordPlaceholder', 'Şifre yazın...')}
                            style={{ width: '100%', padding: '10px', border: '1px solid #dc2626', borderRadius: '4px', backgroundColor: '#fff5f5' }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
                        <button onClick={handleSave} className="btn btn-primary">{t('common.save')}</button>
                        <button onClick={handleCancel} className="btn btn-secondary">{t('common.cancel')}</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="section container admin-users-container">
            {deleteModal.show && (
                <div className="admin-modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', zIndex: 9999
                }}>
                    <div className="admin-modal-content" style={{
                        backgroundColor: 'white', padding: '30px', borderRadius: '8px',
                        maxWidth: '500px', width: '90%'
                    }}>
                        <h3 style={{ color: '#dc2626' }}>⚠️ {t('adminPanel.users.messages.confirmDelete')}</h3>
                        <p><strong>{deleteModal.userEmail}</strong> {t('adminPanel.users.messages.deleteWarning')}</p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                            <button onClick={cancelDelete} className="btn btn-secondary">{t('common.cancel')}</button>
                            <button onClick={confirmDelete} className="btn btn-danger" style={{ backgroundColor: '#dc2626', color: 'white' }}>{t('common.yesDelete', 'Evet, Sil')}</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                    <h1>{t('adminPanel.users.title')}</h1>
                    <p>{t('adminPanel.users.subtitle')}</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={handleCreate} className="btn btn-primary">➕ {t('adminPanel.users.actions.addNew')}</button>
                    {selectedUsers.length > 0 && (
                        <button onClick={handleBulkDeleteClick} className="btn btn-danger" style={{ backgroundColor: '#dc2626', color: 'white' }}>
                            🗑️ {t('adminPanel.users.actions.bulkDelete')} ({selectedUsers.length})
                        </button>
                    )}
                </div>
            </div>

            <div className="admin-card" style={{ marginBottom: '20px', padding: '15px' }}>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div className="filter-tabs" style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => setFilter('all')} className={`filter-btn ${filter === 'all' ? 'active' : ''}`} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #ddd', cursor: 'pointer', background: filter === 'all' ? '#2563eb' : '#fff', color: filter === 'all' ? '#fff' : '#000' }}>{t('common.all', 'Tümü')}</button>
                        <button onClick={() => setFilter('couple')} className={`filter-btn ${filter === 'couple' ? 'active' : ''}`} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #ddd', cursor: 'pointer', background: filter === 'couple' ? '#2563eb' : '#fff', color: filter === 'couple' ? '#fff' : '#000' }}>{t('adminPanel.users.roles.couple')}</button>
                        <button onClick={() => setFilter('vendor')} className={`filter-btn ${filter === 'vendor' ? 'active' : ''}`} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #ddd', cursor: 'pointer', background: filter === 'vendor' ? '#2563eb' : '#fff', color: filter === 'vendor' ? '#fff' : '#000' }}>{t('adminPanel.users.roles.vendor')}</button>
                        <button onClick={() => setFilter('admin')} className={`filter-btn ${filter === 'admin' ? 'active' : ''}`} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #ddd', cursor: 'pointer', background: filter === 'admin' ? '#2563eb' : '#fff', color: filter === 'admin' ? '#fff' : '#000' }}>{t('adminPanel.users.roles.admin')}</button>
                    </div>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <input
                            type="text"
                            placeholder={t('common.search', 'Ara...')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd' }}
                        />
                    </div>
                </div>
            </div>

            <div className="admin-card">
                <div className="table-responsive">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                                <th style={{ padding: '12px' }}><input type="checkbox" onChange={handleSelectAll} checked={users.length > 0 && selectedUsers.length === users.length} /></th>
                                <th style={{ padding: '12px' }}>{t('adminPanel.users.table.email')}</th>
                                <th style={{ padding: '12px' }}>{t('adminPanel.users.table.name')}</th>
                                <th style={{ padding: '12px' }}>{t('adminPanel.users.table.role')}</th>
                                <th style={{ padding: '12px' }}>{t('adminPanel.users.table.date')}</th>
                                <th style={{ padding: '12px' }}>{t('adminPanel.users.table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '12px' }}><input type="checkbox" checked={selectedUsers.includes(user.id)} onChange={() => handleSelectUser(user.id)} /></td>
                                    <td style={{ padding: '12px' }}>{user.email}</td>
                                    <td style={{ padding: '12px' }}>{user.full_name}</td>
                                    <td style={{ padding: '12px' }}>
                                        <span className={`badge role-${user.role}`} style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '11px', background: '#f0f4f8' }}>
                                            {t(`adminPanel.users.roles.${user.role}`)}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px' }}>{new Date(user.created_at).toLocaleDateString(language)}</td>
                                    <td style={{ padding: '12px' }}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => handleEdit(user)} className="action-btn" title={t('adminPanel.users.actions.edit')}>✏️</button>
                                            <button onClick={() => handleDeleteClick(user.id, user.email)} className="action-btn" title={t('adminPanel.users.actions.delete')}>🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px', padding: '20px' }}>
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>{t('common.prev', 'Geri')}</button>
                        <span>{page} / {totalPages}</span>
                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>{t('common.next', 'İleri')}</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminUsers;
