const dictionary = {
    "Wedding Venues": {
        en: "Wedding Venues",
        de: "Hochzeitslocations",
        tr: "Düğün Mekanları"
    },
    nav: {
        services: {
            en: "Services",
            de: "Dienstleister",
            tr: "Hizmetler"
        }
    }
};

const generateResources = (dict) => {
    const resources = {
        en: { translation: {} },
        de: { translation: {} },
        tr: { translation: {} }
    };

    const traverse = (obj, path = []) => {
        for (const key in obj) {
            if (typeof obj[key] === 'object' && !obj[key].en) {
                // Nested object, recurse
                traverse(obj[key], [...path, key]);
            } else if (typeof obj[key] === 'object' && obj[key].en) {
                // Leaf node with translations
                const currentPath = [...path, key];

                // Assign to each language
                ['en', 'de', 'tr'].forEach(lang => {
                    let current = resources[lang].translation;
                    for (let i = 0; i < currentPath.length - 1; i++) {
                        if (!current[currentPath[i]]) current[currentPath[i]] = {};
                        current = current[currentPath[i]];
                    }
                    current[currentPath[currentPath.length - 1]] = obj[key][lang];
                });
            }
        }
    };

    traverse(dict);
    return resources;
};

const resources = generateResources(dictionary);
console.log(JSON.stringify(resources, null, 2));
