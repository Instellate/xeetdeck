<script lang="ts">
  import CheckboxOutline from '@/lib/components/icons/ChecboxOutline.svelte';
  import Checkbox from '@/lib/components/icons/Checkbox.svelte';
  import { DropdownMenu } from 'bits-ui';
  import type { Snippet } from 'svelte';

  type Props = {
    checked?: boolean;
    children?: Snippet<[]>;
    text?: string;
    closeOnSelect?: boolean;
  };

  let {
    checked = $bindable(false),
    closeOnSelect = false,
    children: rootChildren,
    text,
  }: Props = $props();
</script>

<DropdownMenu.CheckboxItem
  bind:checked
  class="hover:bg-background-hover flex items-center gap-1 px-2 py-1 select-none"
  closeOnSelect={closeOnSelect}
>
  {#snippet children({ checked })}
    {#if checked}
      <Checkbox class="h-4 w-4" />
    {:else}
      <CheckboxOutline class="h-4 w-4" />
    {/if}
    {#if text}
      <span>{text}</span>
    {/if}
    {@render rootChildren?.()}
  {/snippet}
</DropdownMenu.CheckboxItem>
