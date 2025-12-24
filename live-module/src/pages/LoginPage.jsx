import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Music, Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const from = location.state?.from?.pathname || "/dashboard";

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data, error: err } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (err) throw err;

            // Optional: Check if user is a vendor
            const { data: vendor } = await supabase
                .from('vendors')
                .select('id')
                .eq('id', data.user.id)
                .single();

            if (!vendor) {
                await supabase.auth.signOut();
                throw new Error('Yalnızca tedarikçi hesapları DJ paneline erişebilir.');
            }

            navigate(from, { replace: true });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 md:p-12 shadow-2xl"
            >
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-prime/10 rounded-full mb-6">
                        <Music className="w-10 h-10 text-prime" />
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-white mb-2">Müzisyen Girişi</h1>
                    <p className="text-slate-500 font-medium text-sm">KolayDüğün hesabınızla giriş yapın</p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-sm font-medium"
                    >
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p>{error}</p>
                    </motion.div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">E-Posta</label>
                        <div className="relative">
                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                            <input
                                required
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-14 pr-5 py-4 text-white focus:ring-2 focus:ring-prime focus:border-transparent transition-all outline-none"
                                placeholder="E-posta adresiniz"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Şifre</label>
                        <div className="relative">
                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                            <input
                                required
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-14 pr-5 py-4 text-white focus:ring-2 focus:ring-prime focus:border-transparent transition-all outline-none"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-prime hover:bg-rose-600 text-white font-bold py-5 rounded-2xl shadow-lg shadow-prime/20 flex items-center justify-center gap-3 transform active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'GİRİŞ YAP'}
                    </button>

                    <div className="pt-4 text-center">
                        <a
                            href="https://kolaydugun.de/vendor/login"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-slate-600 hover:text-slate-400 uppercase tracking-widest transition-colors"
                        >
                            Şifremi Unuttum?
                        </a>
                    </div>
                </form>
            </motion.div>

            <footer className="fixed bottom-8 text-center text-[10px] text-slate-700 font-bold uppercase tracking-[0.4em]">
                &copy; KolayDüğün Live Module
            </footer>
        </div>
    );
};

export default LoginPage;
