/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#B91C1C', // Santamerica Red (approximate based on "bordô")
                secondary: '#1E293B', // Dark Blue/Grey
            }
        },
    },
    plugins: [],
}
