import { onMessage } from '@/lib/messaging';

export default defineBackground(() => {
  const boardWindows = new Set<number>();

  onMessage('isBoard', (m) => boardWindows.has(m.sender.tab.id));

  onMessage('addBoard', (m) => {
    boardWindows.add(m.sender.tab.id);
  });

  onMessage('removeBoard', (m) => {
    boardWindows.delete(m.sender.tab.id);
  });

  onMessage('openBoard', () => {
    browser.tabs.create({
      url: '/board.html',
      active: false,
    });
  });
});
