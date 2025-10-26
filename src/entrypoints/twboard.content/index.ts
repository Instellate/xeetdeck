import { sendMessage } from '@/lib/messaging';

let baseUrl: string | undefined;

function bodyMutation(_: MutationRecord[], observer: MutationObserver) {
  const mainContent = document.querySelector('main>div>div>div>div>div');
  if (mainContent && window.location.href === baseUrl) {
    for (let i = 0; i < mainContent.children.length - 1; i++) {
      const child = mainContent.children.item(i) as HTMLElement;
      child.style.display = 'none';
    }
  }

  const header = document.querySelector('header');
  if (header) {
    header.style.display = 'none';
  }

  const listHeader = document.querySelector(
    'div[aria-label="Timeline: List"]>div>div',
  ) as HTMLDivElement | null;
  if (listHeader && window.location.href === baseUrl) {
    listHeader.style.display = 'none';
  }
}

export default defineContentScript({
  matches: ['https://x.com/*', 'https://twitter.com/*'],
  allFrames: true,
  async main(ctx) {
    if (!(await sendMessage('isBoard'))) {
      return;
    }

    baseUrl = window.location.href;

    const bodyObserver = new window.MutationObserver(bodyMutation);
    bodyObserver.observe(document.body, { childList: true, subtree: true });
  },
});
