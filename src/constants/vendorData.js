export const CATEGORIES = [
    'Wedding Venues',
    'Bridal Fashion',
    'Hair & Make-Up',
    'Groom Suits',
    'Wedding Cakes',
    'Wedding Planners',
    'Wedding Cars',
    'Catering & Party Service',
    'Wedding Speakers (Trauredner)',
    'Flowers & Decoration',
    'Invitations & Stationery',
    'Wedding Rings',
    'Wedding Photography',
    'Wedding Videography',
    'Photobox',
    'DJs',
    'Musicians',
    'Entertainment'
];

export const getCategoryTranslationKey = (category) => {
    if (!category) return '';
    const cat = category.trim().toLowerCase();

    // Reverse bridge: map known Turkish/special names to English keys
    if (cat.includes('saç') && cat.includes('makyaj')) return 'hair_makeup';
    if (cat.includes('ven')) return 'wedding_venues';
    if (cat.includes('mekan')) return 'wedding_venues';
    if (cat.includes('salon')) return 'wedding_venues';
    if (cat.includes('foto')) return 'wedding_photography';
    if (cat.includes('video')) return 'wedding_videography';
    if (cat.includes('pasta')) return 'wedding_cakes';
    if (cat.includes('cake')) return 'wedding_cakes';
    if (cat.includes('dj')) return 'djs';
    if (cat.includes('müzik') || cat.includes('music')) return 'musicians';
    if (cat.includes('çiçek') || cat.includes('dekor')) return 'flowers_decoration';

    const mapping = {
        'Wedding Venues': 'wedding_venues',
        'Bridal Fashion': 'bridal_fashion',
        'Hair & Make-Up': 'hair_makeup',
        'Groom Suits': 'groom_suits',
        'Wedding Cakes': 'wedding_cakes',
        'Wedding Planners': 'wedding_planners',
        'Wedding Cars': 'wedding_cars',
        'Catering & Party Service': 'catering_party',
        'Wedding Speakers (Trauredner)': 'wedding_speakers',
        'Flowers & Decoration': 'flowers_decoration',
        'Invitations & Stationery': 'invitations_stationery',
        'Wedding Rings': 'wedding_rings',
        'Wedding Photography': 'wedding_photography',
        'Wedding Videography': 'wedding_videography',
        'Photobox': 'photobox',
        'DJs': 'djs',
        'Musicians': 'musicians',
        'Entertainment': 'entertainment',
        'Honeymoon': 'honeymoon'
    };
    return mapping[category] || category.toLowerCase().replace(/\s+/g, '_');
};

export const CATEGORY_SLUGS = {
    'wedding-venues': 'Wedding Venues',
    'dugun-salonlari': 'Wedding Venues',
    'bridal-fashion': 'Bridal Fashion',
    'hair-makeup': 'Hair & Make-Up',
    'groom-suits': 'Groom Suits',
    'wedding-cakes': 'Wedding Cakes',
    'wedding-planners': 'Wedding Planners',
    'wedding-cars': 'Wedding Cars',
    'catering-party': 'Catering & Party Service',
    'wedding-speakers': 'Wedding Speakers (Trauredner)',
    'flowers-decoration': 'Flowers & Decoration',
    'invitations-stationery': 'Invitations & Stationery',
    'wedding-rings': 'Wedding Rings',
    'wedding-photography': 'Wedding Photography',
    'dugun-fotografcilari': 'Wedding Photography',
    'wedding-videography': 'Wedding Videography',
    'photobox': 'Photobox',
    'djs': 'DJs',
    'musicians': 'Musicians',
    'entertainment': 'Entertainment'
};

export const getCategoryFromSlug = (slug) => {
    return CATEGORY_SLUGS[slug] || null;
};

export const getStateName = (stateId, countryCode = 'DE', lang = 'tr') => {
    if (!stateId) return null;
    const countryStates = STATES[countryCode] || STATES['DE'];
    const state = countryStates.find(s => s.id === stateId);
    if (!state) return stateId;
    return state[lang] || state['de'] || state['en'] || stateId;
};

