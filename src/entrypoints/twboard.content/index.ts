import { sendMessage } from '@/lib/messaging';

function bodyMutation(_: MutationRecord[], observer: MutationObserver) {
  const mainContent = document.querySelector('main>div>div>div>div>div');
  if (mainContent && mainContent.children.length !== 3) {
    for (let i = 0; i < mainContent.children.length - 1; i++) {
      const child = mainContent.children.item(i) as HTMLElement;
      child.style.display = 'none';
    }
  }

  const header = document.querySelector('header');
  if (header) {
    header.style.display = 'none';
  }
}

export default defineContentScript({
  matches: ['https://x.com/*', 'https://twitter.com/*'],
  allFrames: true,
  async main(ctx) {
    if (!(await sendMessage('isBoard'))) {
      return;
    }

    const bodyObserver = new window.MutationObserver(bodyMutation);
    bodyObserver.observe(document.body, { childList: true, subtree: true });
  },
});
