/**
 * Admin Notification Helper
 * Sends notifications to admin users when important events occur
 */
import { supabase } from '../supabaseClient';

/**
 * Admin notification types
 */
export const ADMIN_NOTIFICATION_TYPES = {
    NEW_LEAD: 'admin_new_lead',
    NEW_VENDOR: 'admin_new_vendor',
    NEW_CONTACT: 'admin_new_contact',
    FORUM_REPORT: 'admin_forum_report',
    NEW_USER: 'admin_new_user'
};

/**
 * Send notification to all admin users
 * @param {Object} params Notification parameters
 * @param {string} params.type Notification type
 * @param {string} params.title Title text
 * @param {string} params.message Message text
 * @param {string} params.deepLink Optional deep link to related page
 * @param {string} params.priority 'high' | 'medium' | 'low'
 */
export const notifyAdmins = async ({ type, title, message, deepLink, priority = 'high' }) => {
    try {
        let adminIds = [];

        // Try Method 1: Check profiles table with role='admin'
        const { data: adminsByRole, error: roleError } = await supabase
            .from('profiles')
            .select('id')
            .eq('role', 'admin');

        if (!roleError && adminsByRole && adminsByRole.length > 0) {
            adminIds = adminsByRole.map(a => a.id);
            console.log('✅ Found admins by role:', adminIds.length);
        }

        // Try Method 2: Check profiles table with is_admin flag
        if (adminIds.length === 0) {
            const { data: adminsByFlag, error: flagError } = await supabase
                .from('profiles')
                .select('id')
                .eq('is_admin', true);

            if (!flagError && adminsByFlag && adminsByFlag.length > 0) {
                adminIds = adminsByFlag.map(a => a.id);
                console.log('✅ Found admins by is_admin flag:', adminIds.length);
            }
        }

        // Fallback: Get current logged-in user (for testing and single-admin setup)
        if (adminIds.length === 0) {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                adminIds = [user.id];
                console.log('📧 Sending notification to current user:', user.email);
            }
        }

        if (adminIds.length === 0) {
            console.warn('❌ No admin users found for notification');
            return false;
        }

        console.log('📤 Creating notification for admin IDs:', adminIds);

        // Create notification for each admin (using only existing columns)
        const notifications = adminIds.map(adminId => ({
            user_id: adminId,
            type: type,
            title: title,
            message: message + (deepLink ? ` [${deepLink}]` : ''), // Include link in message
            is_read: false,
            created_at: new Date().toISOString()
        }));

        const { error: insertError } = await supabase
            .from('user_notifications')
            .insert(notifications);

        if (insertError) {
            console.error('Error sending admin notifications:', insertError);
            return false;
        }

        console.log(`✅ Admin notification sent: ${type} to ${adminIds.length} admin(s)`);
        return true;
    } catch (error) {
        console.error('Error in notifyAdmins:', error);
        return false;
    }
};

/**
 * Pre-built notification functions for common events
 */
export const adminNotifications = {
    /**
     * Notify admins about new lead/quote request
     */
    newLead: async (leadData) => {
        const { contact_name, contact_email } = leadData;
        return notifyAdmins({
            type: ADMIN_NOTIFICATION_TYPES.NEW_LEAD,
            title: '📋 Yeni Teklif Talebi',
            message: `${contact_name} (${contact_email}) teklif talebinde bulundu.`,
            deepLink: '/admin/leads',
            priority: 'high'
        });
    },

    /**
     * Notify admins about new vendor registration
     */
    newVendor: async (vendorData) => {
        const { business_name, email } = vendorData;
        return notifyAdmins({
            type: ADMIN_NOTIFICATION_TYPES.NEW_VENDOR,
            title: '🏢 Yeni Tedarikçi Kaydı',
            message: `${business_name || 'Yeni tedarikçi'} (${email}) kayıt oldu.`,
            deepLink: '/admin/vendors',
            priority: 'high'
        });
    },

    /**
     * Notify admins about new contact form message
     */
    newContactMessage: async (contactData) => {
        const { name, email, message } = contactData;
        return notifyAdmins({
            type: ADMIN_NOTIFICATION_TYPES.NEW_CONTACT,
            title: '✉️ Yeni İletişim Mesajı',
            message: `${name} (${email}): "${message.slice(0, 50)}${message.length > 50 ? '...' : ''}"`,
            deepLink: '/admin/messages',
            priority: 'high'
        });
    },

    /**
     * Notify admins about forum content report
     */
    forumReport: async (reportData) => {
        const { reason, post_title } = reportData;
        return notifyAdmins({
            type: ADMIN_NOTIFICATION_TYPES.FORUM_REPORT,
            title: '🚩 Forum Raporu',
            message: `İçerik raporlandı: "${post_title?.slice(0, 30) || 'Konu'}..." - Sebep: ${reason?.slice(0, 50) || 'Belirtilmedi'}`,
            deepLink: '/admin/forum-moderation',
            priority: 'high'
        });
    },

    /**
     * Notify admins about new user registration
     */
    newUser: async (userData) => {
        const { email, first_name } = userData;
        return notifyAdmins({
            type: ADMIN_NOTIFICATION_TYPES.NEW_USER,
            title: '👤 Yeni Kullanıcı Kaydı',
            message: `${first_name || 'Yeni kullanıcı'} (${email}) kayıt oldu.`,
            deepLink: '/admin/users',
            priority: 'medium'
        });
    }
};
