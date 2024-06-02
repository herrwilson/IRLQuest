<script>
	import Button from '$lib/components/common/Button.svelte';
	import { invalidate, goto } from '$app/navigation';
	import { openModal } from 'svelte-modals';
	import TemplateModal from '$lib/components/Templates/TemplateModal.svelte';
	import QuestModal from '$lib/components/Quests/QuestModal.svelte';
	import { getDateString } from '$lib/utils';

	export let template;

	const handleEdit = () => {
		openModal(TemplateModal, { template }, { replace: true });
	};

	const handleRemove = async () => {
		const id = template.id;
		const res = await fetch('/api/templates', {
			method: 'DELETE',
			body: JSON.stringify({ id }),
		});
		const json = await res.json();
		console.log(json);

		// refetch data and reload page
		invalidate('templates');
	};

	const handleCreation = async () => {
		// id here is template's id so we dont want to pass it to the quest
		const data = { ...template, id: null };
		await goto('/');
		openModal(QuestModal, {
			data,
			date: getDateString(),
			formAction: '?/create',
		});
	};
</script>

<details class="h-min rounded-md bg-secondary p-3">
	<summary class="font-bold">{template.name}</summary>
	<p class="italic">{template.description}</p>

	<p>Reward: {template.reward} {template.isCoinReward ? 'coins' : ''}</p>
	<p>Is Recurring? {template.isRecurring ? 'Yes' : 'No'}</p>

	<!-- TODO change to icons? -->
	<Button
		class="!px-3 !py-2"
		data-cy="templateEdit"
		on:click={handleEdit}>Edit</Button
	>
	<Button
		class="!px-3 !py-2"
		data-cy="templateRemove"
		on:click={handleRemove}>Remove</Button
	>
	<Button
		class="!px-3 !py-2"
		data-cy="templateCreateQuest"
		on:click={handleCreation}>Create Quest</Button
	>
</details>
