const fs = require('fs');
const path = require('path');

const dictionaryPath = path.join(__dirname, 'src', 'locales', 'dictionary', 'dictionary.js');
const backupPath = `${dictionaryPath}.bak`;

// If path failed, try alternative path
let activePath = dictionaryPath;
if (!fs.existsSync(activePath)) {
    activePath = path.join(__dirname, 'src', 'locales', 'dictionary.js');
}
const activeBackupPath = `${activePath}.bak`;

const content = fs.readFileSync(activeBackupPath, 'utf8');

function deepMerge(target, source) {
    if (!source || typeof source !== 'object') return target;
    for (const key in source) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key]) && !source[key].en && !source[key].de && !source[key].tr) {
            if (!target[key] || typeof target[key] !== 'object') target[key] = {};
            deepMerge(target[key], source[key]);
        } else {
            target[key] = source[key];
        }
    }
    return target;
}

/**
 * A more surgical approach to extract and merge keys from a string that represents an object content.
 */
function extractAndMergeKeys(objContent, targetObj) {
    // This is a naive but effective way to find top-level keys in the string
    // We look for "key: {" or "key: {" or "key: '...'"
    const keyRegex = /([a-zA-Z0-9_]+)\s*:\s*/g;
    let match;
    while ((match = keyRegex.exec(objContent)) !== null) {
        const key = match[1];
        const valueStartIndex = match.index + match[0].length;

        // Determine value end
        let valueStr = '';
        if (objContent[valueStartIndex] === '{') {
            // Find balanced brace
            let openBraces = 1;
            let i = valueStartIndex + 1;
            for (; i < objContent.length; i++) {
                if (objContent[i] === '{') openBraces++;
                if (objContent[i] === '}') openBraces--;
                if (openBraces === 0) break;
            }
            valueStr = objContent.substring(valueStartIndex, i + 1);
            keyRegex.lastIndex = i + 1; // Move past the object
        } else {
            // Find end of line or comma
            let i = valueStartIndex;
            for (; i < objContent.length; i++) {
                if (objContent[i] === ',' || objContent[i] === '\n') break;
            }
            valueStr = objContent.substring(valueStartIndex, i).trim();
            keyRegex.lastIndex = i;
        }

        try {
            const cleaned = valueStr.replace(/,\s*}/g, '}').replace(/,\s*\]/g, ']');
            const value = eval('(' + cleaned + ')');
            if (typeof value === 'object' && value !== null && !Array.isArray(value) && !value.en && !value.de && !value.tr) {
                if (!targetObj[key]) targetObj[key] = {};
                deepMerge(targetObj[key], value);
            } else {
                targetObj[key] = value;
            }
        } catch (e) {
            // console.error(`Failed to parse value for ${key}`);
        }
    }
}

const finalDictionary = {};

// Find all "export const dictionary = { ... }" blocks and extract their content
const startStr = 'export const dictionary = {';
let searchIndex = 0;
while (true) {
    const startIndex = content.indexOf(startStr, searchIndex);
    if (startIndex === -1) break;

    let openBraces = 1;
    let endIndex = -1;
    const objectContentStart = startIndex + startStr.length - 1;

    for (let i = objectContentStart + 1; i < content.length; i++) {
        if (content[i] === '{') openBraces++;
        if (content[i] === '}') openBraces--;
        if (openBraces === 0) {
            endIndex = i;
            break;
        }
    }

    if (endIndex !== -1) {
        const innerContent = content.substring(objectContentStart + 1, endIndex);
        extractAndMergeKeys(innerContent, finalDictionary);
        searchIndex = endIndex + 1;
    } else {
        break;
    }
}

// Assignments
const assignmentsRegex = /dictionary(?:\.([a-zA-Z0-9_]+)|\[['"](.+?)['"]\])\s*=\s*([\s\S]*?);/g;
let aMatch;
while ((aMatch = assignmentsRegex.exec(content)) !== null) {
    const key = aMatch[1] || aMatch[2];
    const valueStr = aMatch[3].trim();
    try {
        let value;
        if (valueStr === 'community') {
            value = {};
        } else if (valueStr.includes('dictionary.')) {
            continue;
        } else {
            const cleaned = valueStr.replace(/,\s*}/g, '}').replace(/,\s*\]/g, ']');
            value = eval('(' + cleaned + ')');
        }

        if (typeof value === 'object' && value !== null && !Array.isArray(value) && !value.en && !value.de && !value.tr) {
            if (!finalDictionary[key]) finalDictionary[key] = {};
            deepMerge(finalDictionary[key], value);
        } else {
            finalDictionary[key] = value;
        }
    } catch (e) { }
}

// Fixes
if (!finalDictionary.locations) finalDictionary.locations = { states: {} };
if (!finalDictionary.vendorDashboard) finalDictionary.vendorDashboard = finalDictionary.dashboard;

function fixChars(str) {
    return str
        .replace(/Ã¼/g, 'ü')
        .replace(/Ã¶/g, 'ö')
        .replace(/Ã§/g, 'ç')
        .replace(/ÅŸ/g, 'ş')
        .replace(/Ä±/g, 'ı')
        .replace(/ÄŸ/g, 'ğ')
        .replace(/Ãœ/g, 'Ü')
        .replace(/Ã–/g, 'Ö')
        .replace(/Ã‡/g, 'Ç')
        .replace(/Åž/g, 'Ş')
        .replace(/Ä°/g, 'İ')
        .replace(/Äž/g, 'Ğ');
}

let output = `export const dictionary = ${JSON.stringify(finalDictionary, null, 4)};\n`;
output = fixChars(output);
output += `\ndictionary.community = {};\ndictionary.vendorDashboard = dictionary.dashboard;\n`;

fs.writeFileSync(activePath, output);
console.log('Dictionary successfully merged and consolidated.');
