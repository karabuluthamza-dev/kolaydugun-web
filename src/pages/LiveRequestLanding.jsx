import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Music, QrCode, Zap, ShieldCheck, BarChart3, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const LiveRequestLanding = () => {
    const { t } = useLanguage();

    const features = [
        {
            icon: <Zap className="w-8 h-8 text-yellow-400" />,
            title: t('liveRequest.features.realtime.title'),
            desc: t('liveRequest.features.realtime.desc')
        },
        {
            icon: <BarChart3 className="w-8 h-8 text-blue-400" />,
            title: t('liveRequest.features.stats.title'),
            desc: t('liveRequest.features.stats.desc')
        },
        {
            icon: <ShieldCheck className="w-8 h-8 text-green-400" />,
            title: t('liveRequest.features.spam.title'),
            desc: t('liveRequest.features.spam.desc')
        }
    ];

    return (
        <div className="bg-white min-h-screen">
            {/* Hero Section */}
            <div className="relative bg-slate-900 overflow-hidden pt-20 pb-20 md:pt-32 md:pb-32">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-prime rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2" />
                </div>

                <div className="container relative z-10 px-6">
                    <div className="max-w-4xl mx-auto text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-prime font-bold text-sm mb-8 border border-white/10"
                        >
                            <Music className="w-4 h-4" />
                            <span>Müzisyenler & Orkestralar İçin</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-7xl font-black text-white mb-8 leading-tight"
                        >
                            {t('liveRequest.title')}
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-lg md:text-2xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed"
                        >
                            {t('liveRequest.subtitle')}
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-col sm:flex-row gap-4 justify-center"
                        >
                            <a
                                href="https://live.kolaydugun.de/dashboard"
                                className="bg-prime hover:bg-rose-600 text-white px-10 py-5 rounded-2xl font-black tracking-widest transition-all shadow-xl shadow-prime/20 flex items-center justify-center gap-3 text-lg"
                            >
                                {t('liveRequest.cta')} <ArrowRight className="w-6 h-6" />
                            </a>
                            <Link
                                to="/register?type=vendor"
                                className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-10 py-5 rounded-2xl font-black tracking-widest transition-all text-lg"
                            >
                                Hemen Üye Ol
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <div className="py-24 bg-slate-50">
                <div className="container px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 group hover:shadow-xl hover:-translate-y-2 transition-all"
                            >
                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-prime/5 transition-colors">
                                    {feature.icon}
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-4">{feature.title}</h3>
                                <p className="text-lg text-slate-600 leading-relaxed font-medium">
                                    {feature.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Visual Demo Section */}
            <div className="py-24 bg-white overflow-hidden">
                <div className="container px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-20">
                        <div className="lg:w-1/2">
                            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-8">
                                Kağıt Kalem Devri Kapandı
                            </h2>
                            <p className="text-xl text-slate-600 mb-10 leading-relaxed font-medium">
                                Misafirler masalarındaki QR kodu taratır, istedikleri şarkıyı ve varsa mesajlarını iletirler. Siz sahnede dev ekranınızdan tüm istekleri anında görür, çaldığınızı işaretler veya sıraya alırsınız.
                            </p>
                            <ul className="space-y-6">
                                <li className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center text-green-600">
                                        <QrCode className="w-5 h-5" />
                                    </div>
                                    <span className="text-lg font-bold text-slate-800">Her Masaya Özel QR Erişim</span>
                                </li>
                                <li className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-600">
                                        <Music className="w-5 h-5" />
                                    </div>
                                    <span className="text-lg font-bold text-slate-800">Geniş Müzik Arşivi ve Notlar</span>
                                </li>
                            </ul>
                        </div>
                        <div className="lg:w-1/2 relative">
                            <div className="bg-prime/10 rounded-[3rem] p-4 rotate-3">
                                <img
                                    src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=1000"
                                    alt="DJ Live Request Demo"
                                    className="rounded-[2.5rem] shadow-2xl -rotate-3"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer CTA */}
            <div className="py-24 bg-slate-900 text-center">
                <div className="container px-6">
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-10">
                        Sahnenizin Kontrolünü Ele Alın
                    </h2>
                    <a
                        href="https://live.kolaydugun.de/dashboard"
                        className="inline-flex bg-prime hover:bg-rose-600 text-white px-12 py-6 rounded-2xl font-black tracking-widest transition-all shadow-xl shadow-prime/40 items-center gap-4 text-xl"
                    >
                        {t('liveRequest.cta')} <ArrowRight className="w-7 h-7" />
                    </a>
                </div>
            </div>
        </div>
    );
};

export default LiveRequestLanding;