export const COUNTRIES = [
    { code: 'DE', name: 'Germany', tr: 'Almanya', de: 'Deutschland' },
    { code: 'AT', name: 'Austria', tr: 'Avusturya', de: 'Österreich' },
    { code: 'CH', name: 'Switzerland', tr: 'İsviçre', de: 'Schweiz' }
];

export const STATES = {
    DE: [
        { id: 'BW', en: 'Baden-Württemberg', de: 'Baden-Württemberg', tr: 'Baden-Württemberg' },
        { id: 'BY', en: 'Bavaria', de: 'Bayern', tr: 'Bavyera' },
        { id: 'BE', en: 'Berlin', de: 'Berlin', tr: 'Berlin' },
        { id: 'BB', en: 'Brandenburg', de: 'Brandenburg', tr: 'Brandenburg' },
        { id: 'HB', en: 'Bremen', de: 'Bremen', tr: 'Bremen' },
        { id: 'HH', en: 'Hamburg', de: 'Hamburg', tr: 'Hamburg' },
        { id: 'HE', en: 'Hesse', de: 'Hessen', tr: 'Hessen' },
        { id: 'NI', en: 'Lower Saxony', de: 'Niedersachsen', tr: 'Aşağı Saksonya' },
        { id: 'MV', en: 'Mecklenburg-Vorpommern', de: 'Mecklenburg-Vorpommern', tr: 'Mecklenburg-Vorpommern' },
        { id: 'NW', en: 'North Rhine-Westphalia', de: 'Nordrhein-Westfalen', tr: 'Kuzey Ren-Vestfalya' },
        { id: 'RP', en: 'Rhineland-Palatinate', de: 'Rheinland-Pfalz', tr: 'Rheinland-Pfalz' },
        { id: 'SL', en: 'Saarland', de: 'Saarland', tr: 'Saarland' },
        { id: 'SN', en: 'Saxony', de: 'Sachsen', tr: 'Saksonya' },
        { id: 'ST', en: 'Saxony-Anhalt', de: 'Sachsen-Anhalt', tr: 'Saksonya-Anhalt' },
        { id: 'SH', en: 'Schleswig-Holstein', de: 'Schleswig-Holstein', tr: 'Schleswig-Holstein' },
        { id: 'TH', en: 'Thuringia', de: 'Thüringen', tr: 'Türingiya' }
    ],
    AT: [
        { id: 'B', en: 'Burgenland', de: 'Burgenland', tr: 'Burgenland' },
        { id: 'K', en: 'Carinthia', de: 'Kärnten', tr: 'Karintiya' },
        { id: 'N', en: 'Lower Austria', de: 'Niederösterreich', tr: 'Aşağı Avusturya' },
        { id: 'O', en: 'Upper Austria', de: 'Oberösterreich', tr: 'Yukarı Avusturya' },
        { id: 'S', en: 'Salzburg', de: 'Salzburg', tr: 'Salzburg' },
        { id: 'ST', en: 'Styria', de: 'Steiermark', tr: 'Styria' },
        { id: 'T', en: 'Tyrol', de: 'Tirol', tr: 'Tirol' },
        { id: 'V', en: 'Vorarlberg', de: 'Vorarlberg', tr: 'Vorarlberg' },
        { id: 'W', en: 'Vienna', de: 'Wien', tr: 'Viyana' }
    ],
    CH: [
        { id: 'ZH', en: 'Zurich', de: 'Zürich', tr: 'Zürih' },
        { id: 'BE', en: 'Bern', de: 'Bern', tr: 'Bern' },
        { id: 'LU', en: 'Lucerne', de: 'Luzern', tr: 'Luzern' },
        { id: 'UR', en: 'Uri', de: 'Uri', tr: 'Uri' },
        { id: 'SZ', en: 'Schwyz', de: 'Schwyz', tr: 'Schwyz' },
        { id: 'OW', en: 'Obwalden', de: 'Obwalden', tr: 'Obwalden' },
        { id: 'NW', en: 'Nidwalden', de: 'Nidwalden', tr: 'Nidwalden' },
        { id: 'GL', en: 'Glarus', de: 'Glarus', tr: 'Glarus' },
        { id: 'ZG', en: 'Zug', de: 'Zug', tr: 'Zug' },
        { id: 'FR', en: 'Fribourg', de: 'Freiburg', tr: 'Fribourg' },
        { id: 'SO', en: 'Solothurn', de: 'Solothurn', tr: 'Solothurn' },
        { id: 'BS', en: 'Basel-Stadt', de: 'Basel-Stadt', tr: 'Basel-City' },
        { id: 'BL', en: 'Basel-Landschaft', de: 'Basel-Landschaft', tr: 'Basel-Country' },
        { id: 'SH', en: 'Schaffhausen', de: 'Schaffhausen', tr: 'Schaffhausen' },
        { id: 'AR', en: 'Appenzell Ausserrhoden', de: 'Appenzell Ausserrhoden', tr: 'Appenzell Ausserrhoden' },
        { id: 'AI', en: 'Appenzell Innerrhoden', de: 'Appenzell Innerrhoden', tr: 'Appenzell Innerrhoden' },
        { id: 'SG', en: 'St. Gallen', de: 'St. Gallen', tr: 'St. Gallen' },
        { id: 'GR', en: 'Graubünden', de: 'Graubünden', tr: 'Graubünden' },
        { id: 'AG', en: 'Aargau', de: 'Aargau', tr: 'Aargau' },
        { id: 'TG', en: 'Thurgau', de: 'Thurgau', tr: 'Thurgau' },
        { id: 'TI', en: 'Ticino', de: 'Tessin', tr: 'Ticino' },
        { id: 'VD', en: 'Vaud', de: 'Waadt', tr: 'Vaud' },
        { id: 'VS', en: 'Valais', de: 'Wallis', tr: 'Valais' },
        { id: 'NE', en: 'Neuchâtel', de: 'Neuenburg', tr: 'Neuchâtel' },
        { id: 'GE', en: 'Geneva', de: 'Genf', tr: 'Cenevre' },
        { id: 'JU', en: 'Jura', de: 'Jura', tr: 'Jura' }
    ]
};

