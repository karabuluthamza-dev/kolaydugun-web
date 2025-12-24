import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';
import { usePageTitle } from '../hooks/usePageTitle';
import LoadingSpinner from '../components/LoadingSpinner';
import {
    Check, X, Building, Link as LinkIcon, AlertTriangle,
    Trash2, RefreshCw, Mail, Phone, Globe, ShieldCheck,
    AlertCircle, Clock, CheckCircle2, Filter, Zap, Sparkles, XCircle,
    Info, BookOpen, Wand2, Pencil, Database, Layers, ExternalLink
} from 'lucide-react';
import { CATEGORIES, getCategoryTranslationKey, CITIES, POPULAR_CITIES, STATES } from '../constants/vendorData';
import { suggestCity, suggestCategory } from '../services/aiService';
import AdminImportsHelp from '../components/Admin/AdminImportsHelp';
import VendorMergeModal from '../components/Admin/VendorMergeModal';
import VendorEditModal from '../components/Admin/VendorEditModal';

const generateUUID = () => {
    try {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        }
    } catch (e) { }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

// --- ZIP/City Parser Helper ---
const splitZipCity = (raw) => {
    if (!raw) return { city: 'Bilinmiyor', zip: null, countryHint: null };
    const sRaw = raw.toString().trim();

    // 1. Detect Country Prefix
    let countryHint = null;
    if (/^A-|^AT-/i.test(sRaw)) countryHint = 'AT';
    else if (/^CH-/i.test(sRaw)) countryHint = 'CH';
    else if (/^D-|^DE-/i.test(sRaw)) countryHint = 'DE';

    // 2. Extract ZIP anywhere (including inside tags like [eski: 53639 ...])
    const zipMatch = sRaw.match(/(?:D-|CH-|A-|AT-|DE-)?(\d{4,5})/i);
    const foundZip = zipMatch ? zipMatch[1] : null;

    // 3. Clean city name (strip tags and leading ZIPs with prefixes)
    let cleanCity = sRaw.replace(/\s*\[(AI|eski):.*?\]\s*$/i, '').trim();
    cleanCity = cleanCity.replace(/^(?:D-|CH-|A-|AT-|DE-)?\d{4,5}\s+/i, '').trim();

    // Remove any remaining leading/trailing special chars
    cleanCity = cleanCity.replace(/^[-,\s]+|[-,\s]+$/g, '');

    return { city: cleanCity || 'Bilinmiyor', zip: foundZip, countryHint };
};

// --- Fuzzy String Matching Helper ---
const levenshteinDistance = (str1, str2) => {
    const m = str1.length, n = str2.length;
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            dp[i][j] = str1[i - 1] === str2[j - 1]
                ? dp[i - 1][j - 1]
                : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
        }
    }
    return dp[m][n];
};

// Find best fuzzy match from city list
const findBestCityMatch = (rawCity, cityList) => {
    if (!rawCity || rawCity.length < 2) return null;
    const normalized = rawCity.toLowerCase().trim();

    // Exact match first
    const exactMatch = cityList.find(c => c.toLowerCase() === normalized);
    if (exactMatch) return exactMatch;

    // Partial match (city contains or is contained)
    const partialMatch = cityList.find(c =>
        c.toLowerCase().includes(normalized) || normalized.includes(c.toLowerCase())
    );
    if (partialMatch) return partialMatch;

    // Fuzzy match with Levenshtein distance
    let bestMatch = null;
    let bestScore = Infinity;
    for (const city of cityList) {
        const distance = levenshteinDistance(normalized, city.toLowerCase());
        const maxLen = Math.max(normalized.length, city.length);
        const similarity = 1 - (distance / maxLen);
        if (similarity > 0.7 && distance < bestScore) { // 70% similarity threshold
            bestScore = distance;
            bestMatch = city;
        }
    }
    return bestMatch;
};

// --- ZIP Code to Nearest Major City Mapping ---
// German postal codes follow geographic regions
const getMajorCityFromZip = (zip) => {
    if (!zip) return null;
    const sZip = zip.toString().trim();
    if (sZip.length < 2) return null;

    // 1. SWITZERLAND & AUSTRIA (4 Digits)
    if (sZip.length === 4) {
        if (sZip.startsWith('1')) return 'Wien (Vienna)';
        if (sZip.startsWith('50')) return 'Salzburg';
        if (sZip.startsWith('80')) return 'Zürich (Zurich)'; // CH
        if (sZip.startsWith('60')) return 'Luzern (Lucerne)'; // CH
        if (sZip.startsWith('40')) return 'Basel'; // CH
        if (sZip.startsWith('30')) return 'Bern'; // CH (Bern is 30xx, Pressbaum is 3021)
        if (sZip.startsWith('12')) return 'Genève (Geneva)';
        if (sZip.startsWith('10')) return 'Lausanne';

        // Regional Fallbacks for 4-digit
        if (sZip.startsWith('3')) return 'Bern';
        if (sZip.startsWith('4')) return 'Basel';
        if (sZip.startsWith('8')) return 'Zürich (Zurich)';
        return 'Wien (Vienna)';
    }

    // 2. GERMANY (5 Digits)
    if (sZip.length === 5) {
        const prefix = sZip.substring(0, 2);
        const zipToCity = {
            '10': 'Berlin', '12': 'Berlin', '13': 'Berlin', '14': 'Berlin',
            '20': 'Hamburg', '21': 'Hamburg', '22': 'Hamburg',
            '27': 'Bremen', '28': 'Bremen',
            '30': 'Hannover', '31': 'Hannover',
            '38': 'Braunschweig',
            '40': 'Düsseldorf', '41': 'Düsseldorf', '42': 'Wuppertal',
            '43': 'Essen', '44': 'Dortmund', '45': 'Essen', '46': 'Duisburg', '47': 'Duisburg',
            '48': 'Münster',
            '33': 'Bielefeld',
            '50': 'Köln (Cologne)', '51': 'Köln (Cologne)', '52': 'Aachen', '53': 'Bonn',
            '54': 'Trier', '55': 'Mainz', '56': 'Koblenz',
            '60': 'Frankfurt am Main', '61': 'Frankfurt am Main', '63': 'Frankfurt am Main',
            '64': 'Darmstadt', '65': 'Wiesbaden',
            '34': 'Kassel',
            '66': 'Saarbrücken', '67': 'Kaiserslautern', '68': 'Mannheim', '69': 'Heidelberg',
            '70': 'Stuttgart', '71': 'Stuttgart', '72': 'Stuttgart', '73': 'Stuttgart',
            '75': 'Karlsruhe', '76': 'Karlsruhe',
            '77': 'Freiburg im Breisgau', '78': 'Freiburg im Breisgau', '79': 'Freiburg im Breisgau',
            '80': 'München (Munich)', '81': 'München (Munich)', '82': 'München (Munich)',
            '83': 'München (Munich)', '84': 'München (Munich)', '85': 'München (Munich)', '86': 'Augsburg',
            '90': 'Nürnberg (Nuremberg)', '91': 'Nürnberg (Nuremberg)', '92': 'Regensburg',
            '93': 'Regensburg', '94': 'Regensburg',
            '88': 'Ulm', '89': 'Ulm',
            '04': 'Leipzig', '01': 'Dresden', '09': 'Chemnitz', '39': 'Magdeburg',
            '06': 'Halle (Saale)', '99': 'Erfurt', '15': 'Potsdam', '18': 'Rostock',
            '19': 'Schwerin', '24': 'Kiel', '23': 'Lübeck', '25': 'Kiel'
        };

        if (zipToCity[prefix]) return zipToCity[prefix];

        const broadRegions = {
            '0': 'Leipzig', '1': 'Berlin', '2': 'Hamburg', '3': 'Hannover',
            '4': 'Düsseldorf', '5': 'Köln (Cologne)', '6': 'Frankfurt am Main',
            '7': 'Stuttgart', '8': 'München (Munich)', '9': 'Nürnberg (Nuremberg)'
        };
        return broadRegions[sZip.substring(0, 1)] || null;
    }

    return null;
};

