<script>
	import { Button } from 'flowbite-svelte';
</script>

<Button
	{...$$props}
	color={$$props.color ? $$props.color : 'blue'}
	on:click
	on:change
	on:keydown
	on:keyup
	on:touchend
	on:touchcancel
	on:mouseenter
	on:mouseleave
>
	<slot />
</Button>
