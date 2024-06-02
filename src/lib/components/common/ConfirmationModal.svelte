<script>
	import { closeModal } from 'svelte-modals';
	import ModalWrapper from './ModalWrapper.svelte';
	import Button from '$lib/components/common/Button.svelte';

	// provided automatically
	export let isOpen;

	export let title;
	export let description;
	export let confirmText = 'Confirm';
	export let cancelText = 'Cancel';
	export let hasCancelButton = true;
	export let confirmCallbacks;
	export let cancelCallback = closeModal;

	if (!confirmCallbacks) {
		console.error(`at least one confirmCallback(s) must be passed as a prop:
		{ confirmCallbacks: ()=>void|[{name: String, func: ()=>void}, ...] }`);
	}

	// inform dev of the possibility to pass a single callback directly instead of a list
	const isArray = Array.isArray(confirmCallbacks);
	if (isArray && confirmCallbacks.length === 1) {
		console.warn(
			'ConfirmationModal.svelte: A single callback can be passed directly instad of wrapping it in an array.',
		);
	}

	if (!isArray && typeof confirmCallbacks === 'function') {
		confirmCallbacks = [{ name: confirmText, func: confirmCallbacks }];
	}

	const handleConfirm = (callback) => {
		callback();
		closeModal();
	};
</script>

<ModalWrapper {isOpen}>
	<div class="text-center">
		<h3 class="mb-2 text-2xl font-bold">
			{title}
		</h3>
		<p class="mb-5">{description}</p>

		{#each confirmCallbacks as callback}
			<Button
				class="mr-2"
				on:click={() => handleConfirm(callback.func)}
			>
				{callback.name}
			</Button>
		{/each}
		{#if hasCancelButton}
			<Button
				class="bg-white !text-black"
				on:click={cancelCallback}
			>
				{cancelText}
			</Button>
		{/if}
	</div>
</ModalWrapper>