export const CITIES_BY_STATE = {
    // Germany - 16 States
    'BE': [{ id: 'Berlin', en: 'Berlin', de: 'Berlin', tr: 'Berlin' }],
    'HH': [{ id: 'Hamburg', en: 'Hamburg', de: 'Hamburg', tr: 'Hamburg' }],
    'BY': [
        { id: 'München', en: 'Munich', de: 'München', tr: 'Münih' },
        { id: 'Nürnberg', en: 'Nuremberg', de: 'Nürnberg', tr: 'Nürnberg' },
        { id: 'Augsburg', en: 'Augsburg', de: 'Augsburg', tr: 'Augsburg' },
        { id: 'Regensburg', en: 'Regensburg', de: 'Regensburg', tr: 'Regensburg' },
        { id: 'Ingolstadt', en: 'Ingolstadt', de: 'Ingolstadt', tr: 'Ingolstadt' },
        { id: 'Würzburg', en: 'Würzburg', de: 'Würzburg', tr: 'Würzburg' },
        { id: 'Erlangen', en: 'Erlangen', de: 'Erlangen', tr: 'Erlangen' },
        { id: 'Fürth', en: 'Fürth', de: 'Fürth', tr: 'Fürth' }
    ],
    'NW': [
        { id: 'Köln', en: 'Cologne', de: 'Köln', tr: 'Köln' },
        { id: 'Düsseldorf', en: 'Düsseldorf', de: 'Düsseldorf', tr: 'Düsseldorf' },
        { id: 'Dortmund', en: 'Dortmund', de: 'Dortmund', tr: 'Dortmund' },
        { id: 'Essen', en: 'Essen', de: 'Essen', tr: 'Essen' },
        { id: 'Duisburg', en: 'Duisburg', de: 'Duisburg', tr: 'Duisburg' },
        { id: 'Bochum', en: 'Bochum', de: 'Bochum', tr: 'Bochum' },
        { id: 'Wuppertal', en: 'Wuppertal', de: 'Wuppertal', tr: 'Wuppertal' },
        { id: 'Bielefeld', en: 'Bielefeld', de: 'Bielefeld', tr: 'Bielefeld' },
        { id: 'Bonn', en: 'Bonn', de: 'Bonn', tr: 'Bonn' },
        { id: 'Münster', en: 'Münster', de: 'Münster', tr: 'Münster' },
        { id: 'Gelsenkirchen', en: 'Gelsenkirchen', de: 'Gelsenkirchen', tr: 'Gelsenkirchen' },
        { id: 'Mönchengladbach', en: 'Mönchengladbach', de: 'Mönchengladbach', tr: 'Mönchengladbach' },
        { id: 'Aachen', en: 'Aachen', de: 'Aachen', tr: 'Aachen' }
    ],
    'HE': [
        { id: 'Frankfurt am Main', en: 'Frankfurt am Main', de: 'Frankfurt am Main', tr: 'Frankfurt am Main' },
        { id: 'Wiesbaden', en: 'Wiesbaden', de: 'Wiesbaden', tr: 'Wiesbaden' },
        { id: 'Kassel', en: 'Kassel', de: 'Kassel', tr: 'Kassel' },
        { id: 'Darmstadt', en: 'Darmstadt', de: 'Darmstadt', tr: 'Darmstadt' }
    ],
    'BW': [
        { id: 'Stuttgart', en: 'Stuttgart', de: 'Stuttgart', tr: 'Stuttgart' },
        { id: 'Karlsruhe', en: 'Karlsruhe', de: 'Karlsruhe', tr: 'Karlsruhe' },
        { id: 'Mannheim', en: 'Mannheim', de: 'Mannheim', tr: 'Mannheim' },
        { id: 'Freiburg', en: 'Freiburg', de: 'Freiburg', tr: 'Freiburg' },
        { id: 'Heidelberg', en: 'Heidelberg', de: 'Heidelberg', tr: 'Heidelberg' },
        { id: 'Ulm', en: 'Ulm', de: 'Ulm', tr: 'Ulm' }
    ],
    'NI': [
        { id: 'Hannover', en: 'Hanover', de: 'Hannover', tr: 'Hannover' },
        { id: 'Braunschweig', en: 'Brunswick', de: 'Braunschweig', tr: 'Braunschweig' },
        { id: 'Oldenburg', en: 'Oldenburg', de: 'Oldenburg', tr: 'Oldenburg' },
        { id: 'Osnabrück', en: 'Osnabrück', de: 'Osnabrück', tr: 'Osnabrück' }
    ],
    'SN': [
        { id: 'Leipzig', en: 'Leipzig', de: 'Leipzig', tr: 'Leipzig' },
        { id: 'Dresden', en: 'Dresden', de: 'Dresden', tr: 'Dresden' },
        { id: 'Chemnitz', en: 'Chemnitz', de: 'Chemnitz', tr: 'Chemnitz' }
    ],
    'ST': [
        { id: 'Magdeburg', en: 'Magdeburg', de: 'Magdeburg', tr: 'Magdeburg' },
        { id: 'Halle', en: 'Halle', de: 'Halle', tr: 'Halle' }
    ],
    'SH': [
        { id: 'Kiel', en: 'Kiel', de: 'Kiel', tr: 'Kiel' },
        { id: 'Lübeck', en: 'Lübeck', de: 'Lübeck', tr: 'Lübeck' }
    ],
    'TH': [
        { id: 'Erfurt', en: 'Erfurt', de: 'Erfurt', tr: 'Erfurt' },
        { id: 'Jena', en: 'Jena', de: 'Jena', tr: 'Jena' }
    ],
    'RP': [
        { id: 'Mainz', en: 'Mainz', de: 'Mainz', tr: 'Mainz' },
        { id: 'Ludwigshafen', en: 'Ludwigshafen', de: 'Ludwigshafen', tr: 'Ludwigshafen' }
    ],
    'HB': [
        { id: 'Bremen', en: 'Bremen', de: 'Bremen', tr: 'Bremen' },
        { id: 'Bremerhaven', en: 'Bremerhaven', de: 'Bremerhaven', tr: 'Bremerhaven' }
    ],
    'BB': [
        { id: 'Potsdam', en: 'Potsdam', de: 'Potsdam', tr: 'Potsdam' },
        { id: 'Cottbus', en: 'Cottbus', de: 'Cottbus', tr: 'Cottbus' }
    ],
    'SL': [
        { id: 'Saarbrücken', en: 'Saarbrücken', de: 'Saarbrücken', tr: 'Saarbrücken' }
    ],
    'MV': [
        { id: 'Rostock', en: 'Rostock', de: 'Rostock', tr: 'Rostock' },
        { id: 'Schwerin', en: 'Schwerin', de: 'Schwerin', tr: 'Schwerin' }
    ],

    // Austria - 9 States
    'W': [{ id: 'Wien', en: 'Vienna', de: 'Wien', tr: 'Viyana' }],
    'S': [{ id: 'Salzburg', en: 'Salzburg', de: 'Salzburg', tr: 'Salzburg' }],
    'ST_AT': [{ id: 'Graz', en: 'Graz', de: 'Graz', tr: 'Graz' }],
    'O': [{ id: 'Linz', en: 'Linz', de: 'Linz', tr: 'Linz' }],
    'T': [{ id: 'Innsbruck', en: 'Innsbruck', de: 'Innsbruck', tr: 'Innsbruck' }],
    'K': [{ id: 'Klagenfurt', en: 'Klagenfurt', de: 'Klagenfurt', tr: 'Klagenfurt' }],
    'N': [{ id: 'Sankt Pölten', en: 'Sankt Pölten', de: 'Sankt Pölten', tr: 'Sankt Pölten' }],
    'V': [{ id: 'Bregenz', en: 'Bregenz', de: 'Bregenz', tr: 'Bregenz' }],
    'B': [{ id: 'Eisenstadt', en: 'Eisenstadt', de: 'Eisenstadt', tr: 'Eisenstadt' }],

    // Switzerland - 26 Cantons (major ones)
    'ZH': [{ id: 'Zürich', en: 'Zurich', de: 'Zürich', tr: 'Zürih' }],
    'GE': [{ id: 'Genève', en: 'Geneva', de: 'Genève', tr: 'Cenevre' }],
    'BS': [{ id: 'Basel', en: 'Basel', de: 'Basel', tr: 'Basel' }],
    'BE_CH': [{ id: 'Bern', en: 'Bern', de: 'Bern', tr: 'Bern' }],
    'LU': [{ id: 'Luzern', en: 'Lucerne', de: 'Luzern', tr: 'Luzern' }],
    'SG': [{ id: 'St. Gallen', en: 'St. Gallen', de: 'St. Gallen', tr: 'St. Gallen' }],
    'TI': [{ id: 'Lugano', en: 'Lugano', de: 'Lugano', tr: 'Lugano' }],
    'VD': [{ id: 'Lausanne', en: 'Lausanne', de: 'Lausanne', tr: 'Lozan' }],
    'AG': [{ id: 'Aarau', en: 'Aarau', de: 'Aarau', tr: 'Aarau' }],
    'ZG': [{ id: 'Zug', en: 'Zug', de: 'Zug', tr: 'Zug' }],
    'NE': [{ id: 'Neuchâtel', en: 'Neuchâtel', de: 'Neuchâtel', tr: 'Neuchâtel' }],
    'FR': [{ id: 'Fribourg', en: 'Fribourg', de: 'Fribourg', tr: 'Fribourg' }],
    'VS': [{ id: 'Sion', en: 'Sion', de: 'Sion', tr: 'Sion' }],
    'GR': [{ id: 'Chur', en: 'Chur', de: 'Chur', tr: 'Chur' }],
    'TG': [{ id: 'Frauenfeld', en: 'Frauenfeld', de: 'Frauenfeld', tr: 'Frauenfeld' }]
};

