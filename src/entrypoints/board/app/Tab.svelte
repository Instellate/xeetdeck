<script lang="ts" module>
  export type TabPage = {
    id: string;
    name: string;
    url: string;
    settings: TabSettings;
    order: number;
    homeType?: HomeType;
  };

  export type TabSettings = {
    hideRetweets: boolean;
    hideQuoteTweets: boolean;
    hideReplies: boolean;
    showMediaOnly: boolean;
    showTextOnly: boolean;
  };

  export const defaultSettings: TabSettings = {
    hideRetweets: false,
    hideQuoteTweets: false,
    hideReplies: false,
    showMediaOnly: false,
    showTextOnly: false,
  };

  const settingsKeys = Object.keys(defaultSettings) as (keyof TabSettings)[];
  const settingsDisplay: Record<keyof TabSettings, string> = {
    hideRetweets: 'Hide Retweets',
    hideQuoteTweets: 'Hide Quote Tweets',
    hideReplies: 'Hide Replies',
    showMediaOnly: 'Tweets must contain media',
    showTextOnly: 'Tweets cannot contain media',
  };
</script>

<script lang="ts">
  import { sendTabMessage, type HomeType, type TabEventData } from '@/lib';
  import { DropdownMenu } from 'bits-ui';
  import Close from '@/lib/components/icons/Close.svelte';
  import MoreVert from '@/lib/components/icons/MoreVert.svelte';
  import DropdownCheckbox from './DropdownCheckbox.svelte';
  import { sendMessage } from '@/lib/messaging';

  type Props = {
    page: TabPage;
    onClose?: () => void;
  };

  // They are not unused just used elsewhere
  // eslint-disable-next-line svelte/no-unused-props
  let { page = $bindable(), onClose }: Props = $props();
  let iframe: HTMLIFrameElement | undefined = $state();

  $effect(() => {
    if (!iframe) {
      return;
    }

    const listener = (e: MessageEvent<TabEventData>) => {
      if (!iframe) {
        return;
      }

      if (e.source !== iframe.contentWindow) {
        return;
      }

      switch (e.data.type) {
        case 'requestSettings':
          sendTabMessage(iframe.contentWindow, {
            type: 'settingsUpdated',
            settings: $state.snapshot(page.settings),
          });

          if (page.homeType) {
            sendTabMessage(iframe.contentWindow, {
              type: 'gotoHome',
              home: page.homeType,
            });
          }
          break;
        default:
          console.warn('Got unknown type:', e.data.type);
          break;
      }
    };

    window.addEventListener('message', listener);
    return () => window.removeEventListener('message', listener);
  });

  $effect(() => {
    for (const setting of Object.keys(defaultSettings) as (keyof TabSettings)[]) {
      if (page.settings[setting] === undefined) {
        page.settings[setting] = defaultSettings[setting];
      }
    }
  });

  $effect(() => {
    sendTabMessage(iframe?.contentWindow, {
      type: 'settingsUpdated',
      settings: $state.snapshot(page.settings),
    });
  });
</script>

{#snippet settings()}
  <DropdownMenu.Root>
    <DropdownMenu.Trigger
      class="flex cursor-pointer items-center justify-center transition-colors delay-75"
      data-bar-btn
    >
      <MoreVert class="hover:bg-background-hover w-6 rounded-full fill-white" />
    </DropdownMenu.Trigger>
    <DropdownMenu.Portal>
      <DropdownMenu.Content
        class="bg-background overflow-hidden rounded-md border border-white shadow"
        align="end"
        sideOffset={8}
      >
        {#each settingsKeys as key (key)}
          <DropdownCheckbox
            bind:checked={page.settings[key]}
            text={settingsDisplay[key]}
          />
        {/each}
      </DropdownMenu.Content>
    </DropdownMenu.Portal>
  </DropdownMenu.Root>
{/snippet}

<div class="flex h-full flex-col p-2 select-none">
  <div
    class="flex w-[500px] cursor-move items-center justify-between rounded-t-md border-b border-[#2f3336] bg-black px-2 py-2"
  >
    <span class="ml-1 select-none">{page.name}</span>
    <div class="flex items-center gap-2">
      {@render settings()}
      <button
        onclick={() => onClose?.()}
        data-bar-btn
        class="flex cursor-pointer items-center justify-center transition-colors delay-75"
      >
        <Close
          class="hover:bg-background-hover w-6 cursor-pointer rounded-full fill-white"
        />
      </button>
    </div>
  </div>
  <div class="h-full rounded-b-md">
    {#await sendMessage('removeTwServiceWorker') then}
      <iframe
        src={page.url}
        width="500"
        title="Main title"
        referrerpolicy="no-referrer"
        class="h-full border-0"
        bind:this={iframe}
      >
      </iframe>
    {/await}
  </div>
</div>
