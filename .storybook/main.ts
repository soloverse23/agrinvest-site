import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import type { StorybookConfig } from '@storybook/nextjs-vite'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

// Video frames and product photos are local-only (data/raw/ is gitignored, footage rights are
// unconfirmed). Serve them when present; boards show a labelled placeholder otherwise.
const localMedia = [
  { from: '../public', to: '/' },
  { from: '../data/raw/frames', to: '/frames' },
  { from: '../data/raw/media/products', to: '/products' },
].filter(({ from }) => existsSync(path.resolve(root, '.storybook', from)))

const config: StorybookConfig = {
  framework: '@storybook/nextjs-vite',
  stories: ['../design-system/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-a11y'],
  staticDirs: localMedia,
  core: { disableTelemetry: true },
}

export default config
