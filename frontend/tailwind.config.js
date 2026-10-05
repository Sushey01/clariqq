/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      },
      typography: (theme) => ({
        invert: {
          css: {
            '--tw-prose-body': theme('colors.slate[200]'),
            '--tw-prose-headings': theme('colors.white'),
            '--tw-prose-links': theme('colors.blue[400]'),
            '--tw-prose-bold': theme('colors.white'),
            '--tw-prose-counters': theme('colors.slate[400]'),
            '--tw-prose-bullets': theme('colors.slate[400]'),
            '--tw-prose-hr': theme('colors.slate[700]'),
            '--tw-prose-quotes': theme('colors.slate[300]'),
            '--tw-prose-quote-borders': theme('colors.slate[700]'),
            '--tw-prose-captions': theme('colors.slate[400]'),
            '--tw-prose-code': theme('colors.white'),
            '--tw-prose-pre-code': theme('colors.slate[200]'),
            '--tw-prose-pre-bg': theme('colors.slate[900]'),
            '--tw-prose-th-borders': theme('colors.slate[600]'),
            '--tw-prose-td-borders': theme('colors.slate[700]'),
            'a': {
              color: theme('colors.blue.400'),
              '&:hover': {
                color: theme('colors.blue.300'),
              },
            },
            'h1, h2, h3, h4': {
              color: theme('colors.white'),
              fontFamily: theme('fontFamily.outfit').join(', '),
              fontWeight: '600',
            },
            'pre': {
              backgroundColor: theme('colors.slate.900'),
              border: `1px solid ${theme('colors.slate.700')}`,
              borderRadius: theme('borderRadius.xl'),
            },
            'code::before': { content: '""' },
            'code::after': { content: '""' },
            'code': {
              backgroundColor: theme('colors.slate.800'),
              padding: '0.2em 0.4em',
              borderRadius: theme('borderRadius.md'),
              fontWeight: '500',
            }
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
