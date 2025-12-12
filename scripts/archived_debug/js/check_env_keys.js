
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

try {
    const envConfig = dotenv.parse(fs.readFileSync('.env'));
    const keys = Object.keys(envConfig);
    console.log('Available keys in .env:', keys);
} catch (e) {
    console.error('Error reading .env:', e.message);
}
