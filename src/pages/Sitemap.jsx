import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

/**
 * Sitemap Component
 * 
 * This component fetches the sitemap from the Edge Function
 * and displays it as XML. In production, you should configure
 * your server/CDN to serve this directly.
 * 
 * For development, visit: /sitemap.xml
 */
const Sitemap = () => {
    const [xml, setXml] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSitemap = async () => {
            try {
                const { data, error } = await supabase.functions.invoke('generate-sitemap');

                if (error) throw error;

                // If data is already XML string
                if (typeof data === 'string') {
                    setXml(data);
                } else {
                    // Edge function returns raw Response
                    setXml(JSON.stringify(data, null, 2));
                }
            } catch (err) {
                console.error('Sitemap error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSitemap();
    }, []);

    // Set content type for proper XML display
    useEffect(() => {
        if (xml && !loading) {
            document.contentType = 'application/xml';
        }
    }, [xml, loading]);

    if (loading) {
        return <div style={{ fontFamily: 'monospace', padding: '20px' }}>Loading sitemap...</div>;
    }

    if (error) {
        return (
            <div style={{ fontFamily: 'monospace', padding: '20px', color: 'red' }}>
                Error loading sitemap: {error}
            </div>
        );
    }

    // Display as preformatted XML
    return (
        <pre style={{
            fontFamily: 'monospace',
            fontSize: '12px',
            padding: '20px',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word'
        }}>
            {xml}
        </pre>
    );
};

export default Sitemap;