// --- Location Helper (Expanded with New Cities) ---
const normalizeLocation = (cityRaw, zipRaw, countryHint = null) => {
    let city = cityRaw || '';
    let state = null;
    let country = countryHint || 'DE'; // Default to DE, but strongly prefer hint

    // Auto-detect country based on valid ZIP length features if hint is missing
    if (!countryHint && zipRaw) {
        const zipLen = zipRaw.toString().length;
        if (zipLen === 4) {
            // 4 digits is almost always Austria or Switzerland in this context
            // Defaulting to AT as it's more common in our dataset, catch CH via city list below
            country = 'AT';
        } else if (zipLen === 5) {
            country = 'DE';
        }
    }

    const cLower = city.toLowerCase().trim();

    // Extended Canonical Mappings (includes new 49 cities)
    const canonicalMap = {
        // Major German cities
        'köln': 'Köln (Cologne)', 'cologne': 'Köln (Cologne)', 'koeln': 'Köln (Cologne)',
        'munich': 'München (Munich)', 'münchen': 'München (Munich)', 'muenchen': 'München (Munich)',
        'frankfurt': 'Frankfurt am Main', 'frankfurt a.m.': 'Frankfurt am Main', 'frankfurt/main': 'Frankfurt am Main',
        'nuremberg': 'Nürnberg (Nuremberg)', 'nürnberg': 'Nürnberg (Nuremberg)', 'nuernberg': 'Nürnberg (Nuremberg)',
        // Austrian cities
        'vienna': 'Wien (Vienna)', 'wien': 'Wien (Vienna)',
        // Swiss cities
        'zurich': 'Zürich (Zurich)', 'zürich': 'Zürich (Zurich)', 'zuerich': 'Zürich (Zurich)',
        'geneva': 'Genève (Geneva)', 'genf': 'Genève (Geneva)', 'genève': 'Genève (Geneva)',
        'lucerne': 'Luzern (Lucerne)', 'luzern': 'Luzern (Lucerne)',
        // New cities - Germany (abbreviated forms)
        'kaiserslautern': 'Kaiserslautern', 'k-lautern': 'Kaiserslautern',
        'frankfurt oder': 'Frankfurt (Oder)', 'frankfurt/oder': 'Frankfurt (Oder)',
        'halle saale': 'Halle (Saale)', 'halle': 'Halle (Saale)',
        'dessau': 'Dessau-Roßlau', 'dessau-rosslau': 'Dessau-Roßlau',
        'biel': 'Biel/Bienne', 'bienne': 'Biel/Bienne',
        // Common typos / variations
        'duesseldorf': 'Düsseldorf', 'dusseldorf': 'Düsseldorf',
        'goettingen': 'Göttingen', 'gottingen': 'Göttingen',
        'freiburg': 'Freiburg im Breisgau',
        'ludwigshafen': 'Ludwigshafen am Rhein',
        'pressbaum': 'Wien (Vienna)' // Map Pressbaum to nearest major city
    };

    // Apply canonical mapping
    Object.keys(canonicalMap).forEach(key => {
        // Safe boundary check
        const regex = new RegExp(`(^|\\s)${key}($|\\s)`, 'i');
        if (regex.test(cLower)) {
            city = canonicalMap[key];
        } else if (cLower === key) {
            city = canonicalMap[key];
        }
    });

    // Extended State Detection (includes new cities)
    const stateMapping = {
        'NW': ['Köln', 'Düsseldorf', 'Dortmund', 'Essen', 'Bonn', 'Bochum', 'Wuppertal', 'Bielefeld', 'Münster', 'Aachen', 'Gelsenkirchen', 'Krefeld', 'Oberhausen', 'Hagen', 'Hamm', 'Leverkusen', 'Solingen', 'Herne', 'Neuss', 'Paderborn', 'Bottrop', 'Mönchengladbach'],
        'BE': ['Berlin'],
        'HH': ['Hamburg'],
        'BY': ['München', 'Nürnberg', 'Augsburg', 'Regensburg', 'Ingolstadt', 'Würzburg', 'Erlangen', 'Fürth'],
        'HE': ['Frankfurt', 'Wiesbaden', 'Kassel', 'Darmstadt', 'Offenbach', 'Hanau', 'Gießen'],
        'BW': ['Stuttgart', 'Karlsruhe', 'Mannheim', 'Freiburg', 'Heidelberg', 'Ulm', 'Heilbronn', 'Pforzheim'],
        'NI': ['Hannover', 'Braunschweig', 'Oldenburg', 'Osnabrück', 'Wolfsburg', 'Göttingen', 'Hildesheim', 'Salzgitter', 'Wilhelmshaven'],
        'SN': ['Leipzig', 'Dresden', 'Chemnitz', 'Zwickau', 'Plauen', 'Görlitz'],
        'ST': ['Magdeburg', 'Halle', 'Dessau', 'Wittenberg', 'Stendal'],
        'SH': ['Kiel', 'Lübeck', 'Flensburg', 'Neumünster', 'Norderstedt', 'Elmshorn'],
        'TH': ['Erfurt', 'Jena', 'Weimar', 'Gera', 'Gotha'],
        'RP': ['Mainz', 'Ludwigshafen', 'Koblenz', 'Trier', 'Kaiserslautern', 'Worms', 'Speyer'],
        'HB': ['Bremen', 'Bremerhaven'],
        'BB': ['Potsdam', 'Cottbus', 'Frankfurt (Oder)', 'Brandenburg', 'Oranienburg'],
        'SL': ['Saarbrücken', 'Neunkirchen', 'Homburg', 'Völklingen'],
        'MV': ['Rostock', 'Schwerin', 'Stralsund', 'Greifswald', 'Neubrandenburg', 'Wismar']
    };

    // Detect state from city (Only if country is DE/Default)
    if (country === 'DE') {
        for (const [stateCode, cities] of Object.entries(stateMapping)) {
            if (cities.some(c => city.includes(c) || cLower.includes(c.toLowerCase()))) {
                state = stateCode;
                break;
            }
        }
    }

    // Austria detection
    const austrianCities = ['Wien', 'Vienna', 'Salzburg', 'Graz', 'Linz', 'Innsbruck', 'Klagenfurt', 'Villach', 'Wels', 'Steyr', 'Leonding', 'Kufstein', 'Wolfsberg', 'Krems', 'Baden', 'Leoben', 'Feldkirch', 'Bregenz', 'Dornbirn', 'Eisenstadt', 'Sankt Pölten', 'Wiener Neustadt', 'Pressbaum']; // Added Pressbaum
    if (austrianCities.some(c => city.includes(c) || cLower.includes(c.toLowerCase()))) {
        country = 'AT';
        state = null; // Reset state if it was falsely matched to DE
    }

    // Switzerland detection
    const swissCities = ['Zürich', 'Zurich', 'Genève', 'Geneva', 'Genf', 'Basel', 'Bern', 'Lausanne', 'Luzern', 'Lucerne', 'Lugano', 'St. Gallen', 'Winterthur', 'Aarau', 'Zug', 'Neuchâtel', 'Fribourg', 'Sion', 'Chur', 'Frauenfeld', 'Thun', 'Biel', 'Bienne'];
    if (swissCities.some(c => city.includes(c) || cLower.includes(c.toLowerCase()))) {
        country = 'CH';
        state = null;
    }

    // IMPORTANT: Preserve ZIP code!
    return { city, state, country, zip: zipRaw };
};

