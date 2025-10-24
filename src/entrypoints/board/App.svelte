<script lang="ts">
  import { sendMessage } from '@/lib/messaging';

  $effect(() => {
    return () => sendMessage('removeBoard');
  });
</script>

<div class="flex justify-center h-screen">
  <iframe
    src="https://x.com/"
    width="499"
    title="Main title"
    referrerpolicy="no-referrer"
    class="border-0"
  >
  </iframe>
</div>
