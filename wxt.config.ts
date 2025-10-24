import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-svelte', '@wxt-dev/webextension-polyfill'],
  manifest: {
    permissions: [
      'storage',
      'tabs',
      'declarativeNetRequest',
      'declarativeNetRequestWithHostAccess',
    ],
    host_permissions: [
      'https://twitter.com/*',
      'https://x.com/*',
      'https://raw.githubusercontent.com/*',
    ],
    description: 'A self made implementation of tweetdeck',
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});
