<script lang="ts" module>
  import type { TwitterOpenApi, TwitterOpenApiClient } from 'twitter-openapi-typescript';
  import type TwitterListAPI from '@/lib/TwitterList';
  import { sendMessage } from '@/lib/messaging';

  let api: TwitterOpenApi | undefined;
  let client: TwitterOpenApiClient | undefined;
  let twitterListApi: TwitterListAPI | undefined;

  type TwListFeed = {
    id: string;
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
          id: entry.entryId,
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
  import type { SVGAttributes } from 'svelte/elements';
  import { DropdownMenu } from 'bits-ui';
  import { savedTabs } from '@/lib';
  import Tab, { defaultSettings, type TabPage } from './Tab.svelte';
  import { type DragDropState, draggable, droppable } from '@thisux/sveltednd';
  import { flip } from 'svelte/animate';
  import { fade } from 'svelte/transition';
  import Add from '@material-symbols/svg-400/outlined/add.svg?component';
  import ForYou from '@material-symbols/svg-400/outlined/for_you.svg?component';
  import Person from '@material-symbols/svg-400/outlined/person_add.svg?component';
  import Search from '@material-symbols/svg-400/outlined/search.svg?component';

  type IconComponent = Component<SVGAttributes<SVGSVGElement>>;

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

    const dropOrder = parseInt(targetContainer ?? '0');
    const dragOrder = draggedItem.order;

    const dragIndex = tabs.findIndex((t) => t.id === draggedItem.id);
    const dropIndex = tabs.findIndex((t) => t.order === dropOrder);

    if (dragIndex !== -1 && dropIndex !== -1) {
      if (dragOrder > dropOrder) {
        for (let i = dropOrder; i < dragOrder; i++) {
          tabs[tabs.findIndex((t) => t.order === i)].order++;
        }
      } else {
        for (let i = dropOrder; i > dragOrder; i--) {
          tabs[tabs.findIndex((t) => t.order === i)].order--;
        }
      }

      tabs[dragIndex].order = dropOrder;
    }
  }
</script>

{#snippet staticOption(
  text: string,
  icon: IconComponent,
  className: string,
  page: TabPage,
)}
  {@const Icon = icon}
  <DropdownMenu.Item
    class="hover:bg-background-hover flex gap-2 rounded-md select-none"
    onclick={() => tabs!.push(page)}
  >
    <div
      class="flex h-12 w-12 items-center justify-center rounded-lg {className} bg-cover bg-center"
    >
      <Icon class="h-6 w-6 fill-white opacity-70" />
    </div>
    <div class="flex flex-col justify-center">
      <strong>{text}</strong>
    </div>
  </DropdownMenu.Item>
{/snippet}

{#await getLists()}
  <div class="absolute bottom-0 left-0 pb-2 pl-2">
    <button disabled>
      <Add class="h-12 w-12 fill-white opacity-75" />
    </button>
  </div>
{:then feeds}
  <DropdownMenu.Root>
    <DropdownMenu.Trigger class="absolute bottom-0 left-0 pb-2 pl-2">
      <button class="hover:bg-background-hover rounded-md transition-colors delay-75">
        <Add class="h-12 w-12 fill-white" />
      </button>
    </DropdownMenu.Trigger>
    <DropdownMenu.Portal>
      <DropdownMenu.Content
        sideOffset={8}
        class="bg-background mx-2 flex flex-col gap-2 rounded-md border border-white px-2 py-1 shadow"
      >
        {#each feeds as feed (feed.id)}
          <DropdownMenu.Group class="flex flex-col gap-2 py-2">
            <DropdownMenu.GroupHeading>
              <strong>{feed.name}</strong>
            </DropdownMenu.GroupHeading>

            {#each feed.lists as list (list.id)}
              <DropdownMenu.Item
                class="hover:bg-background-hover flex gap-2 rounded-md select-none"
                onclick={() =>
                  tabs!.push({
                    id: self.crypto.randomUUID(),
                    url: `https://x.com/i/lists/${list.id}`,
                    name: list.name,
                    settings: defaultSettings,
                    order: tabs!.length,
                  })}
              >
                <div
                  class="h-12 w-12 rounded-lg bg-cover bg-center"
                  style="background-image: url({list.iconUrl});"
                ></div>
                <div class="flex flex-col justify-center">
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
            order: tabs!.length,
            homeType: 'forYou',
          })}

          {@render staticOption('Following', Person, 'bg-fuchsia-400', {
            id: self.crypto.randomUUID(),
            url: 'https://x.com/home',
            name: 'Following',
            settings: defaultSettings,
            order: tabs!.length,
            homeType: 'following',
          })}

          {@render staticOption('Search', Search, 'bg-emerald-400 fill-white', {
            id: self.crypto.randomUUID(),
            url: 'https://x.com/explore',
            name: 'Search',
            settings: defaultSettings,
            order: tabs!.length,
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
          container: pageTab.order.toString(),
          dragData: pageTab,
          interactive: ['[data-bar-btn]'],
        }}
        use:droppable={{
          container: pageTab.order.toString(),
          callbacks: { onDrop: handleDrop },
        }}
        animate:flip={{ duration: 150 }}
        in:fade={{ duration: 150 }}
        out:fade={{ duration: 150 }}
        style="order: {pageTab.order}"
        class="bg-none"
      >
        <Tab
          bind:page={tabs[i]}
          onClose={() => (tabs = tabs!.filter((t) => t !== pageTab))}
        />
      </div>
    {/each}
  </div>
{/if}
