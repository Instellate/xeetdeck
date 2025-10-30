<script lang="ts">
  import CheckboxBlank from '@material-symbols/svg-400/outlined/check_box_outline_blank.svg?component';
  import CheckboxIndeterminate from '@material-symbols/svg-400/outlined/indeterminate_check_box.svg?component';
  import CheckboxSelected from '@material-symbols/svg-400/outlined/select_check_box.svg?component';
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
  {closeOnSelect}
>
  {#snippet children({ checked, indeterminate })}
    {#if checked}
      <CheckboxSelected class="h-4 w-4 fill-white" />
    {:else if indeterminate}
      <CheckboxIndeterminate class="h-4 w-4 fill-white" />
    {:else}
      <CheckboxBlank class="h-4 w-4 fill-white" />
    {/if}

    {#if text}
      <span>{text}</span>
    {/if}

    {@render rootChildren?.()}
  {/snippet}
</DropdownMenu.CheckboxItem>
