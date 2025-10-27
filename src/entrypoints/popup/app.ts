import {} from '@/lib/messaging';

const activeTabs = await browser.tabs.query({ active: true, currentWindow: true });
const activeTab = activeTabs[0];
browser.tabs.update(activeTab.id, { url: browser.runtime.getURL('/board.html') });
window.close();
