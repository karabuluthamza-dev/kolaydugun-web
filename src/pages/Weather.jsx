import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import usePageTitle from '../hooks/usePageTitle';
import { COUNTRIES, STATES, CITIES_BY_STATE } from '../constants/vendorData';
import { dictionary } from '../locales/dictionary';
import './Weather.css';

const Weather = () => {
    usePageTitle('Weather Forecast');
    const { t, language } = useLanguage();
    const [country, setCountry] = useState('DE');
    const [state, setState] = useState('');
    const [city, setCity] = useState('');
    const [weddingDate, setWeddingDate] = useState('');
    const [forecast, setForecast] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // WMO Weather interpretation codes (https://open-meteo.com/en/docs)
    const getWeatherCondition = (code) => {
        if (code === 0) return t('weather.conditions.clear') || 'Açık';
        if (code === 1 || code === 2 || code === 3) return t('weather.conditions.partlyCloudy') || 'Parçalı Bulutlu';
        if (code === 45 || code === 48) return t('weather.conditions.foggy') || 'Sisli';
        if (code >= 51 && code <= 55) return t('weather.conditions.drizzle') || 'Çiseleyen Yağmur';
        if (code >= 61 && code <= 65) return t('weather.conditions.rain') || 'Yağmurlu';
        if (code >= 71 && code <= 77) return t('weather.conditions.snow') || 'Karlı';
        if (code >= 80 && code <= 82) return t('weather.conditions.showers') || 'Sağanak Yağış';
        if (code >= 95) return t('weather.conditions.thunderstorm') || 'Fırtına';
        return t('weather.conditions.mild') || 'Ilıman';
    };

    const getCoordinates = async (cityName) => {
        try {
            const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1&language=tr&format=json`);
            const data = await response.json();
            if (!data.results || data.results.length === 0) throw new Error('City not found');
            return data.results[0];
        } catch (err) {
            console.error("Geocoding error:", err);
            throw new Error(t('weather.errors.cityNotFound') || 'Şehir bulunamadı.');
        }
    };

    const handleForecast = async (e) => {
        e.preventDefault();
        setError('');
        setForecast(null);
        setLoading(true);

        if (!city) {
            setError(t('weather.errors.city') || 'Lütfen bir şehir seçin.');
            setLoading(false);
            return;
        }
        if (!weddingDate) {
            setError(t('weather.errors.date') || 'Lütfen düğün tarihini seçin.');
            setLoading(false);
            return;
        }

        try {
            // 1. Get Coordinates
            const coords = await getCoordinates(city);

            // 2. Determine if Forecast (next 14 days) or Historical (future/past)
            const targetDate = new Date(weddingDate);
            const today = new Date();
            const diffTime = targetDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            let weatherData = null;
            let isHistorical = false;

            if (diffDays >= 0 && diffDays <= 14) {
                // Forecast API
                const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min,sunset,precipitation_probability_max&timezone=auto&start_date=${weddingDate}&end_date=${weddingDate}`);
                const data = await res.json();

                if (data.daily) {
                    weatherData = {
                        temp: Math.round((data.daily.temperature_2m_max[0] + data.daily.temperature_2m_min[0]) / 2),
                        maxTemp: data.daily.temperature_2m_max[0],
                        minTemp: data.daily.temperature_2m_min[0],
                        sunset: data.daily.sunset[0].split('T')[1],
                        rain: data.daily.precipitation_probability_max[0],
                        condition: getWeatherCondition(data.daily.weather_code[0])
                    };
                }
            } else {
                // Historical API (Use last year's data for the same day as a proxy)
                isHistorical = true;
                const lastYear = targetDate.getFullYear() - 1;
                // Handle leap years or just simple subtraction
                const lastYearDate = `${lastYear}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;

                const res = await fetch(`https://archive-api.open-meteo.com/v1/archive?latitude=${coords.latitude}&longitude=${coords.longitude}&start_date=${lastYearDate}&end_date=${lastYearDate}&daily=weather_code,temperature_2m_max,temperature_2m_min,sunset,precipitation_sum&timezone=auto`);
                const data = await res.json();

                if (data.daily) {
                    // Estimate rain probability based on precipitation sum (rough heuristic)
                    const rainProb = data.daily.precipitation_sum[0] > 0 ? 60 : 10;

                    weatherData = {
                        temp: Math.round((data.daily.temperature_2m_max[0] + data.daily.temperature_2m_min[0]) / 2),
                        maxTemp: data.daily.temperature_2m_max[0],
                        minTemp: data.daily.temperature_2m_min[0],
                        sunset: data.daily.sunset[0].split('T')[1],
                        rain: rainProb, // Historical data gives sum, not probability
                        condition: getWeatherCondition(data.daily.weather_code[0])
                    };
                }
            }

            if (weatherData) {
                setForecast({
                    ...weatherData,
                    city,
                    date: weddingDate,
                    isHistorical
                });
            } else {
                throw new Error('No weather data available');
            }

        } catch (err) {
            console.error("Weather fetch error:", err);
            setError(t('weather.errors.fetchFailed') || 'Hava durumu bilgisi alınamadı. Lütfen daha sonra tekrar deneyin.');
        } finally {
            setLoading(false);
        }
    };

    const getRecommendations = () => {
        if (!forecast) return [];

        const recommendations = [];

        if (forecast.temp < 10) {
            recommendations.push(t('weather.recommendations.cold1') || '🧥 Misafirleriniz için battaniye veya şal hazırlayın');
            recommendations.push(t('weather.recommendations.cold2') || '🔥 Açık havada ısıtıcı kullanmayı düşünün');
        }

        if (forecast.rain > 40) {
            recommendations.push(t('weather.recommendations.rain1') || '☔ Yağmur planı hazırlayın - kapalı alan alternatifi');
            recommendations.push(t('weather.recommendations.rain2') || '🌂 Misafirler için şemsiye temin edin');
        }

        if (forecast.temp > 25) {
            recommendations.push(t('weather.recommendations.hot1') || '💧 Bol miktarda su ve serinletici içecek hazırlayın');
            recommendations.push(t('weather.recommendations.hot2') || '🌳 Gölgelik alanlar oluşturun');
            recommendations.push(t('weather.recommendations.hot3') || '🌬️ Vantilatör veya klima kullanımını planlayın');
        }

        if (forecast.sunset < '18:00') {
            recommendations.push(t('weather.recommendations.dark1') || '💡 Erken aydınlatma planlayın');
            recommendations.push(t('weather.recommendations.dark2') || '🕯️ Romantik mum ve ışık düzenlemesi yapın');
        }

        return recommendations;
    };

    return (
        <div className="section container weather-container">
            <h2 className="weather-header">🌤️ {t('weather.title') || 'Hava Durumu Tahmini'}</h2>
            <p className="weather-desc">
                {t('weather.desc') || 'Düğün tarihiniz ve şehrinize göre ortalama hava durumu bilgisi alın ve hazırlıklarınızı buna göre planlayın.'}
            </p>

            {/* Form */}
            <div className="weather-form-card">
                <form onSubmit={handleForecast}>
                    <div className="weather-form-grid">
                        <div className="weather-form-field">
                            <label className="weather-form-label">
                                {t('filters.country') || 'Ülke'}
                            </label>
                            <select
                                value={country}
                                onChange={(e) => { setCountry(e.target.value); setState(''); setCity(''); }}
                                className="weather-form-select"
                            >
                                {COUNTRIES.map(c => (
                                    <option key={c.code} value={c.code}>{c[language] || c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="weather-form-field">
                            <label className="weather-form-label">
                                {t('filters.state') || 'Eyalet'}
                            </label>
                            <select
                                value={state}
                                onChange={(e) => { setState(e.target.value); setCity(''); }}
                                className="weather-form-select"
                            >
                                <option value="">{t('common.select') || 'Seçiniz'}</option>
                                {(STATES[country] || []).map(s => (
                                    <option key={s.id} value={s.id}>
                                        {dictionary.locations.states[s.id]?.[language] || s[language] || s.en}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="weather-form-field">
                            <label htmlFor="weather-city" className="weather-form-label">
                                {t('weather.cityLabel') || 'Düğün Şehri'}
                            </label>
                            <select
                                id="weather-city"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                required
                                className="weather-form-select"
                                aria-label={t('weather.cityLabel')}
                                aria-invalid={error && !city ? "true" : "false"}
                            >
                                <option value="">{t('register.selectCity') || 'Şehir seçin...'}</option>
                                {(CITIES_BY_STATE[state] || []).map(city => (
                                    <option key={city.id} value={city.id}>{city[language] || city.en || city.id}</option>
                                ))}
                                {!state && <option disabled>Önce eyalet seçin</option>}
                            </select>
                        </div>

                        <div className="weather-form-field">
                            <label htmlFor="weather-date" className="weather-form-label">
                                {t('vendorDetail.date') || 'Düğün Tarihi'}
                            </label>
                            <input
                                id="weather-date"
                                type="date"
                                value={weddingDate}
                                onChange={(e) => setWeddingDate(e.target.value)}
                                required
                                className="weather-form-input"
                                aria-label={t('vendorDetail.date')}
                                aria-invalid={error && !weddingDate ? "true" : "false"}
                            />
                        </div>
                    </div>

                    {error && <div className="error-message" role="alert">{error}</div>}

                    <button
                        type="submit"
                        className="btn btn-primary weather-submit-btn"
                        aria-label={t('weather.showForecast')}
                        disabled={loading}
                    >
                        {loading ? 'Yükleniyor...' : (t('weather.showForecast') || 'Hava Durumu Tahminini Göster')}
                    </button>
                </form>
            </div>

            {/* Forecast Results */}
            {forecast && (
                <div className="forecast-card" role="region" aria-label={t('weather.results')}>
                    <h3 className="forecast-title">
                        {forecast.city} - {new Date(forecast.date).toLocaleDateString(t('locale') || 'tr-TR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </h3>

                    {forecast.isHistorical && (
                        <div style={{
                            background: '#fff3cd',
                            color: '#856404',
                            padding: '10px',
                            borderRadius: '8px',
                            marginBottom: '20px',
                            fontSize: '0.9rem',
                            textAlign: 'center'
                        }}>
                            ⚠️ {t('weather.historicalNote') || 'Bu tarih için henüz kesin tahmin yok. Geçen yılın verilerine dayalı tahmini gösteriyoruz.'}
                        </div>
                    )}

                    <div className="forecast-grid">
                        <div className="forecast-stat">
                            <div className="forecast-icon" aria-hidden="true">🌡️</div>
                            <div className="forecast-value">{forecast.temp}°C</div>
                            <div className="forecast-label">{t('weather.avgTemp') || 'Ortalama Sıcaklık'}</div>
                            <div style={{ fontSize: '0.8rem', color: '#666' }}>Max: {forecast.maxTemp}° Min: {forecast.minTemp}°</div>
                        </div>

                        <div className="forecast-stat">
                            <div className="forecast-icon" aria-hidden="true">🌅</div>
                            <div className="forecast-value">{forecast.sunset}</div>
                            <div className="forecast-label">{t('weather.sunset') || 'Gün Batımı'}</div>
                        </div>

                        <div className="forecast-stat">
                            <div className="forecast-icon" aria-hidden="true">💧</div>
                            <div className="forecast-value">%{forecast.rain}</div>
                            <div className="forecast-label">{t('weather.rainChance') || 'Yağış İhtimali'}</div>
                        </div>

                        <div className="forecast-stat">
                            <div className="forecast-icon" aria-hidden="true">☁️</div>
                            <div className="forecast-condition-value">{forecast.condition}</div>
                            <div className="forecast-label">{t('weather.condition') || 'Genel Durum'}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Recommendations */}
            {forecast && getRecommendations().length > 0 && (
                <div className="recommendations-card" role="region" aria-label={t('weather.recommendationsTitle')}>
                    <h3 className="recommendations-title">
                        💡 {t('weather.recommendationsTitle') || 'Öneriler ve Hazırlıklar'}
                    </h3>
                    <div className="recommendations-list">
                        {getRecommendations().map((rec, index) => (
                            <div
                                key={index}
                                className="recommendation-item"
                            >
                                {rec}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!forecast && !loading && (
                <div className="empty-state">
                    <p className="empty-icon" aria-hidden="true">🌤️</p>
                    <p>{t('weather.emptyState') || 'Düğün şehrinizi ve tarihinizi seçerek hava durumu tahminini görüntüleyin.'}</p>
                    <p className="empty-disclaimer">
                        * {t('weather.disclaimer') || 'Bu tahminler Open-Meteo verilerine dayanmaktadır.'}
                    </p>
                </div>
            )}
        </div>
    );
};

export default Weather;
