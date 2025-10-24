import { sendMessage } from '@/lib/messaging';

function mountUi(container: HTMLElement) {
  container.style.display = 'hidden';
  const wrapper = container.parentElement!;

  if (wrapper.childElementCount !== 7) {
    return;
  }

  const menuOption = wrapper.children.item(4)!.cloneNode(true) as HTMLElement;

  const anchor = menuOption.firstElementChild as HTMLAnchorElement;
  anchor.href = browser.runtime.getURL('/board.html');
  anchor.setAttribute('data-testid', 'twboarder');

  const svg = anchor.firstElementChild?.firstElementChild!;
  svg.innerHTML =
    '<g><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H600v-80h160v-480H200v480h160v80H200Zm240 0v-246l-64 64-56-58 160-160 160 160-56 58-64-64v246h-80Z"/></g>';
  svg.setAttribute('viewBox', '0 -960 960 960');

  const text = anchor.firstElementChild?.children.item(1)
    ?.firstElementChild! as HTMLSpanElement;
  text.innerText = 'Open TWBoarder';

  menuOption.addEventListener('click', (e) => {
    if (e.ctrlKey) {
      sendMessage('openBoard');
    } else {
      window.location.href = browser.runtime.getURL('/board.html');
    }
  });

  anchor.addEventListener('mouseover', () => {
    const body = document.querySelector('body')!;
    const style = window.getComputedStyle(body, null);

    let bg;
    switch (style.backgroundColor) {
      case 'rgb(0, 0, 0)': // Lights out
        bg = 'rgb(22, 24, 28)';
        break;
      case 'rgb(21, 32, 43)': // Dim
        bg = 'rgb(30, 39, 50)';
        break;
      case 'rgb(255, 255, 255)': // Light
        bg = 'rgb(247, 249, 249)';
        break;
      default:
        return;
    }

    anchor.style.backgroundColor = bg;
  });

  anchor.addEventListener('mouseout', () => {
    anchor.style = '';
  });

  wrapper.insertBefore(menuOption, wrapper.children.item(4));
}

export default defineContentScript({
  matches: ['https://x.com/*', 'https://twitter.com/*'],
  async main(ctx) {
    if (await sendMessage('isBoard')) {
      return;
    }

    const ui = createIntegratedUi(ctx, {
      position: 'inline',
      anchor: 'div[data-testid="Dropdown"]>div:has(a[data-testid="settings"]):has(:nth-last-child(6))',
      onMount: mountUi,
    });

    ui.autoMount();
  },
});
