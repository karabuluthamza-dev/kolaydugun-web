import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedTypes = ['couple', 'vendor'], requireAdmin = false }) => {
    const { user } = useAuth();

    console.log('ProtectedRoute Check:', JSON.stringify({
        userRole: user?.role,
        metaRole: user?.user_metadata?.role,
        allowedTypes,
        requireAdmin,
        id: user?.id
    }, null, 2));

    if (!user) {
        // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
        return <Navigate to="/login" replace />;
    }

    const userRole = user.role || user.user_metadata?.role;
    const isAdmin = userRole === 'admin';

    // Admin-only route kontrolü
    if (requireAdmin) {
        if (!isAdmin) {
            console.warn('⚠️ SECURITY: Non-admin user attempted to access admin route!', {
                userId: user.id,
                userRole: userRole,
                attemptedRoute: window.location.pathname
            });
            // Admin değilse ana sayfaya yönlendir
            return <Navigate to="/" replace />;
        }
        return children;
    }

    // Admin her yere erişebilir
    if (isAdmin) {
        return children;
    }

    if (!allowedTypes.includes(userRole)) {
        // Kullanıcı tipi uygun değilse ana sayfaya yönlendir
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
