<script lang="ts" module>
  import type { TwitterOpenApi, TwitterOpenApiClient } from 'twitter-openapi-typescript';
  import type TwitterListAPI from '@/lib/TwitterList';
  import { sendMessage } from '@/lib/messaging';

  let api: TwitterOpenApi | undefined;
  let client: TwitterOpenApiClient | undefined;
  let twitterListApi: TwitterListAPI | undefined;

  type TwListFeed = {
    name: string;
    lists: TwList[];
  };

  type TwList = {
    id: string;
    name: string;
    iconUrl: string;
    membersContext: string;
    followersContext?: string;
    facepileUrls: string[];
    mode: 'Private' | 'Public';
  };

  async function getLists() {
    const { TwitterOpenApi } = await import('twitter-openapi-typescript');
    const { createTwitterListAPI } = await import('@/lib/TwitterList');

    const cookies = await sendMessage('getTwitterCookies');

    if (!api) {
      api = new TwitterOpenApi();
      api.setAdditionalBrowserHeaders({
        'User-Agent': window.navigator.userAgent,
      });
    }

    if (!client) {
      client = await api.getClientFromCookies(cookies);
    }

    if (!twitterListApi) {
      twitterListApi = await createTwitterListAPI(client.config);
    }

    const lists = await twitterListApi.getLists();
    const listFeed: TwListFeed[] = [];

    const instructions =
      lists.data.viewer.list_management_timeline.timeline.instructions;
    for (const instruction of instructions) {
      if (instruction.type !== 'TimelineAddEntries') {
        continue;
      }

      for (const entry of instruction.entries) {
        if (entry.content.entryType !== 'TimelineTimelineModule') {
          continue;
        }

        if (entry.content.clientEventInfo?.component === 'suggest_list_to_follow') {
          continue;
        }

        const twLists: TwList[] = [];
        for (const item of entry.content.items) {
          if (item.item.itemContent.itemType !== 'TimelineTwitterList') {
            continue;
          }

          const list = item.item.itemContent.list;

          const iconUrl = new URL(
            list.custom_banner_media?.media_info.original_img_url ??
              list.default_banner_media.media_info.original_img_url,
          );
          iconUrl.searchParams.set('name', '360x360');

          twLists.push({
            id: list.id_str,
            name: list.name,
            iconUrl: iconUrl.toString(),
            membersContext: list.members_context,
            followersContext: list.followers_context,
            facepileUrls: list.facepile_urls,
            mode: list.mode,
          });
        }

        listFeed.push({
          name: entry.content.header.text,
          lists: twLists,
        });
      }
    }

    return listFeed;
  }
</script>

<script lang="ts">
  import type { Component } from 'svelte';
  import { DropdownMenu } from 'bits-ui';
  import { savedTabs } from '@/lib';
  import Tab, { defaultSettings, type TabPage } from './Tab.svelte';
  import { type DragDropState, draggable, droppable } from '@thisux/sveltednd';
  import { flip } from 'svelte/animate';
  import { fade } from 'svelte/transition';
  import Add from '@/lib/components/icons/Add.svelte';
  import ForYou from '@/lib/components/icons/ForYou.svelte';
  import Person from '@/lib/components/icons/PersonAdd.svelte';
  import Search from '@/lib/components/icons/Search.svelte';

  let tabs: TabPage[] | undefined = $state();

  $effect(() => {
    if (!tabs) {
      (async () => {
        tabs = await savedTabs.getValue();
      })();
    }
  });

  $effect(() => {
    if (tabs) {
      const tabsValue = $state.snapshot(tabs);
      savedTabs.setValue(tabsValue);
    }
  });

  function handleDrop(state: DragDropState<TabPage>) {
    if (!tabs) {
      return;
    }

    const { draggedItem, targetContainer } = state;

    const dragIndex = tabs.findIndex((t) => t.id === draggedItem.id);
    const dropIndex = parseInt(targetContainer ?? '0');

    if (dragIndex !== -1 && !isNaN(dropIndex)) {
      const [item] = tabs.splice(dragIndex, 1);
      tabs.splice(dropIndex, 0, item);
    }
  }
