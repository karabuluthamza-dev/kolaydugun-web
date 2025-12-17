import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import DOMPurify from 'dompurify';
import { useLanguage } from '../context/LanguageContext';
import SEO from '../components/SEO';
import './DynamicPage.css';

const DynamicPage = () => {
    const { slug } = useParams();
    const { language } = useLanguage();
    const navigate = useNavigate();
    const [page, setPage] = useState(null);
    const [loading, setLoading] = useState(true);



    useEffect(() => {
        if (slug) {
            fetchPage();
        }
    }, [slug]);

    const fetchPage = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('pages')
                .select('*')
                .eq('slug', slug)
                .eq('is_active', true)
                .single();

            if (error) throw error;

            if (!data) {
                navigate('/404'); // Or handle not found
                return;
            }

            setPage(data);
        } catch (error) {
            console.error('Error fetching page:', error);
            // navigate('/404');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="section container" style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (!page) {
        return (
            <div className="section container" style={{ textAlign: 'center', padding: '50px' }}>
                <h2>Sayfa Bulunamadı</h2>
                <p>Aradığınız sayfa mevcut değil veya taşınmış olabilir.</p>
                <button onClick={() => navigate('/')} className="btn btn-primary" style={{ marginTop: '20px' }}>
                    Anasayfaya Dön
                </button>
            </div>
        );
    }

    const title = page.title?.[language] || page.title?.en || 'Page';
    const content = page.content?.[language] || page.content?.en || '';

    return (
        <div className="section container dynamic-page">
            <SEO title={title} description={title} />
            <h1 className="page-title">{title}</h1>
            <div
                className="page-content"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
            />
        </div>
    );
};

export default DynamicPage;
