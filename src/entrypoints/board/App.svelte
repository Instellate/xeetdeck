<script lang="ts" module>
  import { TwitterOpenApi, TwitterOpenApiClient } from 'twitter-openapi-typescript';
  import TwitterList from '@/lib/TwitterList';
  import { sendMessage } from '@/lib/messaging';

  let api: TwitterOpenApi | undefined;
  let client: TwitterOpenApiClient | undefined;

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

    const twitterListApi = new TwitterList(client.config);

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
        // Consider disabling discover lists

        const twLists: TwList[] = [];
        for (const item of entry.content.items) {
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
  import Add from '@/lib/components/Add.svelte';
  import Tab, { TabPage } from './Tab.svelte';
  import { DropdownMenu } from 'bits-ui';

  let tabs: TabPage[] = $state([]);
</script>

{#await getLists() then feeds}
  <DropdownMenu.Root>
    <DropdownMenu.Trigger class="absolute bottom-0 left-0">
      <button>
        <Add class="h-12 w-12" />
      </button>
    </DropdownMenu.Trigger>
    <DropdownMenu.Portal>
      <DropdownMenu.Content
        sideOffset={8}
        class="bg-background flex flex-col gap-2 rounded-md border border-white px-2 py-1 shadow-2xl"
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
                  tabs.push({
                    url: `https://x.com/i/lists/${list.id}`,
                    name: list.name,
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
        <DropdownMenu.Group></DropdownMenu.Group>
      </DropdownMenu.Content>
    </DropdownMenu.Portal>
  </DropdownMenu.Root>
{/await}

<div class="flex h-screen w-full justify-center gap-2">
  {#each tabs as tab}
    <Tab page={tab} onclose={() => (tabs = tabs.filter((t) => t !== tab))} />
  {/each}
</div>

<!-- <div class="flex justify-center h-screen">
  <div class="border-black border-2 p-2 h-full">
    <iframe
      src="https://x.com/"
      width="499"
      title="Main title"
      referrerpolicy="no-referrer"
      class="border-0 h-full"
    >
    </iframe>
  </div>
</div> -->
