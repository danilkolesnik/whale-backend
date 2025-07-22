// tailwind.config.ts
import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  plugins: [
    plugin(function ({ addUtilities }) {
      addUtilities({
        '.custom-scrollbar': {
          'scrollbar-width': 'thin',
          'scrollbar-color': '#526985 transparent',
        },
        '.custom-scrollbar::-webkit-scrollbar': {
          width: '8px',
        },
        '.custom-scrollbar::-webkit-scrollbar-track': {
          background: 'rgba(174, 210, 255, 0.1)',
        },
        '.custom-scrollbar::-webkit-scrollbar-thumb': {
          'background-color': 'rgba(174, 210, 255, 0.1)',
          'border-radius': '10px',
          'background-clip': 'content-box',
        },
        '.scrollbar-hide': {
          /* Firefox */
          'scrollbar-width': 'none',
          /* Safari & Chrome */
          '-ms-overflow-style': 'none',
        },
        '.scrollbar-hide::-webkit-scrollbar': {
          display: 'none',
        },
      });
    }),
  ],
};

export default config;
