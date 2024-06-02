<script>
	import { Tooltip, Button } from 'flowbite-svelte';
	export let content = 'Tooltip content';
</script>

<slot>
	<Button>Default tooltip</Button>
</slot>
<Tooltip>{content}</Tooltip>
