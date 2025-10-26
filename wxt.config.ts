import { defineConfig } from 'wxt';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import tailwindcss from '@tailwindcss/vite';

// Node polyfills are needed to get `twitter-openapi-typescript` to work

export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-svelte', '@wxt-dev/webextension-polyfill'],
  manifest: {
    permissions: [
      'storage',
      'tabs',
      'declarativeNetRequest',
      'declarativeNetRequestWithHostAccess',
      'cookies',
    ],
    host_permissions: [
      'https://twitter.com/*',
      'https://x.com/*',
      'https://raw.githubusercontent.com/*',
    ],
    description: 'A self made implementation of tweetdeck',
  },
  vite: () => ({
    plugins: [nodePolyfills({ globals: { Buffer: true } }), tailwindcss()],
  }),
});
