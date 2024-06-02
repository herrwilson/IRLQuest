<script>
	import { openModal } from 'svelte-modals';
	import { invalidate } from '$app/navigation';
	import Tooltip from '$lib/components/common/Tooltip.svelte';
	import RewardCard from '$lib/components/common/RewardCard.svelte';
	import ConfirmationModal from '$lib/components/common/ConfirmationModal.svelte';
	import toast from 'svelte-french-toast';
	import Button from '$lib/components/common/Button.svelte';
	import { TrashBinSolid } from 'flowbite-svelte-icons';

	export let reward;

	const image = reward.imageUrl || 'https://placehold.co/100';

	const handleApiCall = async (actionType, amountToRemove = 1) => {
		if (amountToRemove <= 0) return;
		return fetch('/api/rewards/inventory', {
			method: 'DELETE',
			body: JSON.stringify({
				reward,
				amountToRemove,
			}),
		});
	};

	const handleDiscard = async (amountToRemove = 1) => {
		openModal(ConfirmationModal, {
			title: 'Discard',
			description: `Are you sure you want to discard one (1) ${reward.name}?`,
			confirmText: 'Discard',
			confirmCallbacks: async () => {
				const res = await handleApiCall(amountToRemove);
				if (res.status === 204 || res.status === 200) {
					invalidate('get:inventory');
					toast.success('Reward discarded', {
						icon: '🗑️',
					});
				} else {
					toast.error('Discarding failed');
					const body = await res.json();
					console.log(body.message, res);
				}
			},
		});
	};

	const handleUse = async () => {
		const amountToRemove = 1;
		openModal(ConfirmationModal, {
			title: 'Use',
			description: `Are you sure you want to use ${reward.name}?`,
			confirmText: 'Use',
			confirmCallbacks: async () => {
				const res = await handleApiCall();
				if (res.status === 204 || res.status === 200) {
					invalidate('get:inventory');
					toast.success('Reward used');
				} else {
					toast.error('Using reward failed');
					const body = await res.json();
					console.log(body.message, res);
				}
			},
		});
	};
</script>

<RewardCard showDescription={Boolean(reward.description)}>
	<Button
		slot="removeButton"
		pill
		color="red"
		data-cy="discardButton"
		on:click={handleDiscard}
	>
		<TrashBinSolid
			size="sm"
			class="inline"
			tabindex="-1"
		/>
	</Button>
	<img
		class="mx-auto my-auto max-h-[250px] max-w-[250px] rounded-lg"
		src={image}
		alt={reward.name}
		slot="picture"
		width="250px"
	/>
	<svelte:fragment slot="name">{reward.name}</svelte:fragment>
	<svelte:fragment slot="quantity"
		>({reward.quantityInInventory})</svelte:fragment
	>
	<svelte:fragment slot="description">{reward.description}</svelte:fragment>

	<Button
		slot="buyButton"
		on:click={handleUse}>Use</Button
	>
</RewardCard>
