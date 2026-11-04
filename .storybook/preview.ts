import type { Preview } from '@storybook/nextjs-vite'

// Same stylesheet as the public site, so stories render with the real tokens. The site
// loads Onest through next/font; Storybook loads the same files from @fontsource.
import '@fontsource-variable/onest/wght.css'
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
