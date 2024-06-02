<script>
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import Profile from './Profile.svelte';
</script>

<nav class="mx-auto flex w-full max-w-xl px-5 pt-5 text-ternary">
	<div class="flex w-full justify-evenly">
		<a
			on:click|preventDefault={() => goto('/')}
			href="/"
			class="text-3xl"
			class:font-bold={$page.url.pathname === '/'}
		>
			{'Quests'}
		</a>
		<a
			on:click|preventDefault={() => goto('/store')}
			href="/store"
			class="text-3xl"
			class:font-bold={$page.url.pathname === '/store'}
		>
			{'Store'}
		</a>
		<a
			on:click|preventDefault={() => goto('/inventory')}
			href="/inventory"
			class="text-3xl"
			class:font-bold={$page.url.pathname === '/inventory'}
		>
			{'Inventory'}
		</a>
	</div>

	<Profile />
</nav>
