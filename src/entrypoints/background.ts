import { onMessage } from '@/lib/messaging';

async function updateRule(tabIds: number[]) {
  if (tabIds.length === 0) {
    await browser.declarativeNetRequest.updateSessionRules({
      removeRuleIds: [1],
    });
  } else {
    await browser.declarativeNetRequest.updateSessionRules({
      removeRuleIds: [1],
      addRules: [
        {
          id: 1,
          priority: 1,
          condition: {
            requestDomains: ['twitter.com', 'x.com'],
            tabIds,
          },
          action: {
            type: 'modifyHeaders',
            responseHeaders: [
              {
                header: 'x-frame-options',
                operation: 'remove',
              },
            ],
          },
        },
      ],
    });
  }
}

export default defineBackground(() => {
  const boardTabs = new Set<number>();

  onMessage('isBoard', (m) => boardTabs.has(m.sender.tab.id));

  onMessage('addBoard', async (m) => {
    boardTabs.add(m.sender.tab.id);
    await updateRule(Array.from(boardTabs));

    browser.tabs.onRemoved.addListener((e) => {
      if (e === m.sender.tab.id) {
        boardTabs.delete(m.sender.tab.id);
      }
    });
  });

  onMessage('removeBoard', async (m) => {
    boardTabs.delete(m.sender.tab.id);
    await updateRule(Array.from(boardTabs));
  });

  onMessage('openBoard', () => {
    browser.tabs.create({
      url: '/board.html',
      active: false,
    });
  });

  onMessage('debug', (e) => console.log(e.data));
});
