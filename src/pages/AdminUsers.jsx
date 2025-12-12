import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { usePageTitle } from '../hooks/usePageTitle';
import './AdminConfig.css';

const AdminUsers = () => {
    usePageTitle('Kullanıcı Yönetimi');
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
        // Debounce search to avoid too many requests
        const timer = setTimeout(() => {
            fetchUsers();
        }, 300);
        return () => clearTimeout(timer);
    }, [filter, searchTerm, page]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('profiles')
                .select('*', { count: 'exact' })
                .order('created_at', { ascending: false });

            // Apply Role Filter
            if (filter !== 'all') {
                query = query.eq('role', filter);
            }

            // Apply Search Filter
            if (searchTerm) {
                query = query.or(`email.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`);
            }

            // Apply Pagination
            const from = (page - 1) * PAGE_SIZE;
            const to = from + PAGE_SIZE - 1;
            query = query.range(from, to);

            const { data, count, error } = await query;

            if (error) throw error;
            setUsers(data || []);
            setTotalCount(count || 0);
            setSelectedUsers([]); // Reset selection on refresh
        } catch (error) {
            console.error('Error fetching users:', error);
            alert('Kullanıcılar yüklenirken hata oluştu: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // --- Bulk Selection Logic ---
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
    // ---------------------------

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
            if (!editingUser) {
                alert('Hata: Düzenlenecek kullanıcı bulunamadı');
                return;
            }

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

            // Handle Password Update if provided
            if (formData.password && formData.password.trim() !== '') {
                console.log('Updating password for user:', editingUser.id);
                const { data: pwdData, error: pwdError } = await supabase
                    .rpc('admin_set_user_password', {
                        target_user_id: editingUser.id,
                        new_password: formData.password.trim()
                    });

                if (pwdError) {
                    console.error('Password update error:', pwdError);
                    alert('⚠️ Profil güncellendi ancak şifre değiştirilemedi: ' + pwdError.message);
                } else if (pwdData && !pwdData.success) {
                    alert('⚠️ Profil güncellendi ancak şifre hatası: ' + pwdData.error);
                } else {
                    console.log('Password updated successfully');
                }
            }

            alert('✅ Kullanıcı başarıyla güncellendi!');
            setEditingUser(null);
            setIsCreating(false);
            fetchUsers();
        } catch (error) {
            console.error('Save error:', error);
            alert('Kaydetme hatası: ' + error.message);
        }
    };

    // Trigger single delete
    const handleDeleteClick = (userId, userEmail) => {
        setDeleteModal({ show: true, userId, userEmail, isBulk: false });
    };

    // Trigger bulk delete
    const handleBulkDeleteClick = () => {
        if (selectedUsers.length === 0) return;
        setDeleteModal({
            show: true,
            userId: null,
            userEmail: `${selectedUsers.length} kullanıcı`,
            isBulk: true
        });
    };

    // Actual delete logic (Handles both Single and Bulk)
    const confirmDelete = async () => {
        const { userId, isBulk } = deleteModal;

        // Close modal and show loading
        setDeleteModal({ show: false, userId: null, userEmail: null, isBulk: false });
        setLoading(true);

        try {
            if (isBulk) {
                console.log('🔄 Starting BULK deletion for', selectedUsers.length, 'users');

                // Delete users one by one (or in parallel)
                const deletePromises = selectedUsers.map(id =>
                    supabase.rpc('admin_delete_user', { target_user_id: id })
                );

                const results = await Promise.all(deletePromises);

                // Check for errors
                const errors = results.filter(r => r.error || (r.data && r.data.success === false));

                if (errors.length > 0) {
                    console.error('Some deletions failed:', errors);
                    alert(`⚠️ İşlem tamamlandı ancak ${errors.length} kullanıcı silinemedi.`);
                } else {
                    alert('✅ Seçilen tüm kullanıcılar başarıyla silindi!');
                }
                setSelectedUsers([]); // Clear selection

            } else {
                // Single Delete
                if (!userId) return;
                console.log('🔄 Starting FORCE deletion for user:', userId);

                const { data, error } = await supabase
                    .rpc('admin_delete_user', { target_user_id: userId });

                if (error) throw error;
                if (data && data.success === false) throw new Error(data.error || 'Bilinmeyen hata');

                alert('✅ Kullanıcı başarıyla silindi!');
            }

            fetchUsers();
        } catch (error) {
            console.error('❌ Delete error:', error);
            alert('❌ Silme hatası:\n' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const cancelDelete = () => {
        setDeleteModal({ show: false, userId: null, userEmail: null, isBulk: false });
    };

    const handleCancel = () => {
        setEditingUser(null);
        setIsCreating(false);
    };

    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    if (loading && !users.length) {
        return (
            <div className="section container" style={{ marginTop: '100px', textAlign: 'center' }}>
                <div className="loading-spinner"></div>
                <p style={{ marginTop: '10px', color: '#666' }}>İşlem yapılıyor...</p>
            </div>
        );
    }

    // Edit/Create Form
    if (isCreating || editingUser) {
        return (
            <div className="section container" style={{ maxWidth: '800px', marginTop: '40px' }}>
                <div className="admin-card">
                    <h2>{isCreating ? 'Yeni Kullanıcı Ekle' : 'Kullanıcı Düzenle'}</h2>
                    <div className="form-group" style={{ marginBottom: '20px' }}>
                        <label>E-posta</label>
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
                        <label>İsim</label>
                        <input
                            type="text"
                            className="form-control"
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                    </div>
                    <div className="form-group" style={{ marginBottom: '20px' }}>
                        <label>Rol</label>
                        <select
                            className="form-control"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                        >
                            <option value="couple">💑 Çift</option>
                            <option value="vendor">🏢 Tedarikçi</option>
                            <option value="admin">👑 Admin</option>
                        </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: '20px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                        <label style={{ color: '#dc2626', fontWeight: 'bold' }}>Yeni Şifre Belirle (İsteğe Bağlı)</label>
                        <p style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
                            Buraya bir şifre yazarsanız, kullanıcının mevcut şifresi <strong>kalıcı olarak değişecektir</strong>.
                            Boş bırakırsanız şifre değişmez.
                        </p>
                        <input
                            type="text"
                            className="form-control"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="Yeni şifreyi buraya yazın..."
                            style={{ width: '100%', padding: '10px', border: '1px solid #dc2626', borderRadius: '4px', backgroundColor: '#fff5f5' }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
                        <button onClick={handleSave} className="btn btn-primary" style={{ padding: '10px 24px' }}>💾 Kaydet</button>
                        <button onClick={handleCancel} className="btn btn-secondary" style={{ padding: '10px 24px' }}>❌ İptal</button>
                    </div>
                </div>
            </div>
        );
    }

    // List View
    return (
        <div className="section container admin-users-container">
            {/* DELETE CONFIRMATION MODAL */}
            {deleteModal.show && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '30px',
                        borderRadius: '8px',
                        maxWidth: '500px',
                        width: '90%',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                    }}>
                        <h3 style={{ marginTop: 0, color: '#dc2626', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            ⚠️ {deleteModal.isBulk ? 'Toplu Silme İşlemi' : 'Kullanıcı Silinecek'}
                        </h3>
                        <p style={{ fontSize: '16px', lineHeight: '1.5', margin: '20px 0' }}>
                            <strong>{deleteModal.userEmail}</strong> silmek üzeresiniz.
                        </p>
                        <div style={{ backgroundColor: '#fee2e2', padding: '15px', borderRadius: '6px', color: '#991b1b', fontSize: '14px', marginBottom: '20px' }}>
                            <strong>Dikkat:</strong> Bu işlem geri alınamaz! İlgili tüm veriler kalıcı olarak silinecektir.
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button
                                onClick={cancelDelete}
                                style={{
                                    padding: '10px 20px',
                                    border: '1px solid #ddd',
                                    background: 'white',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                İptal
                            </button>
                            <button
                                onClick={confirmDelete}
                                style={{
                                    padding: '10px 20px',
                                    background: '#dc2626',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    fontSize: '14px'
                                }}
                            >
                                Evet, Sil
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="admin-header" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>Kullanıcı Yönetimi</h1>
                    <p>Sistemdeki tüm kullanıcıları görüntüleyin ve yönetin</p>
                </div>

                {/* BULK DELETE BUTTON */}
                {selectedUsers.length > 0 && (
                    <button
                        onClick={handleBulkDeleteClick}
                        style={{
                            backgroundColor: '#dc2626',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: '0 2px 4px rgba(220, 38, 38, 0.3)'
                        }}
                    >
                        🗑️ Seçilenleri Sil ({selectedUsers.length})
                    </button>
                )}
            </div>

            {/* Filters & Search - NEW Flex Container */}
            <div style={{
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: '20px',
                marginBottom: '20px',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#fff',
                padding: '15px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
                <div className="filter-tabs">
                    <button onClick={() => { setFilter('all'); setPage(1); }} style={{ padding: '8px 16px', marginRight: '8px', border: '1px solid #e5e7eb', background: filter === 'all' ? '#2563eb' : '#fff', color: filter === 'all' ? '#fff' : '#374151', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s' }}>📋 Tümü</button>
                    <button onClick={() => { setFilter('couple'); setPage(1); }} style={{ padding: '8px 16px', marginRight: '8px', border: '1px solid #e5e7eb', background: filter === 'couple' ? '#2563eb' : '#fff', color: filter === 'couple' ? '#fff' : '#374151', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s' }}>💑 Çiftler</button>
                    <button onClick={() => { setFilter('vendor'); setPage(1); }} style={{ padding: '8px 16px', marginRight: '8px', border: '1px solid #e5e7eb', background: filter === 'vendor' ? '#2563eb' : '#fff', color: filter === 'vendor' ? '#fff' : '#374151', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s' }}>🏢 Tedarikçiler</button>
                    <button onClick={() => { setFilter('admin'); setPage(1); }} style={{ padding: '8px 16px', border: '1px solid #e5e7eb', background: filter === 'admin' ? '#2563eb' : '#fff', color: filter === 'admin' ? '#fff' : '#374151', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s' }}>👑 Adminler</button>
                </div>

                {/* SEARCH BAR */}
                <div style={{ flex: '1', minWidth: '250px', maxWidth: '400px' }}>
                    <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px' }}>🔍</span>
                        <input
                            type="text"
                            placeholder="Kullanıcı ara (isim veya e-posta)..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setPage(1); // Reset to page 1 on search
                            }}
                            style={{
                                width: '100%',
                                padding: '10px 10px 10px 40px',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '14px',
                                outline: 'none'
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Users Table */}
            {users.length === 0 ? (
                <div className="empty-state" style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '8px', border: '1px solid #eee' }}>
                    <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔍</div>
                    <h3 style={{ margin: '0 0 10px 0', color: '#111827' }}>Kullanıcı bulunamadı</h3>
                    <p style={{ color: '#6b7280', margin: 0 }}>Aradığınız kriterlere uygun kullanıcı yok.</p>
                </div>
            ) : (
                <>
                    <div className="admin-card">
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #f3f4f6', textAlign: 'left' }}>
                                    <th style={{ padding: '16px', width: '40px' }}>
                                        <input
                                            type="checkbox"
                                            onChange={handleSelectAll}
                                            checked={users.length > 0 && selectedUsers.length === users.length}
                                            style={{ transform: 'scale(1.2)', cursor: 'pointer' }}
                                        />
                                    </th>
                                    <th style={{ padding: '16px', color: '#4b5563', fontWeight: '600', fontSize: '13px' }}>E-POSTA</th>
                                    <th style={{ padding: '16px', color: '#4b5563', fontWeight: '600', fontSize: '13px' }}>İSİM</th>
                                    <th style={{ padding: '16px', color: '#4b5563', fontWeight: '600', fontSize: '13px' }}>ROL</th>
                                    <th style={{ padding: '16px', color: '#4b5563', fontWeight: '600', fontSize: '13px' }}>KAYIT TARİHİ</th>
                                    <th style={{ padding: '16px', color: '#4b5563', fontWeight: '600', fontSize: '13px' }}>İŞLEMLER</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id} style={{ borderBottom: '1px solid #f3f4f6', backgroundColor: selectedUsers.includes(user.id) ? '#eff6ff' : 'transparent', transition: 'background-color 0.1s' }}>
                                        <td style={{ padding: '16px' }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedUsers.includes(user.id)}
                                                onChange={() => handleSelectUser(user.id)}
                                                style={{ transform: 'scale(1.2)', cursor: 'pointer' }}
                                            />
                                        </td>
                                        <td style={{ padding: '16px', fontSize: '14px', color: '#111827' }}>{user.email || 'Bilinmiyor'}</td>
                                        <td style={{ padding: '16px', fontSize: '14px', color: '#111827' }}>{user.full_name || '-'}</td>
                                        <td style={{ padding: '16px' }}>
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: '12px',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                background: user.role === 'admin' ? '#fef3c7' : user.role === 'vendor' ? '#dbeafe' : '#f3e8ff',
                                                color: user.role === 'admin' ? '#92400e' : user.role === 'vendor' ? '#1e40af' : '#6b21a8'
                                            }}>
                                                {user.role === 'admin' ? '👑 Admin' : user.role === 'vendor' ? '🏢 Tedarikçi' : '💑 Çift'}
                                            </span>
                                            {user.is_bot && (
                                                <span style={{
                                                    marginLeft: '6px',
                                                    padding: '2px 8px',
                                                    borderRadius: '8px',
                                                    fontSize: '11px',
                                                    fontWeight: 'bold',
                                                    background: '#f3e8ff',
                                                    color: '#7c3aed'
                                                }}>
                                                    🤖 Bot
                                                </span>
                                            )}
                                        </td>
                                        <td style={{ padding: '16px', fontSize: '14px', color: '#6b7280' }}>
                                            {new Date(user.created_at).toLocaleDateString('tr-TR')}
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={() => handleEdit(user)}
                                                    style={{
                                                        padding: '6px 12px',
                                                        border: '1px solid #d1d5db',
                                                        background: '#fff',
                                                        color: '#374151',
                                                        cursor: 'pointer',
                                                        borderRadius: '6px',
                                                        fontSize: '13px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onMouseOver={(e) => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.color = '#2563eb'; }}
                                                    onMouseOut={(e) => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.color = '#374151'; }}
                                                >
                                                    ✏️ Düzenle
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(user.id, user.email)}
                                                    style={{
                                                        padding: '6px 12px',
                                                        border: '1px solid #d1d5db',
                                                        background: '#fff',
                                                        color: '#dc2626',
                                                        cursor: 'pointer',
                                                        borderRadius: '6px',
                                                        fontSize: '13px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onMouseOver={(e) => { e.currentTarget.style.borderColor = '#dc2626'; e.currentTarget.style.backgroundColor = '#fef2f2'; }}
                                                    onMouseOut={(e) => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.backgroundColor = '#fff'; }}
                                                >
                                                    🗑️ Sil
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px', gap: '15px' }}>
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                style={{
                                    padding: '8px 16px',
                                    border: '1px solid #d1d5db',
                                    background: page === 1 ? '#f3f4f6' : '#fff',
                                    color: page === 1 ? '#9ca3af' : '#374151',
                                    borderRadius: '6px',
                                    cursor: page === 1 ? 'not-allowed' : 'pointer'
                                }}
                            >
                                ← Önceki
                            </button>
                            <span style={{ fontSize: '14px', color: '#4b5563' }}>
                                Sayfa <strong>{page}</strong> / {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                style={{
                                    padding: '8px 16px',
                                    border: '1px solid #d1d5db',
                                    background: page === totalPages ? '#f3f4f6' : '#fff',
                                    color: page === totalPages ? '#9ca3af' : '#374151',
                                    borderRadius: '6px',
                                    cursor: page === totalPages ? 'not-allowed' : 'pointer'
                                }}
                            >
                                Sonraki →
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AdminUsers;
