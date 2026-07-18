import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'warm-white': 'var(--color-warm-white)',
        'warm-cream': 'var(--color-warm-cream)',
        'warm-black': 'var(--color-warm-black)',
        'warm-gray': 'var(--color-warm-gray)',
        'warm-border': 'var(--color-warm-border)',
        leader: 'var(--color-leader)',
        philosopher: 'var(--color-philosopher)',
        explorer: 'var(--color-explorer)',
        healer: 'var(--color-healer)',
        rebel: 'var(--color-rebel)',
        creator: 'var(--color-creator)',
      },
      fontFamily: {
        heading: ['var(--font-heading)'],
        body: ['var(--font-body)'],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
      },
    },
  },
  plugins: [],
};

export default config;
