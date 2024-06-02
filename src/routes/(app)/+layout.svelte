<script>
	import '../../app.css';
	import { setContext } from 'svelte';
	import { browser } from '$app/environment';
	import { signIn } from '@auth/sveltekit/client';
	import { page } from '$app/stores';
	import { Toaster } from 'svelte-french-toast';
	import { Modals } from 'svelte-modals';
	import Nav from '$lib/components/Navigation/Nav.svelte';
	import Footer from '$lib/components/Navigation/Footer.svelte';

	const iconCtx = {
		size: 'xs',
	};
	setContext('iconCtx', iconCtx);
</script>

<Nav />

<!-- parent #svelte is flex in app.css -->
{#if $page.data.session}
	<slot />
{:else}
	<div class="text-center text-ternary">
		<h1 class="text-3xl">Please register, or generate unique URL</h1>
		<br />
		<button
			class="rounded bg-primary p-3 text-xl hover:bg-secondary"
			on:click={async () => signIn('google')}
		>
			Sign In with Google
		</button>
		<!-- <button
				class="hidden rounded bg-primary p-3 text-xl hover:bg-secondary"
				on:click={handleUrlGeneration}
			>
				Generate Unique URL
			</button> -->
	</div>
{/if}

<Footer />

<!-- Which ever modal is opened is inserted here after the backdrop -->
<Modals>
	<div
		slot="backdrop"
		class="backdrop"
	/>
	<!-- <OpenedModalGoesHere /> -->
</Modals>

<Toaster toastOptions={{ position: 'bottom-left' }} />

{#if browser}
	<div
		hidden
		id="sveltekit-hydrated"
	/>
{/if}

<style>
	.backdrop {
		position: fixed;
		top: 0;
		bottom: 0;
		right: 0;
		left: 0;
		background: rgba(0, 0, 0, 0.5);
	}
</style>
