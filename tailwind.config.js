/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Distillery Modern - Vintage Heritage Design
                'gurktaler': {
                    50: '#FDF8F3',
                    100: '#F8F6F3',
                    200: '#E8DDD0',
                    300: '#D4BFA3',
                    400: '#C9B8A3',
                    500: '#B87333', // Primary - Copper
                    600: '#A0621C',
                    700: '#8B5420',
                    800: '#6D421A',
                    900: '#4A2C11',
                },
                'distillery': {
                    50: '#F0F2F2',
                    100: '#E1E5E5',
                    200: '#C3CBCB',
                    300: '#8FA0A0',
                    400: '#6B8080',
                    500: '#4A6363', // Secondary - Steel
                    600: '#3D5252',
                    700: '#2F4040',
                    800: '#2C3333',
                    900: '#1A2020',
                },
                'bronze': {
                    50: '#FFF5E6',
                    100: '#FFEACC',
                    200: '#FFD699',
                    300: '#F5C166',
                    400: '#E6A94D',
                    500: '#CD7F32', // Accent - Bronze
                    600: '#B87333',
                    700: '#9C5E2B',
                    800: '#7A4922',
                    900: '#583318',
                },
            },
            fontFamily: {
                'heading': ['Playfair Display', 'Georgia', 'serif'],
                'body': ['Source Sans Pro', 'Inter', 'system-ui', 'sans-serif'],
            },
            borderRadius: {
                'vintage': '12px',
            },
            borderWidth: {
                'vintage': '2px',
            },
        },
    },
    plugins: [],
}
