<script>
	import toast from 'svelte-french-toast';
	import { invalidate } from '$app/navigation';
	import { superValidate } from 'sveltekit-superforms/client';
	import rewardSchema from '$lib/schemas/reward.js';
	import { page } from '$app/stores';
	import { openModal } from 'svelte-modals';
	import RewardCard from '$lib/components/common/RewardCard.svelte';
	import RewardModal from './RewardModal.svelte';
	import ConfirmationModal from '$lib/components/common/ConfirmationModal.svelte';
	import Button from '$lib/components/common/Button.svelte';
	import {
		PenSolid,
		CashOutline,
		TrashBinSolid,
		InfoCircleOutline,
	} from 'flowbite-svelte-icons';

	export let reward;

	const image = reward.imageUrl || 'https://placehold.co/100';
	$: canAfford = reward.price <= $page.data.coins;
	$: canPurchase =
		canAfford && (reward.quantityInStore > 0 || reward.isInfinite);

	const handleEdit = async () => {
		// TODO:
		// WHEN EDITING, HOW TO DEAL WITH QUANTITY IN INVENTORY?
		// edit both, or split to two?
		const validatedData = await superValidate(reward, rewardSchema);
		openModal(RewardModal, {
			data: validatedData,
			edit: true,
		});
	};

	const handleDelete = async () => {
		const res = await fetch('/api/rewards', {
			method: 'DELETE',
			body: JSON.stringify(reward),
		});

		if (res.status === 204 || res.status === 200) {
			toast.success('Reward deleted', {
				icon: '🗑️',
			});
			invalidate('get:rewards');
		} else {
			const body = await res.json();
			console.error(body.message, res);
			toast.error('Deleting reward failed');
		}
	};

	const useReward = async (type) => {
		if (!canAfford) return toast.error('Not enough coins!');
		if (reward.quantityInStore <= 0 && !reward.isInfinite)
			return toast.error('The reward has no quantity left.');

		const res = await fetch('/api/rewards/purchase', {
			method: 'POST',
			body: JSON.stringify({
				type,
				data: reward,
			}),
		});

		if (res.status === 204 || res.status === 200) {
			toast.success('Reward purchased');
			invalidate('get:rewards');
			invalidate('get:coins');
			const { quantityLeft } = await res.json();
			if ((quantityLeft && quantityLeft > 0) || reward.isInfinite) return;

			// if no quantity left, prompt to edit or remove
			openModal(ConfirmationModal, {
				title: 'Last of type bought',
				description: `You just bought the last of ${reward.name}. Do you want to edit its quantity or remove the reward?`,
				hasCancelButton: false,
				confirmCallbacks: [
					{ name: 'Edit', func: handleEdit },
					{ name: 'Remove', func: handleDelete },
				],
			});
		} else {
			const body = await res.json();
			console.error(body.message, res);
			toast.error('Purchasing reward failed');
		}
	};

	const handleBuy = async () => {
		openModal(ConfirmationModal, {
			title: 'Use or stash?',
			description:
				'Do you want to use the reward immediately, or save it to your inventory for later?',
			hasCancelButton: false,
			confirmCallbacks: [
				{ name: 'Use', func: () => useReward('now') },
				{ name: 'Stash', func: () => useReward('stash') },
			],
		});
	};
</script>

<RewardCard
	showQuantity={!reward.isInfinite}
	showDescription={Boolean(reward.description)}
>
	<Button
		pill
		slot="editButton"
		data-cy="rewardEditButton"
		on:click={handleEdit}
	>
		<PenSolid
			size="sm"
			class="inline"
			aria-hidden="true"
			tabindex="-1"
		/>
	</Button>
	<Button
		pill
		color="red"
		slot="removeButton"
		data-cy="rewardDeleteButton"
		on:click={handleDelete}
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
	<svelte:fragment slot="quantity">({reward.quantityInStore})</svelte:fragment>
	<svelte:fragment slot="description">{reward.description}</svelte:fragment>

	<svelte:fragment slot="price">
		{reward.price}
		<CashOutline
			size="xl"
			tabindex="-1"
		/>
	</svelte:fragment>
	<Button
		slot="buyButton"
		disabled={!canPurchase}
		data-cy="buyButton"
		on:click={handleBuy}>Buy</Button
	>
</RewardCard>
