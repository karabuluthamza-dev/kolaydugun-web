import { dictionary } from './src/locales/dictionary.js';
console.log('Dictionary keys:', Object.keys(dictionary));
console.log('Dashboard keys:', dictionary.dashboard ? Object.keys(dictionary.dashboard) : 'UNDEFINED');
