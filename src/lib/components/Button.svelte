<script lang="ts">
  import { Button, type ButtonRootProps } from 'bits-ui';
  import { cn } from '@/lib';

  const { class: className, children, ...props }: ButtonRootProps = $props();
</script>

<Button.Root
  {...props}
  class={cn(
    'rounded-md text-white bg-blue-500 px-2 py-1 hover:bg-blue-400 active:bg-blue-600',
    className,
  )}
>
  {@render children?.()}
</Button.Root>