</script>

{#snippet staticOption(text: string, icon: Component, className: string, page: TabPage)}
  {@const Icon = icon}
  <DropdownMenu.Item
    class="hover:bg-background-hover flex gap-2 rounded-md select-none"
    onclick={() => tabs!.push(page)}
  >
    <div
      class="flex h-12 w-12 items-center justify-center rounded-lg {className} bg-cover bg-center"
    >
      <Icon class="h-6 w-6 opacity-70" />
    </div>
    <div class="flex flex-col">
      <strong>{text}</strong>
      <span>&#x200B;</span>
    </div>
  </DropdownMenu.Item>
{/snippet}

{#await getLists()}
  <div class="absolute bottom-0 left-0">
    <button disabled>
      <Add class="h-12 w-12" />
    </button>
  </div>
{:then feeds}
  <DropdownMenu.Root>
    <DropdownMenu.Trigger class="absolute bottom-0 left-0">
      <button>
        <Add class="h-12 w-12" />
      </button>
    </DropdownMenu.Trigger>
    <DropdownMenu.Portal>
      <DropdownMenu.Content
        sideOffset={8}
        class="bg-background mx-2 flex flex-col gap-2 rounded-md border border-white px-2 py-1 shadow"
      >
        {#each feeds as feed}
          <DropdownMenu.Group class="flex flex-col gap-2 py-2">
            <DropdownMenu.GroupHeading>
              <strong>{feed.name}</strong>
            </DropdownMenu.GroupHeading>

            {#each feed.lists as list}
              <DropdownMenu.Item
                class="hover:bg-background-hover flex gap-2 rounded-md select-none"
                onclick={() =>
                  tabs!.push({
                    id: self.crypto.randomUUID(),
                    url: `https://x.com/i/lists/${list.id}`,
                    name: list.name,
                    settings: defaultSettings,
                  })}
              >
                <div
                  class="h-12 w-12 rounded-lg bg-cover bg-center"
                  style="background-image: url({list.iconUrl});"
                ></div>
                <div class="flex flex-col">
                  <strong>{list.name}</strong>
                  <span class="opacity-50">{list.membersContext ?? '0 members'}</span>
                </div>
              </DropdownMenu.Item>
            {/each}
          </DropdownMenu.Group>
        {/each}

        <DropdownMenu.Group class="flex flex-col gap-2 py-2">
          <DropdownMenu.GroupHeading>
            <strong>Others</strong>
          </DropdownMenu.GroupHeading>
          {@render staticOption('For you', ForYou, 'bg-sky-500', {
            id: self.crypto.randomUUID(),
            url: 'https://x.com/home',
            name: 'For you',
            settings: defaultSettings,
            homeType: 'forYou',
          })}

          {@render staticOption('Following', Person, 'bg-fuchsia-400', {
            id: self.crypto.randomUUID(),
            url: 'https://x.com/home',
            name: 'Following',
            settings: defaultSettings,
            homeType: 'following',
          })}

          {@render staticOption('Search', Search, 'bg-emerald-400 fill-white', {
            id: self.crypto.randomUUID(),
            url: 'https://x.com/explore',
            name: 'Search',
            settings: defaultSettings,
          })}
        </DropdownMenu.Group>
        <DropdownMenu.Group></DropdownMenu.Group>
      </DropdownMenu.Content>
    </DropdownMenu.Portal>
  </DropdownMenu.Root>
{/await}

{#if tabs}
  <div class="flex h-screen w-full justify-center gap-2">
    {#each tabs as pageTab, i (pageTab.id)}
      <div
        use:draggable={{
          container: i.toString(),
          dragData: pageTab,
          interactive: ['[data-bar-btn]'],
        }}
        use:droppable={{
          container: i.toString(),
          callbacks: { onDrop: handleDrop },
        }}
        animate:flip={{ duration: 150 }}
        in:fade={{ duration: 150 }}
        out:fade={{ duration: 150 }}
      >
        <Tab
          bind:page={tabs[i]}
          onClose={() => (tabs = tabs!.filter((t) => t !== pageTab))}
        />
      </div>
    {/each}
  </div>
{/if}
