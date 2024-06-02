<script>
	import { focusTrap } from 'svelte-focus-trap';
	import { closeModal } from 'svelte-modals';

	export let isOpen;

	// https://svelte.dev/repl/0ace7a508bd843b798ae599940a91783?version=3.16.7
	function clickOutside(node, callbackFunction) {
		const handleClick = (event) => {
			if (node && !node.contains(event.target) && !event.defaultPrevented) {
				callbackFunction();
			}
		};
		document.addEventListener('click', handleClick, true);

		return {
			destroy() {
				document.removeEventListener('click', handleClick, true);
			},
		};
	}
</script>

<!-- add keyup event listener for Escape button which closes the modal -->
<svelte:window
	on:keyup|preventDefault={(e) => {
		if (e.key === 'Escape') closeModal();
	}}
/>

{#if isOpen}
	<div
		role="dialog"
		aria-modal="true"
		class="pointer-events-none fixed inset-0 flex items-center justify-center"
		use:clickOutside={() => closeModal()}
	>
		<div
			class="min-width-[350px] pointer-events-auto flex flex-col justify-between rounded-lg bg-primary p-5 text-center text-ternary"
			use:focusTrap
		>
			<slot />
		</div>
	</div>
{/if}
