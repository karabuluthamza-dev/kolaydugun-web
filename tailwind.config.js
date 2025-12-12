/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                serif: ['Playfair Display', 'serif'],
                sans: ['Inter', 'sans-serif'],
            },
            colors: {
                primary: "#FF6F61", // Coral
                secondary: "#E8C27A", // Gold
                accent: "#0F8A65", // Teal
                background: "#FFF5F0", // Cream
            }
        },
    },
    plugins: [],
}
