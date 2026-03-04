/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#7C7CFE",
                "background-light": "#F4F4F5",
                "background-dark": "#0F0F0F",
                "accent-purple": "#6366F1",
                "accent-yellow": "#FACC15",
                "accent-teal": "#2DD4BF",
                "accent-red": "#FB7185",
                "card-dark": "#1C1C1E",
            },
            fontFamily: {
                display: ["Space Grotesk", "sans-serif"],
            },
            borderRadius: {
                DEFAULT: "24px",
                "xl": "32px",
            },
        },
    },
    plugins: [],
}
