import type { Preview } from '@storybook/nextjs-vite'

// Same stylesheet as the public site, so stories render with the real tokens.
import '../src/app/(frontend)/globals.css'

const preview: Preview = {
  parameters: {
    a11y: { test: 'error' },
    layout: 'padded',
  },
}

export default preview
