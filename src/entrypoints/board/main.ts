import './app.css';

import { mount } from 'svelte';
import App from './App.svelte';
import { sendMessage } from '@/lib/messaging';

(async () => {
  if (await sendMessage('isBoard')) {
    window.addEventListener('beforeunload', async () => {
      await sendMessage('removeBoard');
    })
  } else {
    await sendMessage('addBoard');
    // @ts-expect-error Firefox only feature
    window.location.reload(true);
  }
})();

const app = mount(App, {
  target: document.getElementById('app')!,
});

export default app;
