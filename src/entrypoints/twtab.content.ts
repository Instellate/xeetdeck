import { sendTabMessage, type TabEventData, HomeType, debug } from '@/lib';
import { sendMessage } from '@/lib/messaging';
import { defaultSettings, type TabSettings } from './board/app/Tab.svelte';

let baseUrl: string | undefined;
let settings: TabSettings = defaultSettings;
let pendingHomeType: HomeType | undefined;

// Do not remove elements from the twitter page
// Removing breaks the site
// Instead change the display to none.

const settingFunctions: Record<keyof TabSettings, (unhide?: boolean) => void> = {
  hideRetweets,
  hideQuoteTweets,
  hideReplies,
  showMediaOnly,
};

function bodyMutation(_records: MutationRecord[], _observer: MutationObserver) {
  const mainContent = document.querySelector('main>div>div>div>div>div');
  if (
    mainContent &&
    window.location.href === baseUrl &&
    baseUrl !== 'https://x.com/explore'
  ) {
    for (let i = 0; i < mainContent.children.length - 1; i++) {
      const child = mainContent.children.item(i) as HTMLElement;
      child.style.display = 'none';
    }
  }

  if (pendingHomeType && gotoHome(pendingHomeType)) {
    pendingHomeType = undefined;
  }

  const header = document.querySelector('header');
  if (header) {
    header.style.display = 'none';
  }

  const declineCookies = document.querySelector(
    'div[data-testid="BottomBar"]>div:nth-child(1)>div:nth-child(2)>button:nth-child(2)',
  ) as HTMLButtonElement | null;
  declineCookies?.click();

  if (window.location.href === baseUrl || baseUrl === 'https://x.com/explore') {
    const listHeader = document.querySelector(
      'div[aria-label="Timeline: List"]>div>div',
    ) as HTMLDivElement | null;
    if (listHeader) {
      listHeader.style.display = 'none';
    }

    const settingsKeys = Object.keys(settings) as (keyof TabSettings)[];
    for (const settingsKey of settingsKeys) {
      if (settings[settingsKey]) {
        settingFunctions[settingsKey]();
      }
    }
  }
}

function hideRetweets(unhide = false) {
  document
    .querySelectorAll(
      'div:has(>div>div>article[data-testid="tweet"]>div>div>div>div>div>div>div>div>svg)',
    )
    .forEach((r) => ((r as HTMLElement).style.display = unhide ? '' : 'none'));
}

function hideReplies(unhide = false) {
  const replies = document.querySelectorAll(
    'div:has(>div>div>article[data-testid="tweet"]>div:nth-child(1)>div:nth-child(1)>div:nth-child(1)>div:nth-child(1)>div:nth-child(2))',
  );

  for (const reply of replies) {
    const replyEl = reply as HTMLElement;
    replyEl.style.display = unhide ? '' : 'none';

    const sibling = replyEl.previousElementSibling as HTMLElement | null;
    if (sibling) {
      sibling.style.display = unhide ? '' : 'none';
    }
  }
}

function hideQuoteTweets(unhide = false) {
  document
    .querySelectorAll(
      'div:has(>div>div>article[data-testid="tweet"]>div>div>div:nth-child(2)>div:nth-child(2)>div:nth-child(3)>div:nth-child(2))',
    )
    .forEach((q) => ((q as HTMLDivElement).style.display = unhide ? '' : 'none'));
}

function showMediaOnly(unhide = false) {
  const tweets = document.querySelectorAll(
    'div:has(>div>div>article[data-testid="tweet"])',
  );

  for (const tweet of tweets) {
    const content = tweet.querySelector(
      'div>div>article[data-testid="tweet"]>div>div>div:nth-child(2)>div:nth-child(2)>div:nth-child(3)',
    ) as HTMLDivElement | null;

    if (content && content.querySelector('img') === null) {
      console.log(unhide);
      (tweet as HTMLDivElement).style.display = unhide ? '' : 'none';
    }
  }
}

function gotoHome(type: HomeType): boolean {
  const tab = document.querySelector(
    'div[role="tablist"]:has(>div[role="presentation"]>a[href="/home"])',
  );
  if (!tab) {
    return false;
  }

  const followingChild = tab.children.item(type === 'forYou' ? 0 : 1);
  if (followingChild) {
    const anchor = followingChild.firstElementChild as HTMLAnchorElement | null;
    if (anchor) {
      anchor.click();
      return true;
    }
  }

  return false;
}

export default defineContentScript({
  matches: ['https://x.com/*', 'https://twitter.com/*'],
  allFrames: true,
  async main(_ctx) {
    if (!(await sendMessage('isBoard'))) {
      debug('Page is not a board. Exiting');
      return;
    }

    baseUrl = window.location.href;

    window.addEventListener('message', (e: MessageEvent<TabEventData>) => {
      switch (e.data.type) {
        case 'settingsUpdated':
          settings = e.data.settings;

          if (window.location.href === baseUrl || baseUrl === 'https://x.com/explore') {
            const settingsKeys = Object.keys(settings) as (keyof TabSettings)[];
            for (const settingsKey of settingsKeys) {
              settingFunctions[settingsKey](!settings[settingsKey]);
            }
          }

          break;
        case 'gotoHome':
          pendingHomeType = e.data.home;
          break;
        case 'goto':
          window.location.href = e.data.url;
          break;
      }
    });
    sendTabMessage(window.top, { type: 'requestSettings' });

    const bodyObserver = new window.MutationObserver(bodyMutation);
    bodyObserver.observe(document.documentElement, { childList: true, subtree: true });
  },
});