export const POPULAR_CITIES = [
    'Berlin',
    'Hamburg',
    'München (Munich)',
    'Köln (Cologne)',
    'Frankfurt am Main',
    'Stuttgart',
    'Düsseldorf',
    'Ulm',
    'Wien (Vienna)',
    'Zürich (Zurich)',
    'Salzburg',
    'Genève (Geneva)'
];

// Maintain compatibility with existing code
export const CITIES = [
    // Major German Cities (existing)
    'Berlin',
    'Hamburg',
    'München (Munich)',
    'Köln (Cologne)',
    'Frankfurt am Main',
    'Stuttgart',
    'Düsseldorf',
    'Dortmund',
    'Essen',
    'Bremen',
    'Hannover',
    'Leipzig',
    'Dresden',
    'Nürnberg (Nuremberg)',
    'Duisburg',
    'Bochum',
    'Wuppertal',
    'Bielefeld',
    'Bonn',
    'Münster',
    'Karlsruhe',
    'Mannheim',
    'Wiesbaden',
    'Augsburg',
    'Mönchengladbach',
    'Gelsenkirchen',
    'Braunschweig',
    'Kiel',
    'Aachen',
    'Chemnitz',
    'Magdeburg',
    'Freiburg im Breisgau',
    'Krefeld',
    'Lübeck',
    'Oberhausen',
    'Erfurt',
    'Mainz',
    'Rostock',
    'Kassel',
    'Hagen',
    'Saarbrücken',
    'Hamm',
    'Potsdam',
    'Ludwigshafen',
    'Oldenburg',
    'Leverkusen',
    'Osnabrück',
    'Solingen',
    'Heidelberg',
    'Herne',
    'Ulm',
    'Regensburg',
    // NEW German Cities
    'Hildesheim',
    'Salzgitter',
    'Wilhelmshaven',
    'Zwickau',
    'Plauen',
    'Görlitz',
    'Dessau-Roßlau',
    'Wittenberg',
    'Stendal',
    'Neumünster',
    'Norderstedt',
    'Elmshorn',
    'Weimar',
    'Gera',
    'Gotha',
    'Kaiserslautern',
    'Worms',
    'Speyer',
    'Frankfurt (Oder)',
    'Brandenburg an der Havel',
    'Oranienburg',
    'Neunkirchen',
    'Homburg',
    'Völklingen',
    'Stralsund',
    'Greifswald',
    'Neubrandenburg',
    'Wismar',
    // Austrian Cities
    'Wien (Vienna)',
    'Salzburg',
    'Graz',
    'Linz',
    'Wels',
    'Steyr',
    'Innsbruck',
    'Klagenfurt',
    'Villach',
    'Sankt Pölten',
    'Wiener Neustadt',
    'Bregenz',
    'Dornbirn',
    'Eisenstadt',
    'Leonding',
    'Kufstein',
    'Wolfsberg',
    'Krems',
    'Baden',
    'Leoben',
    'Feldkirch',
    // Swiss Cities
    'Zürich (Zurich)',
    'Winterthur',
    'Genève (Geneva)',
    'Basel',
    'Bern',
    'Biel/Bienne',
    'Luzern (Lucerne)',
    'St. Gallen',
    'Lugano',
    'Lausanne',
    'Aarau',
    'Baden (CH)',
    'Zug',
    'Neuchâtel',
    'Fribourg',
    'Sion',
    'Chur',
    'Frauenfeld',
    'Thun'
];
