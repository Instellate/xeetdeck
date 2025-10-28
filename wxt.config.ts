import { defineConfig } from 'wxt';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import tailwindcss from '@tailwindcss/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

// Node polyfills are needed to get `twitter-openapi-typescript` to work

export default defineConfig({
  srcDir: 'src',
  modules: [
    '@wxt-dev/module-svelte',
    '@wxt-dev/webextension-polyfill',
    '@wxt-dev/auto-icons',
  ],
  manifest: {
    name: 'XeetDeck',
    permissions: ['storage', 'tabs', 'declarativeNetRequest', 'cookies', 'browsingData'],
    host_permissions: [
      '*://*.twitter.com/*',
      '*://*.x.com/*',
      'https://raw.githubusercontent.com/*',
    ],
    description: 'A self made implementation of tweetdeck',
    browser_specific_settings: {
      gecko: {
        id: 'xeetdeck@instellate.xyz',
      },
    },
  },
  svelte: {
    vite: {
      preprocess: [vitePreprocess()],
    },
  },
  vite: () => ({
    plugins: [nodePolyfills({ globals: { Buffer: true } }), tailwindcss()],

  }),
  autoIcons: {
    baseIconPath: 'assets/icon.svg',
    developmentIndicator: false,
  },
  imports: {
    eslintrc: {
      enabled: 9,
    },
  },
});
