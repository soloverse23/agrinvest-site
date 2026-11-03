import type { Preview } from '@storybook/nextjs-vite'

// Same stylesheet as the public site, so stories render with the real tokens.
import '../src/app/(frontend)/globals.css'

const preview: Preview = {
  parameters: {
    a11y: { test: 'error' },
    layout: 'padded',
  },
  globalTypes: {
    locale: {
      description: 'Content language',
      toolbar: {
        title: 'Locale',
        icon: 'globe',
        items: [
          { value: 'ro', title: 'Română' },
          { value: 'en', title: 'English' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { locale: 'ro' },
}

export default preview
