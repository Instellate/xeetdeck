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
            requestDomains: ['x.com', 'twitter.com'],
            resourceTypes: ['main_frame', 'sub_frame'],
            tabIds,
          },
          action: {
            type: 'modifyHeaders',
            responseHeaders: [
              {
                header: 'X-Frame-Options',
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

    browser.tabs.onRemoved.addListener(async (e) => {
      if (e === m.sender.tab.id) {
        boardTabs.delete(m.sender.tab.id);
        await updateRule(Array.from(boardTabs));
      }
    });
  });

  onMessage('removeBoard', async (m) => {
    boardTabs.delete(m.sender.tab.id);
    await updateRule(Array.from(boardTabs));
  });

  onMessage('openBoard', async () => {
    await browser.tabs.create({
      url: '/board.html',
      active: false,
    });
  });

  onMessage('changeToBoard', async (m) => {
    browser.tabs.update(m.sender.tab.id, { url: browser.runtime.getURL('/board.html') });
  });

  onMessage('getTwitterCookies', async (m) => {
    const cookies = await browser.cookies.getAll({ domain: 'x.com' });
    const cookiesRecord: Record<string, string> = {};

    cookies.forEach((c) => (cookiesRecord[c.name] = c.value));

    const ct0 = cookies.find((c) => c.name === 'ct0');
    if (ct0 && ct0?.sameSite !== 'no_restriction') {
      ct0.sameSite = 'no_restriction';
      await browser.cookies.set({
        url: 'https://x.com' + ct0.path,
        httpOnly: ct0.httpOnly,
        domain: ct0.domain,
        expirationDate: ct0.expirationDate,
        name: ct0.name,
        partitionKey: ct0.partitionKey,
        path: ct0.path,
        sameSite: 'no_restriction',
        secure: ct0.secure,
        storeId: ct0.storeId,
        value: ct0.value,
      });
    }

    return cookiesRecord;
  });

  onMessage('removeTwServiceWorker', async () => {
    if (import.meta.env.CHROME) {
      await browser.browsingData.remove(
        {
          origins: ['https://twitter.com', 'https://x.com'],
        },
        {
          serviceWorkers: true,
        },
      );
    }
  });

  onMessage('debug', (e) => console.log(e.data));
});
