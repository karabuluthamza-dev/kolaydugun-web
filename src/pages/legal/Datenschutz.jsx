import React from 'react';
import useSEO from '../../hooks/useSEO';

const Datenschutz = () => {
    useSEO({
        title: 'Datenschutzerklärung - KolayDugun.de',
        description: 'Datenschutzerklärung von KolayDugun.de'
    });

    return (
        <div className="section container">
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 0' }}>
                <h1 style={{ marginBottom: '30px' }}>Datenschutzerklärung</h1>

                <div style={{ background: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <h3>1. Datenschutz auf einen Blick</h3>
                    <p>
                        <strong>Allgemeine Hinweise</strong><br />
                        Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.
                    </p>

                    <h3 style={{ marginTop: '30px' }}>2. Hosting und Content Delivery Networks (CDN)</h3>
                    <p>
                        Wir hosten die Inhalte unserer Website bei folgenden Anbietern:<br />
                        [Vercel / Netlify / Supabase]
                    </p>

                    <h3 style={{ marginTop: '30px' }}>3. Allgemeine Hinweise und Pflichtinformationen</h3>
                    <p>
                        <strong>Datenschutz</strong><br />
                        Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.
                    </p>

                    <h3 style={{ marginTop: '30px' }}>4. Amazon EU-Partnerprogramm</h3>
                    <p>
                        <strong>Teilnahme am Amazon.de Partnerprogramm</strong><br />
                        Diese Website nimmt am Amazon EU-Partnerprogramm teil. Auf unseren Seiten werden Werbeanzeigen und Links zur Seite von Amazon.de eingebunden, an denen wir über Werbekostenerstattung Geld verdienen können.
                    </p>
                    <p style={{ marginTop: '15px' }}>
                        <strong>Affiliate-Links</strong><br />
                        Bei den mit 🔗 oder "Affiliate-Link" gekennzeichneten Links handelt es sich um sogenannte Affiliate-Links. Wenn Sie über diese Links ein Produkt kaufen, erhalten wir eine kleine Provision. Der Preis für Sie bleibt unverändert.
                    </p>
                    <p style={{ marginTop: '15px' }}>
                        <strong>Cookies und Tracking</strong><br />
                        Amazon setzt Cookies ein, um die Herkunft der Bestellungen nachvollziehen zu können. Dadurch kann Amazon erkennen, dass Sie den Partnerlink auf unserer Website geklickt haben. Die Speicherung von "Amazon-Cookies" erfolgt auf Grundlage von Art. 6 lit. f DSGVO.
                    </p>
                    <p style={{ marginTop: '15px' }}>
                        Weitere Informationen zur Datennutzung durch Amazon finden Sie in der <a href="https://www.amazon.de/gp/help/customer/display.html?nodeId=201909010" target="_blank" rel="noopener noreferrer" style={{ color: '#D4AF37' }}>Datenschutzerklärung von Amazon</a>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Datenschutz;
