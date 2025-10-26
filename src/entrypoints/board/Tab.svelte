<script lang="ts" module>
  import { TwitterOpenApi, TwitterOpenApiClient } from 'twitter-openapi-typescript';
  import TwitterList from '@/lib/TwitterList';

  export type TabPage = {
    name: string;
    url: string;
  };
</script>

<script lang="ts">
  import Button from '@/lib/components/Button.svelte';
  import { sendMessage } from '@/lib/messaging';
  import { DropdownMenu, Select } from 'bits-ui';
  import Close from '@/lib/components/Close.svelte';

  type Props = {
    page: TabPage;
    onclose?: () => void;
  };

  let { page, onclose }: Props = $props();
</script>

<div class="flex h-full flex-col p-2">
  <div
    class="flex w-[499px] items-center justify-between rounded-t-md border-b border-[#2f3336] bg-black px-2 py-2"
  >
    <span class="ml-1">{page.name}</span>
    <button onclick={() => onclose?.()}>
      <Close class="hover:bg-background-hover w-6 rounded-md fill-white" />
    </button>
  </div>
  <div class="h-full rounded-b-md">
    <iframe
      src={page.url}
      width="499"
      title="Main title"
      referrerpolicy="no-referrer"
      class="h-full border-0"
    >
    </iframe>
  </div>
</div>

<!-- {#await getLists()}
  <span>Waiting...</span>
{:then feeds}
  <div>
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Button>Open menu</Button>
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
                    (selectedPage = {
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
                    <span class="opacity-50">{list.membersContext ?? '0 members'}</span
                    >
                  </div>
                </DropdownMenu.Item>
              {/each}
            </DropdownMenu.Group>
          {/each}
          <DropdownMenu.Group></DropdownMenu.Group>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  </div>
{/await} -->