const AdminImports = () => {
    const { t, language } = useLanguage();
    usePageTitle('Admin - Veri İçe Aktarma Yönetimi');

    const [imports, setImports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');
    const [stats, setStats] = useState({ pending: 0, rejected: 0, duplicate: 0, approved: 0 });
    const [scraperStatus, setScraperStatus] = useState({ status: 'idle', last_run_finished_at: null });
    const [isTriggering, setIsTriggering] = useState(false);
    const [isDeepScrape, setIsDeepScrape] = useState(false);

    // AI Smart Fix States
    const [fixingItem, setFixingItem] = useState(null);
    const [aiSuggestion, setAiSuggestion] = useState(null);
    const [isFixing, setIsFixing] = useState(false);
    const [showFixModal, setShowFixModal] = useState(false);
    const [adminCities, setAdminCities] = useState([]);

    // Advanced Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(() => {
        const stored = sessionStorage.getItem('admin_imports_last_cat');
        // If stored value is a UUID or special keyword, use it; otherwise default to 'all'
        const isValid = stored === 'all' || stored === 'mapped' || stored === 'unmapped' ||
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(stored);
        return isValid ? stored : 'all';
    });
    const [cityFilterType, setCityFilterType] = useState(() => sessionStorage.getItem('admin_imports_last_city') || 'all');
    const [selectedScrapeCategory, setSelectedScrapeCategory] = useState('all');
    const [contactFilter, setContactFilter] = useState(() => sessionStorage.getItem('admin_imports_last_contact') || 'all');
    const [selectedItems, setSelectedItems] = useState([]);
    const [showHelp, setShowHelp] = useState(false);
    const [citiesMap, setCitiesMap] = useState({});
    const [dbCategories, setDbCategories] = useState([]); // {id, name} from categories table

    // Smart Merge States
    const [mergingItem, setMergingItem] = useState(null);
    const [showMergeModal, setShowMergeModal] = useState(false);
    const [isScanning, setIsScanning] = useState(false);

    // Edit Modal States
    const [editingItem, setEditingItem] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    const [isOptimizing, setIsOptimizing] = useState(false);
    const [isOptimizingPending, setIsOptimizingPending] = useState(false);
    const [confirmState, setConfirmState] = useState({ prod: false, pending: false });
    const [optimizationLogs, setOptimizationLogs] = useState('');

    // Auto-Refresh Control
    const [isAutoRefresh, setIsAutoRefresh] = useState(() => {
        const saved = localStorage.getItem('admin_imports_auto_refresh');
        return saved !== null ? JSON.parse(saved) : true;
    });

    useEffect(() => {
        localStorage.setItem('admin_imports_auto_refresh', JSON.stringify(isAutoRefresh));
    }, [isAutoRefresh]);

    // Bulk selection handlers
    const handleSelectItem = (id) => {
        setSelectedItems(prev =>
            prev.includes(id)
                ? prev.filter(itemId => itemId !== id)
                : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedItems.length === filteredImports.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(filteredImports.map(item => item.id));
        }
    };

    const fetchStats = async (showSpinner = false) => {
        if (showSpinner) setLoading(true);
        const statuses = ['pending', 'rejected', 'duplicate', 'approved'];
        const counts = { pending: 0, rejected: 0, duplicate: 0, approved: 0 };

        try {
            for (const status of statuses) {
                const { count, error } = await supabase
                    .from('vendor_imports')
                    .select('*', { count: 'exact', head: true })
                    .eq('status', status);

                if (!error && count !== null) {
                    counts[status] = count;
                }
            }
            setStats(counts);
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            if (showSpinner) setLoading(false);
        }
    };

    const fetchImports = async (forceSpinner = false) => {
        if (forceSpinner) setLoading(true);
        try {
            let query = supabase.from('vendor_imports').select('*');

            if (filter === 'pending') {
                query = query.eq('status', 'pending');
            } else if (filter === 'rejected') {
                query = query.eq('status', 'rejected');
            } else if (filter === 'duplicate') {
                query = query.eq('status', 'duplicate');
            } else if (filter === 'approved') {
                query = query.eq('status', 'approved');
            }

            if (selectedCategory !== 'all') {
                if (selectedCategory === 'mapped') {
                    query = query.not('category_id', 'is', null);
                } else if (selectedCategory === 'unmapped') {
                    query = query.is('category_id', null);
                } else {
                    query = query.eq('category_id', selectedCategory);
                }
            }

            if (cityFilterType === 'mapped') {
                query = query.not('city_id', 'is', null);
            } else if (cityFilterType === 'unmapped') {
                query = query.is('city_id', null);
            }

            if (contactFilter === 'has_email') {
                query = query.not('email', 'is', null).neq('email', '');
            } else if (contactFilter === 'has_phone') {
                query = query.not('phone', 'is', null).neq('phone', '');
            } else if (contactFilter === 'has_website') {
                query = query.not('website', 'is', null).neq('website', '');
            } else if (contactFilter === 'has_all') {
                query = query.not('email', 'is', null).neq('email', '')
                    .not('phone', 'is', null).neq('phone', '')
                    .not('website', 'is', null).neq('website', '');
            } else if (contactFilter === 'has_both') {
                query = query.not('email', 'is', null).neq('email', '').not('phone', 'is', null).neq('phone', '');
            }

            const { data, error } = await query
                .order('collected_at', { ascending: false })
                .limit(1000);

            if (error) throw error;
            setImports(data || []);
        } catch (error) {
            console.error('Error fetching imports:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchScraperStatus = async () => {
        try {
            const { data } = await supabase.from('scraper_status').select('*').eq('id', 'hp24_main').maybeSingle();
            if (data) setScraperStatus(data);
        } catch (e) {
            console.error('Error fetching scraper status:', e);
        }
    };

    const fetchCities = async () => {
        try {
            const { data, error } = await supabase.from('admin_cities').select('id, name');
            if (error) throw error;
            const map = {};
            data.forEach(c => { map[c.id] = c.name; });
            setCitiesMap(map);
            setAdminCities(data.map(c => c.name));
        } catch (e) {
            console.error('Error fetching cities:', e);
        }
    };

    const fetchCategories = async () => {
        try {
            const { data, error } = await supabase.from('categories').select('id, name').order('name');
            if (error) throw error;
            setDbCategories(data || []);
        } catch (e) {
            console.error('Error fetching categories:', e);
        }
    };

    useEffect(() => {
        fetchStats(true);
        fetchImports(true);
        fetchScraperStatus();
        fetchCities();
        fetchCategories();

        let interval;
        if (isAutoRefresh) {
            interval = setInterval(() => {
                fetchScraperStatus();
                // Only refresh list if scraper is running to see progress
            }, 5000);
        }
        return () => clearInterval(interval);
    }, [filter, selectedCategory, cityFilterType, contactFilter, isAutoRefresh]);

    const handleTriggerScraper = async () => {
        setIsTriggering(true);
        try {
            const { error } = await supabase.rpc('trigger_scraper', {
                p_category: selectedScrapeCategory === 'all' ? null : selectedScrapeCategory,
                p_deep_sync: isDeepScrape
            });
            if (error) throw error;
            fetchScraperStatus();
        } catch (e) {
            console.error('Trigger Scraper Error:', e);
            alert('Hata: ' + e.message);
        } finally {
            setIsTriggering(false);
        }
    };

    const handleApprove = async (importItem) => {
        console.log('DEBUG: handleApprove started (NO CONFIRM) for:', importItem.id);

        // window.confirm bypass for environments that block dialogs
        console.log('DEBUG: Skipping confirmation dialog');

        console.log('DEBUG: Setting loading to true');
        setLoading(true);
        console.log('DEBUG: loading state set to current value:', true);

        try {
            console.log('DEBUG: Starting splitZipCity for:', importItem.city_raw);
            const { city: splitCity, zip: cleanZip, countryHint } = splitZipCity(importItem.city_raw);
            console.log('DEBUG: Split results:', { splitCity, cleanZip, countryHint });

            const rawCity = (importItem.city_id && citiesMap[importItem.city_id])
                ? citiesMap[importItem.city_id]
                : splitCity;
            console.log('DEBUG: rawCity resolved:', rawCity);

            const loc = normalizeLocation(rawCity, cleanZip, countryHint);
            console.log('DEBUG: normalizeLocation result:', loc);

            const vendorId = generateUUID();
            console.log('DEBUG: Generated vendorId:', vendorId);

            // Format social media safely
            let socialMediaObj = {};
            if (importItem.social_media) {
                try {
                    socialMediaObj = typeof importItem.social_media === 'string'
                        ? JSON.parse(importItem.social_media)
                        : importItem.social_media;
                } catch (e) {
                    console.warn('Social media parse error:', e);
                }
            }

            // Lookup category NAME from UUID
            let categoryName = 'Other';
            if (importItem.category_id) {
                const foundCat = dbCategories.find(c => c.id === importItem.category_id);
                categoryName = foundCat?.name || 'Other';
            }

            const insertData = {
                id: vendorId,
                business_name: importItem.business_name || 'İsimsiz İşletme',
                category: categoryName,
                city: loc.city,
                zip_code: loc.zip,
                state: loc.state,
                country: loc.country,
                description: importItem.description || '',
                price_range: importItem.price_range || '',
                is_active: true,
                is_claimed: false,
                is_verified: true,
                subscription_tier: 'free',
                contact_email: importItem.email,
                contact_phone: importItem.phone,
                website_url: importItem.website,
                scraper_source_url: importItem.source_url,
                address: importItem.address,
                social_media: socialMediaObj
            };

            const { error: vendorError } = await supabase
                .from('vendors')
                .insert([insertData]);

            if (vendorError) {
                console.error('DEBUG - Vendor Insert Error Details:', vendorError);
                alert(`❌ Kayıt Hatası (Vendor):\nKod: ${vendorError.code}\nMesaj: ${vendorError.message}\nDetay: ${vendorError.details || 'Yok'}`);
                throw vendorError;
            }

            const { error: iErr } = await supabase
                .from('vendor_imports')
                .update({
                    status: 'approved',
                    created_vendor_id: vendorId,
                    processed_at: new Date()
                })
                .eq('id', importItem.id);

            if (iErr) {
                console.error('Import Update Error:', iErr);
                alert(`⚠️ Uyarı: Vendor oluşturuldu ama import statüsü güncellenemedi.\n${iErr.message}`);
            }

            await fetchImports(true);
            await fetchStats(true);
            console.log('DEBUG: Approval flow complete for:', importItem.id);
        } catch (error) {
            console.error('Approval error:', error);
            // Non-blocking alert fallback
            console.warn('UI Alert suppressed:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOptimizeData = async () => {
        setIsOptimizing(true);
        setOptimizationLogs('Başlatılıyor...');
        console.log('[AdminImports] Starting handleOptimizeData');
        try {
            const { data: vendors, error: fetchError } = await supabase
                .from('vendors')
                .select('id, city, zip_code, state, country');

            if (fetchError) throw fetchError;

            let updateCount = 0;
            for (let i = 0; i < vendors.length; i++) {
                const v = vendors[i];
                let currentCity = v.city;
                let currentZip = v.zip_code;

                const split = splitZipCity(v.city);
                if (split && split.zip) {
                    currentCity = split.city;
                    currentZip = split.zip;
                }

                const loc = normalizeLocation(currentCity, currentZip, split?.countryHint);

                if (loc.city !== v.city || loc.zip !== v.zip_code || loc.state !== (v.state || null) || loc.country !== (v.country || 'DE')) {
                    await supabase
                        .from('vendors')
                        .update({
                            city: loc.city,
                            zip_code: loc.zip,
                            state: loc.state,
                            country: loc.country
                        })
                        .eq('id', v.id);

                    updateCount++;
                }

                if (i % 20 === 0) {
                    setOptimizationLogs(`Düzenleniyor: %${Math.round(((i + 1) / vendors.length) * 100)} (${updateCount} güncelleme)`);
                }
            }

            alert(`✅ Optimizasyon tamamlandı! ${updateCount} kayıt düzenlendi.`);
        } catch (error) {
            console.error('Optimization error:', error);
            alert('Hata: ' + error.message);
        } finally {
            setIsOptimizing(false);
            setOptimizationLogs('');
        }
    };

    const handleOptimizeImports = async () => {
        setIsOptimizingPending(true);
        setOptimizationLogs('🔍 Bekleyen veriler taranıyor...');
        try {
            // Fetch pending items - Increased limit to handle large datasets
            const { data: pendingItems, error: fetchError } = await supabase
                .from('vendor_imports')
                .select('id, city_raw, city_id, category_raw, category_id, status')
                .eq('status', 'pending')
                .limit(10000);

            if (fetchError) throw fetchError;

            // Build comprehensive city list for matching
            const { data: dbCities } = await supabase.from('admin_cities').select('id, name');
            const cityNameLookup = {};

            // Aggressive indexing for DB cities
            dbCities?.forEach(c => {
                // Use NFC normalization to handle diaereses consistently
                const normName = (c.name || '').normalize('NFC').toLowerCase();
                cityNameLookup[normName] = c.id;

                // Index simplified parts: "München (Munich)" -> "münchen", "munich"
                const parts = normName.split(/[\(\)\/]/).map(p => p.trim()).filter(p => p.length > 1);
                parts.forEach(p => {
                    if (!cityNameLookup[p]) cityNameLookup[p] = c.id;
                    const cleanP = p.replace(/[^a-z0-9]/gi, '');
                    if (cleanP && !cityNameLookup[cleanP]) cityNameLookup[cleanP] = c.id;
                });
            });

            // Use locally fetched cities for STEP 2 matching to avoid stale state
            const dbCityNames = dbCities?.map(c => c.name) || [];
            const allCitiesForMatch = [...new Set([...CITIES, ...dbCityNames])];

            let updateCount = 0;
            let fuzzyMatchCount = 0;
            let zipMatchCount = 0;
            let aiMatchCount = 0;
            let catMatchCount = 0;
            let zipPreservedCount = 0;
            let missingIdCities = new Set();

            for (let i = 0; i < pendingItems.length; i++) {
                const item = pendingItems[i];
                const { city: splitCity, zip: cleanZip, countryHint } = splitZipCity(item.city_raw);

                // STEP 1: Try normalizeLocation (canonical + typos)
                let loc = normalizeLocation(splitCity, cleanZip, countryHint);
                let matchedCity = (loc.city || '').normalize('NFC');
                let wasMatched = false;
                let usedZipMatch = false;

                // STEP 2: Check if already in known city list
                const matchedLower = matchedCity.toLowerCase();
                if (allCitiesForMatch.some(c => (c || '').normalize('NFC').toLowerCase() === matchedLower)) {
                    wasMatched = true;

                    // CRITICAL CROSS-CHECK: If we matched a German city but the ZIP is 4-digits (AT/CH),
                    // it is highly likely a false positive (e.g., "3021 Hannover" error).
                    if (cleanZip && cleanZip.length === 4) {
                        const majorGermanCities = ['Hannover', 'Hamburg', 'Berlin', 'München (Munich)', 'Köln (Cologne)', 'Frankfurt am Main', 'Stuttgart', 'Düsseldorf'];
                        if (majorGermanCities.includes(matchedCity)) {
                            console.warn(`[VALIDATE] Detected geographic mismatch: ZIP ${cleanZip} with German city ${matchedCity}. Re-evaluating...`);
                            wasMatched = false; // Force ZIP-based matching in Step 3
                        }
                    }
                }

                // STEP 3: If NOT matched AND we have a ZIP, try ZIP-based matching FIRST
                // This ensures small towns get matched to their regional major city
                if (!wasMatched && cleanZip) {
                    const zipBasedCity = getMajorCityFromZip(cleanZip);
                    if (zipBasedCity) {
                        matchedCity = zipBasedCity;
                        loc = normalizeLocation(zipBasedCity, cleanZip);
                        zipMatchCount++;
                        usedZipMatch = true;
                        wasMatched = true;
                    }
                }

                // STEP 4: If still not matched (no ZIP or ZIP not in map), try fuzzy matching
                if (!wasMatched) {
                    const fuzzyMatch = findBestCityMatch(splitCity, allCitiesForMatch);
                    if (fuzzyMatch) {
                        matchedCity = fuzzyMatch;
                        loc = normalizeLocation(fuzzyMatch, cleanZip);
                        fuzzyMatchCount++;
                        wasMatched = true;
                    }
                }

                // STEP 5: If still not matched, try AI matching (only for unknown cities)
                let usedAiMatch = false;
                if (!wasMatched) {
                    // Skip known non-geographic terms
                    const skipTerms = ['überregional', 'deutschlandweit', 'bundesweit', 'germany', 'deutschland', 'bilinmiyor', 'none', 'n/a', 'null', 'unknown'];
                    const isSkipTerm = skipTerms.some(term => splitCity.toLowerCase().includes(term));

                    if (!isSkipTerm && splitCity.length > 2) {
                        try {
                            // AI Suggestion Log
                            const logPrefix = `⚡ %${Math.round(((i + 1) / pendingItems.length) * 100)}`;
                            setOptimizationLogs(`${logPrefix} | AI Analizi: ${splitCity}...`);

                            // Rate limiting: wait 1.2s
                            await new Promise(resolve => setTimeout(resolve, 1200));

                            // Pass countryHint and cleanZip to AI for better context
                            const aiSuggestion = await suggestCity(splitCity, allCitiesForMatch, splitCity.countryHint, cleanZip);

                            if (aiSuggestion && aiSuggestion !== 'null' && aiSuggestion.toLowerCase() !== 'null') {
                                matchedCity = aiSuggestion;
                                loc = normalizeLocation(aiSuggestion, cleanZip, splitCity.countryHint);
                                aiMatchCount++;
                                usedAiMatch = true;
                                wasMatched = true;
                            }
                        } catch (aiError) {
                            // If rate limited, wait longer and continue
                            if (aiError.message?.includes('429') || aiError.message?.includes('rate')) {
                                console.warn(`Rate limited, waiting 5s before continue...`);
                                await new Promise(resolve => setTimeout(resolve, 5000));
                            } else {
                                console.warn(`AI match failed for "${splitCity}":`, aiError.message);
                            }
                        }
                    }
                }

                // STEP 6: Category Matching (if missing or dom-scraped)
                let matchedCategory = item.category_id;
                let usedCatAiMatch = false;

                const isInvalidCategory = !matchedCategory || matchedCategory === 'dom-scraped' || matchedCategory === 'Uncategorized';

                if (isInvalidCategory && item.category_raw) {
                    try {
                        // Rate limiting wait
                        await new Promise(resolve => setTimeout(resolve, 800));

                        const aiCatSuggestion = await suggestCategory(item.category_raw, CATEGORIES);
                        if (aiCatSuggestion && aiCatSuggestion !== 'null') {
                            matchedCategory = aiCatSuggestion;
                            usedCatAiMatch = true;
                            catMatchCount++;
                        }
                    } catch (catError) {
                        console.warn(`Category AI match failed for "${item.category_raw}":`, catError.message);
                    }
                }

                // Build output: Use clean city name, keep original in tag if changed
                let newCityRaw = matchedCity;
                if (usedZipMatch || (usedAiMatch && matchedCity !== splitCity)) {
                    // Keep the clean city name, preserve full original string for safety
                    newCityRaw = `${matchedCity} [eski: ${item.city_raw}]`;
                } else if (cleanZip && matchedCity !== splitCity) {
                    // Catch situations where ZIP was present but didn't trigger usedZipMatch specifically
                    newCityRaw = `${matchedCity} [eski: ${item.city_raw}]`;
                }

                // STEP 7: Resolve City ID from DB
                // Try full name match, then simplified versions with normalization
                const finalMatchedLower = matchedCity.toLowerCase().normalize('NFC');
                let solvedCityId = cityNameLookup[finalMatchedLower];

                if (!solvedCityId) {
                    const simplified = finalMatchedLower.replace(/\s*\(.*?\)\s*/g, '').trim();
                    const clean = simplified.replace(/[^a-z0-9]/gi, '');
                    solvedCityId = cityNameLookup[simplified] || cityNameLookup[clean];
                }

                // If name matched but ID is still missing, track it for reporting
                if (!solvedCityId && wasMatched) {
                    missingIdCities.add(matchedCity);
                }

                // STEP 8: Force ID Sync if missing from item but found in lookup
                const needsIdSync = solvedCityId && solvedCityId !== item.city_id;
                const needsNameSync = newCityRaw !== item.city_raw;
                const needsCatSync = matchedCategory !== item.category_id;

                // Only update if something changed
                if (needsNameSync || needsCatSync || needsIdSync) {
                    const updatePayload = {
                        city_raw: newCityRaw,
                        category_id: matchedCategory
                    };

                    // Only update ID if we actually solved it or it was already there
                    if (solvedCityId) updatePayload.city_id = solvedCityId;

                    await supabase
                        .from('vendor_imports')
                        .update(updatePayload)
                        .eq('id', item.id);
                    updateCount++;
                }

                // Progress update every 10 records for more live feeling on large sets
                if (i % 10 === 0 || i === pendingItems.length - 1) {
                    const percent = Math.round(((i + 1) / pendingItems.length) * 100);
                    setOptimizationLogs(`⚡ %${percent} | ${updateCount} Güncelleme | Şehir(ZIP:${zipMatchCount} AI:${aiMatchCount}) | Kategori AI:${catMatchCount}`);
                    // Live fetch to show badges during process
                    fetchImports();
                }
            }

            fetchImports(true);
            fetchStats(true);

            let missingInfo = "";
            if (missingIdCities.size > 0) {
                missingInfo = `\n\n⚠️ Dikkat: Aşağıdaki şehirler isim olarak eşleşti ancak admin_cities tablosunda ID'leri bulunamadı. Bu şehirleri Şehir Yönetimi'nden eklemelisiniz:\n- ${Array.from(missingIdCities).slice(0, 10).join(', ')}${missingIdCities.size > 10 ? '...' : ''}`;
            }

            alert(`✅ Akıllı eşleştirme tamamlandı!\n\n📊 Sonuç:\n- ${updateCount} kayıt güncellendi\n- ${catMatchCount} kategori AI ile eşleşti\n- ${zipMatchCount} ZIP-tabanlı şehir eşleşti\n- ${aiMatchCount} AI şehir eşleşme${missingInfo}`);
        } catch (error) {
            console.error('Import optimization error:', error);
            alert('Hata: ' + error.message);
        } finally {
            setIsOptimizingPending(false);
            setOptimizationLogs('');
        }
    };

    const handleReject = async (id) => {
        if (!confirm('Bu kaydı reddetmek istediğinize emin misiniz?')) return;
        try {
            await supabase.from('vendor_imports').update({ status: 'rejected', processed_at: new Date() }).eq('id', id);
            fetchImports();
            fetchStats();
        } catch (e) {
            console.error('Reject Error:', e);
        }
    };

    // Kalıcı silme fonksiyonu
    const handleHardDelete = async (id) => {
        if (!confirm('⚠️ DİKKAT: Bu kaydı kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz!')) return;
        try {
            const { error } = await supabase.from('vendor_imports').delete().eq('id', id);
            if (error) {
                console.error('Hard Delete Error:', error);
                alert('Silme hatası: ' + error.message);
                return;
            }
            fetchImports();
            fetchStats();
        } catch (e) {
            console.error('Hard Delete Error:', e);
            alert('Silme hatası: ' + e.message);
        }
    };

    const handleBulkApprove = async () => {
        console.log('DEBUG: handleBulkApprove entry (NO CONFIRM)');

        const itemsToApprove = imports.filter(item => {
            const isMatch = selectedItems.some(sid => String(sid) === String(item.id));
            if (selectedItems.includes(item.id) || isMatch) return true;
            return false;
        });

        console.log('DEBUG: itemsToApprove size:', itemsToApprove.length);

        if (itemsToApprove.length === 0) {
            console.error('DEBUG: No items found for bulk approval');
            return;
        }

        console.log('DEBUG: Proceeding without confirmation dialog');
        setLoading(true);
        let successCount = 0;
        let failCount = 0;

        try {
            for (const item of itemsToApprove) {
                try {
                    const vendorId = generateUUID();
                    const { city: splitCity, zip: cleanZip, countryHint } = splitZipCity(item.city_raw);
                    const rawCity = (item.city_id && citiesMap[item.city_id])
                        ? citiesMap[item.city_id]
                        : splitCity;

                    const loc = normalizeLocation(rawCity, cleanZip, countryHint);

                    // Format social media safely
                    let socialMediaObj = {};
                    if (item.social_media) {
                        try {
                            socialMediaObj = typeof item.social_media === 'string'
                                ? JSON.parse(item.social_media)
                                : item.social_media;
                        } catch (e) {
                            console.warn('Social media parse error:', e);
                        }
                    }

                    // Lookup category NAME from UUID
                    let categoryName = 'Other';
                    if (item.category_id) {
                        const foundCat = dbCategories.find(c => c.id === item.category_id);
                        categoryName = foundCat?.name || 'Other';
                    }

                    const { error: vErr } = await supabase.from('vendors').insert([{
                        id: vendorId,
                        business_name: item.business_name || 'İsimsiz İşletme',
                        category: categoryName,
                        city: loc.city,
                        zip_code: loc.zip,
                        state: loc.state,
                        country: loc.country,
                        description: item.description || '',
                        price_range: item.price_range || '',
                        is_active: true,
                        is_claimed: false,
                        is_verified: true,
                        subscription_tier: 'free',
                        contact_email: item.email,
                        contact_phone: item.phone,
                        website_url: item.website,
                        scraper_source_url: item.source_url,
                        address: item.address,
                        social_media: socialMediaObj
                    }]);

                    if (vErr) {
                        console.error('Vendor Insert Error:', vErr);
                        failCount++;
                        // For the first error in bulk, show a detailed alert
                        if (failCount === 1) {
                            alert(`❌ Toplu İşlem Hatası (İlk Kayıt):\nKod: ${vErr.code}\nMesaj: ${vErr.message}`);
                        }
                        continue;
                    }

                    const { error: iErr } = await supabase.from('vendor_imports').update({
                        status: 'approved',
                        created_vendor_id: vendorId,
                        processed_at: new Date()
                    }).eq('id', item.id);

                    if (iErr) console.error('Import Update Error:', iErr);
                    successCount++;
                } catch (e) {
                    console.error('Bulk Approve Loop Error:', e);
                    failCount++;
                }
            }
        } catch (e) {
            console.error('Bulk Approve Critical Error:', e);
            alert('Toplu onaylama işlemi sırasında genel bir hata oluştu.');
        } finally {
            setSelectedItems([]);
            await fetchImports(true);
            await fetchStats(true);
            setLoading(false);

            if (itemsToApprove.length > 0) {
                console.log(`DEBUG: Bulk approval results - Success: ${successCount}, Failed: ${failCount}`);
            }
        }
    };

    const handleBulkReject = async () => {
        if (selectedItems.length === 0) return;
        if (!confirm(`${selectedItems.length} kaydı reddetmek istiyor musunuz?`)) return;

        setLoading(true);
        try {
            const { error } = await supabase
                .from('vendor_imports')
                .update({ status: 'rejected', processed_at: new Date() })
                .in('id', selectedItems);

            if (error) throw error;

            setSelectedItems([]);
            await fetchImports();
            await fetchStats();
            alert('✅ Seçilen kayıtlar reddedildi.');
        } catch (e) {
            console.error('Bulk Reject Error:', e);
            alert('Hata: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    const filteredImports = imports.filter(item => {
        const search = searchTerm.toLowerCase();
        return item.business_name?.toLowerCase().includes(search) ||
            item.city_raw?.toLowerCase().includes(search) ||
            item.category_raw?.toLowerCase().includes(search) ||
            item.category_id?.toLowerCase().includes(search);
    });

    const categoryCounts = {};
    imports.forEach(item => {
        if (!item.category_id) {
            categoryCounts['_unmapped'] = (categoryCounts['_unmapped'] || 0) + 1;
        } else {
            categoryCounts['_mapped'] = (categoryCounts['_mapped'] || 0) + 1;
            categoryCounts[item.category_id] = (categoryCounts[item.category_id] || 0) + 1;
        }
    });

    const tabs = [
        { id: 'pending', label: 'Bekleyenler', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
        { id: 'duplicate', label: 'Olası Tekrar', icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
        { id: 'rejected', label: 'Reddedilenler', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
        { id: 'approved', label: 'Onaylananlar', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' }
    ];

    return (
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto min-h-screen bg-gray-50">
            {/* Header section with Stats and Trigger Scraper */}
            <div className="mb-8 flex flex-col md:flex-row gap-6 items-start justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-pink-100 rounded-xl">
                        <Database className="w-8 h-8 text-pink-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Veri İçe Aktarma Yönetimi</h1>
                        <p className="text-gray-500 text-sm font-medium">Rakip sitelerden çekilen verileri inceleyin, düzenleyin ve onaylayın.</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <select
                        value={selectedScrapeCategory}
                        onChange={(e) => setSelectedScrapeCategory(e.target.value)}
                        className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-pink-500 transition-all border shadow-sm"
                        disabled={scraperStatus.status === 'running' || isTriggering}
                    >
                        <option value="all">Tümü</option>
                        {CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>
                                {t('categories.' + getCategoryTranslationKey(cat))}
                            </option>
                        ))}
                    </select>

                    <label
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all shadow-sm border
                            ${isDeepScrape
                                ? 'bg-green-50 border-green-400 text-green-700'
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                            }
                            ${scraperStatus.status === 'running' ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                    >
                        <input
                            type="checkbox"
                            checked={isDeepScrape}
                            onChange={(e) => setIsDeepScrape(e.target.checked)}
                            className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                            disabled={scraperStatus.status === 'running'}
                        />
                        <span>{isDeepScrape ? '✓ Derin Tarama Aktif' : 'Derin Tarama'}</span>
                    </label>

                    <button
                        onClick={handleTriggerScraper}
                        disabled={scraperStatus.status === 'running' || isTriggering}
                        className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm
                            ${scraperStatus.status === 'running'
                                ? 'bg-pink-100 text-pink-600 cursor-not-allowed'
                                : 'bg-pink-600 text-white hover:bg-pink-700 active:scale-95'
                            }`}
                    >
                        {scraperStatus.status === 'running' ? (
                            <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                Güncelleniyor...
                            </>
                        ) : (
                            <>
                                <Zap className="w-4 h-4" />
                                {selectedScrapeCategory === 'all' ? 'Sistemi Güncelle' : 'Kategoriyi Güncelle'}
                            </>
                        )}
                    </button>

                    <button
                        onClick={() => {
                            if (!confirmState.prod) {
                                setConfirmState(prev => ({ ...prev, prod: true }));
                                setTimeout(() => setConfirmState(prev => ({ ...prev, prod: false })), 4000);
                                return;
                            }
                            handleOptimizeData();
                            setConfirmState(prev => ({ ...prev, prod: false }));
                        }}
                        disabled={isOptimizing || isOptimizingPending}
                        className={`flex items-center justify-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-semibold transition-all active:scale-95 disabled:opacity-50 shadow-md ${confirmState.prod ? 'bg-orange-600 ring-2 ring-orange-300 scale-105' : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:shadow-lg'}`}
                        title="Onaylanmış tedarikçilerin şehir verilerini temizler"
                    >
                        {isOptimizing ? (
                            <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                {optimizationLogs || 'Optimize Ediliyor...'}
                            </>
                        ) : (
                            <>
                                <Database className="w-4 h-4" />
                                {confirmState.prod ? 'EMİN MİSİN? (TEKRAR BAS)' : 'Verileri Optimize Et'}
                            </>
                        )}
                    </button>

                    <button
                        onClick={() => {
                            if (!confirmState.pending) {
                                setConfirmState(prev => ({ ...prev, pending: true }));
                                setTimeout(() => setConfirmState(prev => ({ ...prev, pending: false })), 4000);
                                return;
                            }
                            handleOptimizeImports();
                            setConfirmState(prev => ({ ...prev, pending: false }));
                        }}
                        disabled={isOptimizingPending || isOptimizing}
                        className={`flex items-center justify-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-semibold transition-all active:scale-95 disabled:opacity-50 shadow-md ${confirmState.pending ? 'bg-orange-600 ring-2 ring-orange-300 scale-105' : 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:shadow-lg'}`}
                        title="Bekleyen içe aktarmaların şehir verilerini temizler"
                    >
                        {isOptimizingPending ? (
                            <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                {optimizationLogs || 'Optimize Ediliyor...'}
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4" />
                                {confirmState.pending ? 'EMİN MİSİN? (TEKRAR BAS)' : 'Bekleyenleri Optimize Et'}
                            </>
                        )}
                    </button>

                    <button
                        onClick={() => { fetchImports(true); fetchStats(true); fetchScraperStatus(); }}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Listeyi Yenile
                    </button>

                    <label className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-200 transition-all">
                        <input
                            type="checkbox"
                            checked={isAutoRefresh}
                            onChange={(e) => setIsAutoRefresh(e.target.checked)}
                            className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                        />
                        <span className="text-xs font-semibold text-gray-700">
                            {isAutoRefresh ? 'Otomatik Güncelleme Açık' : 'Manüel Güncelleme'}
                        </span>
                    </label>
                </div>
            </div>

            {scraperStatus.status === 'running' && scraperStatus.logs && (
                <div className="mb-6 p-3 bg-pink-50 border border-pink-100 rounded-xl flex items-center gap-3 animate-pulse">
                    <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                    <span className="text-sm font-medium text-pink-700">
                        {scraperStatus.logs}
                    </span>
                </div>
            )}

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {tabs.map((tab) => {
                    const isActive = filter === tab.id;
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setFilter(tab.id)}
                            className={`relative flex items-center p-4 rounded-xl border transition-all duration-200 text-left hover:shadow-md
                                ${isActive
                                    ? 'bg-white border-pink-500 ring-1 ring-pink-500 shadow-md'
                                    : 'bg-white border-gray-200 hover:border-pink-300'
                                }
                            `}
                        >
                            <div className={`p-3 rounded-lg ${tab.bg} mr-4`}>
                                <Icon className={`w-6 h-6 ${tab.color}`} />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{tab.label}</p>
                                <p className="text-2xl font-bold text-gray-900">{stats[tab.id] || 0}</p>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 w-full flex items-center gap-3">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 sm:text-sm transition duration-150 ease-in-out"
                            placeholder="Firma, şehir veya kategori ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {searchTerm && (
                        <div className="whitespace-nowrap px-3 py-1 bg-pink-50 text-pink-700 text-xs font-bold rounded-full border border-pink-100 flex items-center gap-1.5 animate-in fade-in duration-300">
                            <Filter className="w-3 h-3" />
                            {filteredImports.length} sonuç bulundu
                        </div>
                    )}
                </div>

                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="block w-full md:w-64 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm rounded-lg appearance-none bg-white border shadow-sm"
                    >
                        <option value="all">Tüm Kategoriler ({stats[filter] || 0})</option>
                        <option value="mapped">✅ Eşleşenler ({categoryCounts['_mapped'] || 0})</option>
                        <option value="unmapped">⚠️ Eşleşmeyenler ({categoryCounts['_unmapped'] || 0})</option>
                        <optgroup label="Sistem Kategorileri">
                            {dbCategories.map(cat => (
                                <option key={cat.id} value={cat.id}>
                                    {t('categories.' + getCategoryTranslationKey(cat.name))} {categoryCounts[cat.id] ? `(${categoryCounts[cat.id]})` : ''}
                                </option>
                            ))}
                        </optgroup>
                    </select>

                    <select
                        value={cityFilterType}
                        onChange={(e) => setCityFilterType(e.target.value)}
                        className="block w-full md:w-40 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm rounded-lg appearance-none bg-white border shadow-sm"
                    >
                        <option value="all">Şehir Durumu</option>
                        <option value="mapped">✅ Tanımlı</option>
                        <option value="unmapped">❌ Tanımsız</option>
                    </select>

                    <select
                        value={contactFilter}
                        onChange={(e) => setContactFilter(e.target.value)}
                        className="block w-full md:w-40 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm rounded-lg appearance-none bg-white border shadow-sm"
                    >
                        <option value="all">İletişim (Tümü)</option>
                        <option value="has_email">E-posta Var</option>
                        <option value="has_phone">Telefon Var</option>
                        <option value="has_website">Websitesi Var</option>
                        <option value="has_both">E-posta & Telefon</option>
                        <option value="has_all">💎 Hepsi Var (3/3)</option>
                    </select>
                </div>
            </div>

            {/* Bulk Actions Bar */}
            {selectedItems.length > 0 && (
                <div className="bg-pink-50 p-4 rounded-xl border border-pink-100 mb-6 flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center gap-4">
                        <span className="text-pink-700 font-bold text-sm bg-white px-3 py-1 rounded-full shadow-sm">
                            {selectedItems.length} kayıt seçildi
                        </span>
                        <div className="h-4 w-px bg-pink-200"></div>
                        <button onClick={handleSelectAll} className="text-pink-600 hover:text-pink-800 text-sm font-semibold">Tümünü Bırak</button>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={handleBulkReject} className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg text-sm font-bold hover:bg-red-50 transition-colors">
                            <X className="w-4 h-4" /> Seçilenleri Reddet
                        </button>
                        <button onClick={handleBulkApprove} className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg text-sm font-bold hover:bg-pink-700 shadow-md transform hover:-translate-y-0.5 transition-all">
                            <Check className="w-4 h-4" /> Seçilenleri Onayla
                        </button>
                    </div>
                </div>
            )}

            {/* Imports Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider w-8">#</th>
                                <th className="px-4 py-4 text-left w-6">
                                    <input
                                        type="checkbox"
                                        checked={selectedItems.length === filteredImports.length && filteredImports.length > 0}
                                        onChange={handleSelectAll}
                                        className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                                    />
                                </th>
                                <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">İşletme Bilgileri</th>
                                <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Eşleşme Durumu</th>
                                <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Konum</th>
                                <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">İletişim</th>
                                <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Kaynak & Risk</th>
                                <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="px-4 py-20 text-center">
                                        <LoadingSpinner />
                                        <p className="mt-4 text-gray-500 font-medium">Veriler yükleniyor...</p>
                                    </td>
                                </tr>
                            ) : filteredImports.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-4 py-20 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="p-4 bg-gray-50 rounded-full mb-4">
                                                <Database className="w-12 h-12 text-gray-300" />
                                            </div>
                                            <p className="text-gray-400 font-bold text-lg">Kayıt Bulunamadı</p>
                                            <p className="text-gray-400 text-sm">Seçilen filtrelere uygun veri bulunmuyor.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredImports.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-3 py-4 text-xs font-bold text-gray-300">
                                            {index + 1}
                                        </td>
                                        <td className="px-4 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedItems.includes(item.id)}
                                                onChange={() => handleSelectItem(item.id)}
                                                className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                                            />
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="font-bold text-gray-900 group-hover:text-pink-600 transition-colors">{item.business_name}</div>
                                            <a
                                                href={item.source_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-[10px] text-blue-500 hover:text-blue-700 font-bold flex items-center gap-1 mt-1 truncate max-w-[200px] hover:underline"
                                                title={item.source_url}
                                            >
                                                <LinkIcon className="w-3 h-3" /> {item.source_url}
                                            </a>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex flex-col gap-1.5">
                                                <div className={`text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 w-fit
                                                    ${item.category_id ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                                                    {item.category_id ? <Check className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                                                    {item.category_id || 'Eşleşmedi'}
                                                </div>
                                                <div className="text-[10px] text-gray-400 font-bold pl-1 italic">Ham: {item.category_raw}</div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="text-sm font-semibold text-gray-700">{item.city_raw}</div>
                                                <div className={`text-[10px] px-2 py-0.5 rounded-full font-bold w-fit flex items-center gap-1
                                                    ${item.city_id ? 'bg-teal-50 text-teal-700' : 'bg-red-50 text-red-700'}`}>
                                                    {item.city_id ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                    {item.city_id ? 'Eşleşti' : 'Eşleşmedi'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex flex-col gap-1.5">
                                                {item.email && (
                                                    <div className="text-xs font-bold text-blue-600 flex items-center gap-2 bg-blue-50 px-2 py-1 rounded-lg w-fit">
                                                        <Mail className="w-3 h-3" /> {item.email}
                                                    </div>
                                                )}
                                                {item.phone && (
                                                    <div className="text-xs font-bold text-teal-600 flex items-center gap-2 bg-teal-50 px-2 py-1 rounded-lg w-fit">
                                                        <Phone className="w-3 h-3" /> {item.phone}
                                                    </div>
                                                )}
                                                {!item.email && !item.phone && <span className="text-xs text-gray-300 italic">Bilgi Yok</span>}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex flex-col gap-1">
                                                <a
                                                    href={item.source_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1 rounded-full w-fit transition-colors flex items-center gap-1.5"
                                                >
                                                    <ExternalLink className="w-3 h-3" />
                                                    {item.source_name}
                                                </a>
                                                <div className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold w-fit flex items-center gap-1 mt-1
                                                    ${item.duplicate_score > 70 ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                                                    {item.duplicate_score > 70 ? <AlertCircle className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                                                    {item.duplicate_score > 70 ? 'Yüksek Risk' : 'Güvenli'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => handleApprove(item)} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all shadow-sm" title="Onayla">
                                                    <Check className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleReject(item.id)} className="p-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-600 hover:text-white transition-all shadow-sm" title="Reddet">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleHardDelete(item.id)} className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-700 hover:text-white transition-all shadow-sm border border-red-300" title="Kalıcı Sil">
                                                    🗑️
                                                </button>
                                                <a href={item.source_url} target="_blank" rel="noreferrer" className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm" title="Kaynağa Git">
                                                    <LinkIcon className="w-4 h-4" />
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminImports;
