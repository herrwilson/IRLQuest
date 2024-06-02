<script>
	import toast from 'svelte-french-toast';
	import { onMount } from 'svelte';
	import { invalidate } from '$app/navigation';
	import { openModal, closeModal } from 'svelte-modals';
	import { templateStore } from '$lib/store/templates.js';
	import TemplateModal from './TemplateModal.svelte';
	import Button from '$lib/components/common/Button.svelte';
	import { Label, Input } from 'flowbite-svelte';
	import ModalWrapper from '$lib/components/common/ModalWrapper.svelte';

	onMount(async () => {
		if ($templateStore.length === 0) {
			const res = await fetch('/api/templates');
			const { templates } = await res.json();
			templateStore.set(templates);
		}
	});

	// isOpen is provided automatically
	export let isOpen;
	// callback to run when user clicks select
	export let onSelect;

	const useTemplate = (template) => {
		closeModal();
		onSelect(template);
	};

	const handleEdit = (template) => {
		openModal(TemplateModal, { template }, { replace: true });
	};

	const handleRemove = async (id) => {
		const res = await fetch('/api/templates', {
			method: 'DELETE',
			body: JSON.stringify({ id }),
		});

		templateStore.update((store) => {
			// find index of reward with given id
			let i = store.indexOf(store.find((template) => template.id === id));
			// remove the reward
			store.splice(i, 1);
			// update store
			return store;
		});
		// refetch data and reload page
		invalidate('templates');

		toast.success('Template removed', {
			icon: '🗑️',
		});
	};
</script>

<ModalWrapper {isOpen}>
	<ul class="-m-3 flex flex-col gap-6 text-left">
		{#each $templateStore as template}
			<li class="rounded-lg border-2 border-ternary p-5">
				<p class="font-bold">{template.name}</p>
				<p>{template.reward} {template.isCoinReward ? 'coins' : ''}</p>
				<p class="italic">{template.description}</p>
				<Button on:click={() => closeModal() && onSelect(template)}>Use</Button>
				<Button on:click={() => handleRemove(template.id)}>Remove</Button>
				<Button on:click={() => handleEdit(template)}>Edit</Button>
			</li>
		{:else}
			<p>No templates</p>
		{/each}
	</ul>
</ModalWrapper>
