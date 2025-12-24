import React, { useState } from 'react';
import { usePlanning } from '../context/PlanningContext';
import { useLanguage } from '../context/LanguageContext';
import usePageTitle from '../hooks/usePageTitle';
import './BudgetPlanner.css';

const BudgetPlanner = () => {
    usePageTitle('Budget Planner');
    const { t } = useLanguage();
    const { budget, setBudget, budgetItems, addBudgetItem, updateBudgetItem, removeBudgetItem, loading, refreshData } = usePlanning();
    const [newCategory, setNewCategory] = useState('');
    const [newEstimated, setNewEstimated] = useState('');
    const [newNotes, setNewNotes] = useState('');
    const [activeAction, setActiveAction] = useState(null); // { id, type: 'payment' | 'delete' }
    const [paymentAmount, setPaymentAmount] = useState('');
    const [error, setError] = useState('');

    React.useEffect(() => {
        refreshData();
    }, []);

    if (loading) {
        return (
            <div className="section container" style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    // Varsayılan bütçe kalemleri
    // Varsayılan bütçe kalemleri
    const defaultCategories = [
        { key: 'venue', name: t('budget.categories.venue') || 'Düğün Mekânı', icon: '🏛️' },
        { key: 'food', name: t('budget.categories.food') || 'Yemek & İçecek', icon: '🍽️' },
        { key: 'photo', name: t('budget.categories.photo') || 'Fotoğraf & Video', icon: '📸' },
        { key: 'dress', name: t('budget.categories.dress') || 'Gelinlik & Damatlık', icon: '👗' },
        { key: 'music', name: t('budget.categories.music') || 'Müzik & DJ', icon: '🎵' },
        { key: 'flowers', name: t('budget.categories.flowers') || 'Çiçek Süsleme', icon: '💐' },
        { key: 'invite', name: t('budget.categories.invite') || 'Davetiye', icon: '💌' },
        { key: 'cake', name: t('budget.categories.cake') || 'Düğün Pastası', icon: '🎂' },
        { key: 'transport', name: t('budget.categories.transport') || 'Ulaşım', icon: '🚗' },
        { key: 'honeymoon', name: t('budget.categories.honeymoon') || 'Balayı', icon: '✈️' },
        { key: 'other', name: t('budget.categories.other') || 'Diğer', icon: '📦' }
    ];

    const totalEstimated = budgetItems.reduce((acc, item) => acc + (item.estimated || 0), 0);
    const totalActual = budgetItems.reduce((acc, item) => acc + (item.actual || 0), 0);
    const remaining = (budget || 0) - totalActual;

    const handleAddItem = (e) => {
        e.preventDefault();
        setError('');

        if (!newCategory.trim()) {
            setError(t('budget.errors.category') || 'Lütfen bir kategori adı girin.');
            return;
        }
        if (!newEstimated || parseFloat(newEstimated) <= 0) {
            setError(t('budget.errors.amount') || 'Lütfen geçerli bir tahmini tutar girin.');
            return;
        }

        addBudgetItem({
            category: newCategory,
            estimated: parseFloat(newEstimated),
            actual: 0,
            notes: newNotes,
            payments: []
        });

        setNewCategory('');
        setNewEstimated('');
        setNewNotes('');
    };

    const handlePayment = (itemId, amount) => {
        const item = budgetItems.find(i => i.id === itemId);
        if (!item) return;

        updateBudgetItem(itemId, {
            actual: item.actual + parseFloat(amount),
            payments: [...(item.payments || []), {
                amount: parseFloat(amount),
                date: new Date().toISOString(),
                id: Date.now()
            }]
        });
    };

    return (
        <div className="section container budget-container">
            <h2 className="budget-header">💰 {t('budget.title') || 'Bütçem'}</h2>
            <p className="budget-desc">
                {t('budget.desc') || 'Toplam düğün bütçenizi belirleyin, harcama kalemlerini yönetin ve ödemelerinizi takip edin.'}
            </p>

            {/* Toplam Bütçe */}
            <div className="total-budget-card">
                <label htmlFor="total-budget" className="total-budget-label">
                    {t('budget.totalLabel') || 'Toplam Düğün Bütçeniz (€)'}
                </label>
                <input
                    id="total-budget"
                    type="number"
                    value={budget || ''}
                    onChange={(e) => setBudget(parseFloat(e.target.value) || 0)}
                    placeholder={t('budget.totalPlaceholder') || 'Örn: 20000'}
                    className="total-budget-input"
                    aria-label={t('budget.totalLabel')}
                    min="0"
                />
            </div>

            {/* Özet Kartlar */}
            <div className="summary-grid" role="region" aria-label={t('budget.summaryTotal')}>
                <div className="summary-card summary-card-total">
                    <div className="summary-label">{t('budget.summaryTotal') || 'Toplam Bütçe'}</div>
                    <div className="summary-value">€{budget || 0}</div>
                </div>

                <div className="summary-card summary-card-estimated">
                    <div className="summary-label">{t('budget.summaryEstimated') || 'Planlanan'}</div>
                    <div className="summary-value">€{totalEstimated}</div>
                </div>

                <div className="summary-card summary-card-actual">
                    <div className="summary-label">{t('budget.summaryActual') || 'Harcanan'}</div>
                    <div className="summary-value">€{totalActual}</div>
                </div>

                <div className={`summary-card ${remaining >= 0 ? 'summary-card-remaining-positive' : 'summary-card-remaining-negative'}`}>
                    <div className="summary-label">{t('budget.summaryRemaining') || 'Kalan'}</div>
                    <div className="summary-value">€{remaining}</div>
                </div>
            </div>

            {/* Yeni Kalem Ekleme */}
            <div className="add-item-card">
                <h3 className="add-item-title">{t('budget.addItemTitle') || 'Yeni Harcama Kalemi Ekle'}</h3>
                <form onSubmit={handleAddItem} className="add-item-form">
                    <div className="form-group">
                        <input
                            type="text"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            placeholder={t('budget.categoryPlaceholder') || 'Kategori adı...'}
                            list="categories"
                            className="add-item-input-category"
                            aria-label={t('budget.categoryPlaceholder')}
                            aria-invalid={error && !newCategory.trim() ? "true" : "false"}
                        />
                        <datalist id="categories">
                            {defaultCategories.map(cat => (
                                <option key={cat.key} value={cat.key}>{cat.name}</option>
                            ))}
                        </datalist>
                    </div>

                    <div className="form-group">
                        <input
                            type="text"
                            value={newNotes}
                            onChange={(e) => setNewNotes(e.target.value)}
                            placeholder={t('budget.notesPlaceholder') || 'Açıklama (Opsiyonel)'}
                            className="add-item-input-notes"
                            style={{ flex: 1, padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '1rem' }}
                        />
                    </div>

                    <div className="form-group">
                        <input
                            type="number"
                            value={newEstimated}
                            onChange={(e) => setNewEstimated(e.target.value)}
                            placeholder={t('budget.amountPlaceholder') || 'Tahmini tutar (€)'}
                            className="add-item-input-amount"
                            aria-label={t('budget.amountPlaceholder')}
                            min="0"
                            step="0.01"
                            aria-invalid={error && (!newEstimated || parseFloat(newEstimated) <= 0) ? "true" : "false"}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary add-item-btn"
                        aria-label={t('budget.addBtn')}
                    >
                        + {t('budget.addBtn') || 'Ekle'}
                    </button>
                </form>
                {error && <div className="error-message" role="alert">{error}</div>}
            </div>

            {/* Bütçe Kalemleri */}
            <div className="budget-table-container">
                <table className="budget-table" aria-label={t('budget.title')}>
                    <thead className="budget-table-head">
                        <tr>
                            <th className="budget-table-th budget-table-th-left">{t('budget.tableCategory') || 'Kategori'}</th>
                            <th className="budget-table-th budget-table-th-left">{t('budget.tableNotes') || 'Açıklama'}</th>
                            <th className="budget-table-th budget-table-th-right">{t('budget.tableEstimated') || 'Planlanan'}</th>
                            <th className="budget-table-th budget-table-th-right">{t('budget.tableActual') || 'Harcanan'}</th>
                            <th className="budget-table-th budget-table-th-right">{t('budget.tableDiff') || 'Fark'}</th>
                            <th className="budget-table-th budget-table-th-center">{t('budget.tableAction') || 'İşlem'}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {budgetItems.map(item => {
                            const diff = item.actual - item.estimated;
                            const isPaymentActive = activeAction?.id === item.id && activeAction?.type === 'payment';
                            const isDeleteActive = activeAction?.id === item.id && activeAction?.type === 'delete';

                            return (
                                <tr key={item.id} className="budget-table-row">
                                    <td className="budget-table-td budget-table-td-category">
                                        {(() => {
                                            // Check if this is a predefined category key
                                            const predefinedKeys = ['venue', 'food', 'photo', 'dress', 'music', 'flowers', 'invite', 'cake', 'transport', 'honeymoon', 'other', 'catering', 'photography', 'decoration', 'invitation'];
                                            const categoryKey = item.category.toLowerCase();

                                            if (predefinedKeys.includes(categoryKey)) {
                                                return t(`budget.categories.${categoryKey}`) || item.category;
                                            }
                                            // For custom categories, display as-is
                                            return item.category;
                                        })()}
                                    </td>
                                    <td className="budget-table-td">
                                        <input
                                            type="text"
                                            value={item.notes || ''}
                                            onChange={(e) => updateBudgetItem(item.id, { notes: e.target.value })}
                                            placeholder="-"
                                            style={{ width: '100%', padding: '8px', border: '1px solid transparent', background: 'transparent', borderRadius: '4px' }}
                                            onFocus={(e) => e.target.style.border = '1px solid #e2e8f0'}
                                            onBlur={(e) => e.target.style.border = '1px solid transparent'}
                                        />
                                    </td>
                                    <td className="budget-table-td budget-table-td-right">€{item.estimated}</td>
                                    <td className="budget-table-td budget-table-td-right budget-table-td-actual">€{item.actual}</td>
                                    <td className={`budget-table-td budget-table-td-right budget-table-td-diff ${diff > 0 ? 'diff-positive' : diff < 0 ? 'diff-negative' : 'diff-neutral'}`}>
                                        {diff > 0 ? '+' : ''}€{diff}
                                    </td>
                                    <td className="budget-table-td budget-table-td-actions">
                                        {isPaymentActive ? (
                                            <>
                                                <input
                                                    type="number"
                                                    value={paymentAmount}
                                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                                    placeholder="€"
                                                    className="action-input"
                                                    autoFocus
                                                />
                                                <button
                                                    onClick={() => {
                                                        if (paymentAmount && !isNaN(paymentAmount) && parseFloat(paymentAmount) > 0) {
                                                            handlePayment(item.id, paymentAmount);
                                                            setActiveAction(null);
                                                            setPaymentAmount('');
                                                        }
                                                    }}
                                                    className="confirm-btn"
                                                >
                                                    ✓
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setActiveAction(null);
                                                        setPaymentAmount('');
                                                    }}
                                                    className="cancel-btn"
                                                >
                                                    ✕
                                                </button>
                                            </>
                                        ) : isDeleteActive ? (
                                            <>
                                                <span style={{ fontSize: '0.8rem', marginRight: '5px', color: '#ef4444' }}>
                                                    {t('common.delete_confirm') || 'Emin misiniz?'}
                                                </span>
                                                <button
                                                    onClick={() => {
                                                        removeBudgetItem(item.id);
                                                        setActiveAction(null);
                                                    }}
                                                    className="confirm-btn"
                                                    style={{ background: '#ef4444' }}
                                                >
                                                    {t('common.yes') || 'Evet'}
                                                </button>
                                                <button
                                                    onClick={() => setActiveAction(null)}
                                                    className="cancel-btn"
                                                >
                                                    {t('common.no') || 'Hayır'}
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setActiveAction({ id: item.id, type: 'payment' });
                                                        setPaymentAmount('');
                                                    }}
                                                    className="payment-btn"
                                                    aria-label={`${t('budget.paymentBtn')} ${item.category}`}
                                                >
                                                    💳 {t('budget.paymentBtn') || 'Ödeme'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveAction({ id: item.id, type: 'delete' })}
                                                    className="delete-btn"
                                                    aria-label={`${t('common.delete')} ${item.category}`}
                                                >
                                                    🗑️ Sil
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {budgetItems.length === 0 && (
                <div className="empty-state">
                    <p className="empty-icon">💰</p>
                    <p>{t('budget.emptyState') || 'Henüz bütçe kalemi eklenmedi.'}</p>
                </div>
            )}
        </div>
    );
};

export default BudgetPlanner;
