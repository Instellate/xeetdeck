import { sendMessage } from '@/lib/messaging';

export default defineContentScript({
  matches: ['https://x.com/*', 'https://twitter.com/*'],
  async main(ctx) {
    if (!await sendMessage('isBoard')) {
      return;
    }
  },
});
