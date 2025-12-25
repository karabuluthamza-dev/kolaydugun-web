const badWords = [
    // TR
    'amk', 'amina', 'amına', 'ibne', 'orospu', 'piç', 'pic', 'siktir', 'yarrak', 'göt', 'got', 'meme', 'taşşak', 'tassak', 'pezevenk', 'kahpe', 'kancık', 'yavşak', 'yavsak', 'dalyarak', 'amçık', 'amcik', 'sik', 'daşşak',
    // EN
    'fuck', 'shit', 'bitch', 'asshole', 'cunt', 'dick', 'pussy', 'slut', 'whore', 'bastard', 'motherfucker',
    // DE
    'arschloch', 'hure', 'wichser', 'fotze', 'schlampe', 'miststück', 'scheiße'
];

// Kelimeleri regex desenine dönüştüren yardımcı fonksiyon
// f+u+c+k+ şeklinde harf tekrarlarını ve f.u.c.k gibi aradaki sembolleri yakalar
const patterns = badWords.map(word => {
    return word
        .split('')
        .map(char => `${char}+`)
        .join('[\\s\\W_]*');
});

const profanityRegex = new RegExp(`(${patterns.join('|')})`, 'gi');

export const containsProfanity = (text) => {
    if (!text) return false;
    return profanityRegex.test(text);
};

export const filterProfanity = (text) => {
    if (!text) return text;
    // Eşleşen küfürleri yıldız karakteriyle değiştirir
    return text.replace(profanityRegex, (match) => '*'.repeat(match.length));
};
