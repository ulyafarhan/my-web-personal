/** @type {import('tailwindcss').Config} */

function withOpacity(variableName) {
    return ({ opacityValue }) => {
        if (opacityValue !== undefined) {
            return `rgba(var(${variableName}), ${opacityValue})`;
        }
        return `rgb(var(${variableName}))`;
    };
}

export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    darkMode: 'class',
	theme: {
		extend: {
            colors: {
                background: withOpacity('--color-bg'),
                foreground: withOpacity('--color-text'),
                primary: {
                    DEFAULT: '#8b5cf6',
                    foreground: '#ffffff',
                },
                card: {
                    DEFAULT: 'var(--card-bg)',
                    foreground: withOpacity('--color-text'),
                },
                muted: {
                    DEFAULT: 'var(--pill-bg)',
                    foreground: 'var(--muted-text)',
                },
                accent: {
                    DEFAULT: '#2dd4bf',
                    foreground: withOpacity('--color-text'),
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Outfit', 'sans-serif'],
            }
        },
	},
	plugins: [],
}
