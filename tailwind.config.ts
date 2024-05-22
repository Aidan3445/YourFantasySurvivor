import type { Config } from "tailwindcss"

const config = {
    darkMode: ["class"],
    content: [
        './pages/**/*.{ts,tsx}',
        './components/**/*.{ts,tsx}',
        './app/**/*.{ts,tsx}',
        './src/**/*.{ts,tsx}',
    ],
    prefix: "",
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            colors: {
                'b1': '#684528',
                'b1-light': '#8C6D4D',
                'b2': '#B09472',
                'b3': '#E5BC8F',
                'b4': '#EED9BF',
                'g1': '#3D5540',
                'g2': '#7D9277',
                'g3': '#A9CF9F',
            },
            keyframes: {
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },
                "shimmer": {
                    "from": { backgroundSize: "200% 200%" },
                    "to": { backgroundSize: "200% 200%" },
                    "0%": { backgroundPosition: "0% 0%" },
                    "50%": { backgroundPosition: "100% 100%" },
                    "100%": { backgroundPosition: "0% 0%" },
                },
                "scale-in": {
                    "0%": { transform: "scale(0)" },
                    "100%": { transform: "scale(1)" },
                },
                "scale-out": {
                    "0%": { transform: "scale(1)" },
                    "100%": { transform: "scale(0)" },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                "shimmer": "shimmer 12s ease infinite",
                "shimmer-delay-1": "shimmer 12s ease 0.75s infinite",
                "shimmer-delay-2": "shimmer 12s ease 2s infinite",
                "scale-in": "scale-in 2s ease-out",
                "scale-in-fast": "scale-in 0.1s ease-out",
                "scale-out": "scale-out 2s ease-out",
                "scale-out-fast": "scale-out 0.1s ease-out",
            },
            rotate: {
                "30": "30deg",
                "210": "210deg",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
