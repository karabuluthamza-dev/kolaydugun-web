import { dictionary } from './src/locales/dictionary.js';

console.log("Checking dictionary integrity...");

try {
    const sc = dictionary.seating_chart;
    if (!sc) {
        console.error("ERROR: seating_chart key is missing!");
    } else {
        console.log("seating_chart key exists.");

        const keysToCheck = ['add_table', 'add_guest', 'title'];
        keysToCheck.forEach(key => {
            if (sc[key]) {
                console.log(`seating_chart.${key}:`, sc[key]);
            } else {
                console.error(`ERROR: seating_chart.${key} is missing!`);
            }
        });
    }
} catch (e) {
    console.error("Error accessing dictionary:", e);
}
