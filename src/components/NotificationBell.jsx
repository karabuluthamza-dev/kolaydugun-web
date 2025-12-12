import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';
import './NotificationBell.css';

const NotificationBell = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isVendor, setIsVendor] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (user) {
            checkIfVendor();
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const checkIfVendor = async () => {
        try {
            const { data } = await supabase
                .from('vendors')
                .select('id')
                .eq('user_id', user.id)
                .single();
            setIsVendor(!!data);
        } catch (error) {
            setIsVendor(false);
        }
    };

    const fetchNotifications = async () => {
        if (!user) return;

        try {
            // Direct table query using wildcard to avoid missing column errors
            const { data, error } = await supabase
                .from('user_notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(10);

            if (error) {
                console.error('Error fetching notifications directly:', error);
                return;
            }

            // Map data structure similar to what Edge Function did + our fixes
            const transformed = (data || []).slice(0, 5).map(notif => {
                if (notif.type === 'new_message' || notif.type === 'new_quote') {
                    return {
                        ...notif,
                        notification: notif.notification || {
                            type: notif.type,
                            title: notif.type,
                            message: notif.message
                        }
                    };
                }
                return notif;
            });

            setNotifications(transformed);
            setUnreadCount(transformed.filter(n => !n.is_read).length);
        } catch (error) {
            console.error('Error in fetchNotifications:', error);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mark_notification_read`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session?.access_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ notification_id: notificationId })
            });

            setNotifications(prev =>
                prev.map(n =>
                    n.id === notificationId
                        ? { ...n, is_read: true }
                        : n
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'announcement': return '📢';
            case 'campaign': return '🎉';
            case 'system': return '🔔';
            case 'new_message': return '💬';
            case 'forum_comment': return '💬';
            case 'forum_like': return '❤️';
            // Admin notification types
            case 'admin_new_lead': return '📋';
            case 'admin_new_vendor': return '🏢';
            case 'admin_new_contact': return '✉️';
            case 'admin_forum_report': return '🚩';
            case 'admin_new_user': return '👤';
            default: return '📬';
        }
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const timeStr = timestamp.endsWith('Z') || timestamp.includes('+') ? timestamp : `${timestamp}Z`;
        const date = new Date(timeStr);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);

        if (diff < 60) return t('dashboard.justNow');
        if (diff < 3600) return `${Math.floor(diff / 60)} ${t('dashboard.minutesAgo')}`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} ${t('dashboard.hoursAgo')}`;
        if (diff < 604800) return `${Math.floor(diff / 86400)} ${t('dashboard.daysAgo')}`;
        return date.toLocaleDateString('tr-TR');
    };

    if (!user) return null;

    return (
        <div className="notification-bell-container" ref={dropdownRef}>
            <button
                className="notification-bell-button"
                onClick={() => setShowDropdown(!showDropdown)}
                aria-label={t('dashboard.notifications.title')}
            >
                🔔
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
            </button>

            {showDropdown && (
                <div className="notification-dropdown">
                    <div className="notification-dropdown-header">
                        <h3>📬 {t('dashboard.notifications.title')}</h3>
                        {unreadCount > 0 && (
                            <span className="unread-count">{unreadCount} {t('dashboard.notifications.unread')}</span>
                        )}
                    </div>

                    <div className="notification-list">
                        {notifications.length === 0 ? (
                            <div className="notification-empty">
                                {t('dashboard.notifications.empty')}
                            </div>
                        ) : (
                            notifications.map(item => {
                                const rawType = item.notification?.type || item.type;
                                const notifType = rawType || 'new_message';

                                // Helper to safely translate if content is JSON or Object
                                const getLocalizedContent = (content) => {
                                    try {
                                        if (!content) return '';
                                        if (typeof content === 'object') {
                                            if (content.key) return t(content.key, content.args);
                                            return '';
                                        }
                                        if (typeof content === 'string' && content.trim().startsWith('{')) {
                                            const parsed = JSON.parse(content);
                                            if (parsed.key) return t(parsed.key, parsed.args);
                                        }
                                    } catch (e) { }
                                    return content || '';
                                };

                                const notifTitle = getLocalizedContent(item.notification?.title || item.title) || 'Notification';
                                const rawMessage = item.notification?.message || item.message || '';
                                const [messagePart, embeddedId] = rawMessage.split('|||');
                                const notifMessage = getLocalizedContent(messagePart);

                                const isAdmin = user?.role === 'admin';
                                let linkTo = '/notifications';

                                if (notifType === 'new_message') {
                                    const conversationId = item.related_conversation_id || item.related_id || embeddedId;

                                    if (isAdmin) {
                                        linkTo = conversationId
                                            ? `/admin/messaging?conversation=${conversationId}`
                                            : '/admin/messaging';
                                    } else if (isVendor) {
                                        const isSupportMessage = notifTitle.includes('KolayDugun Destek') || notifTitle.includes('Support');
                                        const supportParam = isSupportMessage ? '&support=true' : '';
                                        linkTo = conversationId
                                            ? `/vendor/dashboard?tab=messages&conversation=${conversationId}${supportParam}`
                                            : '/vendor/dashboard?tab=messages';
                                    } else {
                                        linkTo = conversationId
                                            ? `/messages?conversation=${conversationId}`
                                            : '/messages';
                                    }
                                } else if (notifType === 'new_quote') {
                                    const leadId = item.related_lead_id || item.notification?.related_lead_id;
                                    linkTo = leadId ? `/vendor/dashboard?tab=leads&leadId=${leadId}` : '/vendor/dashboard?tab=leads';
                                } else if (notifType === 'contact_form' || (notifType === 'system' && notifTitle.includes('İletişim Mesajı'))) {
                                    linkTo = '/admin/leads';
                                } else if (notifType === 'forum_comment' || notifType === 'forum_like') {
                                    linkTo = item.deep_link || '/community';
                                }
                                // Admin notification types - use deep_link if available
                                else if (notifType === 'admin_new_lead') {
                                    linkTo = item.deep_link || '/admin/leads';
                                } else if (notifType === 'admin_new_vendor') {
                                    linkTo = item.deep_link || '/admin/vendors';
                                } else if (notifType === 'admin_new_contact') {
                                    linkTo = item.deep_link || '/admin/messages';
                                } else if (notifType === 'admin_forum_report') {
                                    linkTo = item.deep_link || '/admin/forum-moderation';
                                } else if (notifType === 'admin_new_user') {
                                    linkTo = item.deep_link || '/admin/users';
                                }

                                // Title Cleanup
                                let displayTitle = notifTitle;
                                // If title is literally 'new_message' or contains it, force translate
                                if (notifTitle.includes('new_message') || notifTitle === 'new_message') {
                                    displayTitle = t('dashboard.notifications.new_message_title') || 'Yeni Mesaj';
                                } else if (notifType === 'new_quote') {
                                    displayTitle = t('dashboard.notifications.new_quote_title') || 'Yeni Teklif';
                                }

                                return (
                                    <Link
                                        key={item.id}
                                        to={linkTo}
                                        className={`notification-item ${!item.is_read ? 'unread' : ''}`}
                                        onClick={() => {
                                            if (!item.is_read) markAsRead(item.id);
                                            setShowDropdown(false);
                                        }}
                                    >
                                        <div className="notification-icon">
                                            {getNotificationIcon(notifType)}
                                        </div>
                                        <div className="notification-content">
                                            <h4>{displayTitle}</h4>
                                            <p>{notifMessage}</p>
                                            <span className="notification-time">{formatTime(item.created_at)}</span>
                                        </div>
                                        {!item.is_read && <div className="unread-dot"></div>}
                                    </Link>
                                );
                            })
                        )}
                    </div>

                    <div className="notification-dropdown-footer">
                        <Link to="/notifications" onClick={() => setShowDropdown(false)}>
                            {t('dashboard.notifications.viewAll')}
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
