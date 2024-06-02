<script>
	import { goto } from '$app/navigation';
	import Button from '$lib/components/common/Button.svelte';
	import { openModal } from 'svelte-modals';
	import { coinStore } from '$lib/store/coins';
	import { getLocalDateString } from '$lib/utils';
	import { questStore, getQuestIndexById } from '$lib/store/quests.js';
	import toast from 'svelte-french-toast';
	import Tooltip from '$lib/components/common/Tooltip.svelte';
	import ConfirmationModal from '$lib/components/common/ConfirmationModal.svelte';

	export let selectedQuest;

	const completeQuest = () => {
		if (selectedQuest.isCompleted) return;

		openModal(ConfirmationModal, {
			title: selectedQuest.name,
			description: 'Confirm completion?',
			confirmCallbacks: async () => {
				const response = await fetch('/api/quests/complete', {
					method: 'PATCH',
					body: JSON.stringify({
						...selectedQuest,
					}),
				});

				const data = await response.json();

				// close quest info
				selectedQuest = null;

				// add completed version of the quest to the list
				if (data.newQuest) {
					questStore.update((questData) => [...questData, data.newQuest]);
				}

				// update the ex-parent quest as it now has an exception date
				// this is to not render the quest twice
				const questIndex = getQuestIndexById(data.questData.id);
				questStore.update((questData) => {
					questData[questIndex] = data.questData;
					return questData;
				});

				// handle client side rewarding
				const { isCoinReward, reward, name } = data.questData;
				// cancel if there's no reward
				if (!reward) return;
				// alert for custom text reward
				// TODO: use some nice popup instead
				if (!isCoinReward) {
					return alert(`Quest completed: ${name}.\nYour reward is: ${reward}`);
				}
				// add coin reward to the coin store
				coinStore.update((value) => value + reward);
				// show user a toast
				toast(`+${reward}`, {
					icon: '💰',
				});
			},
		});
	};

	const openEditTypeModal = () => {
		// if quest is not recurring, directly goto/open the edit modal
		if (!selectedQuest.isRecurring)
			return goto(`/?edit=${selectedQuest.id}&scope=all`);

		const questId = selectedQuest.id.split('_')[0];
		openModal(ConfirmationModal, {
			title: `Edit ${selectedQuest.name}`,
			description: 'Do you want to edit a single, future, or all instances?',
			confirmCallbacks: [
				{
					name: 'All occurences',
					func: async () => {
						return await goto(`/?edit=${questId}&scope=all`);
					},
				},
				{
					name: 'This occurence',
					func: async () => {
						return await goto(`/?edit=${questId}&scope=single`);
					},
				},
				{
					name: 'This and future occurences',
					func: async () => {
						return await goto(`/?edit=${questId}&scope=future`);
					},
				},
			],
		});
	};

	const questRemovalCallback = async (scope = 'NULL') => {
		const url = `/api/quests/remove?scope=${scope}`;
		// remove possible recurrence index (questId_index)
		const questId = selectedQuest.id.split('_')[0];
		const response = await fetch(url, {
			method: 'DELETE',
			body: JSON.stringify({
				...selectedQuest,
				id: questId,
			}),
		});

		const data = await response.json();

		// if request was not a success, display the error and cancel
		if (!data.status?.toString().startsWith(2)) {
			return console.error(data);
		}

		const indexInStore = getQuestIndexById(questId);

		// close quest info
		selectedQuest = null;

		// if there was no updated data (all instances were removed), remove quest from store
		// otherwise update store item with returned data
		console.log(data);

		if (!data.quest) {
			questStore.update((questData) => {
				questData.splice(indexInStore, 1);
				return questData;
			});
		} else {
			questStore.update((questData) => {
				questData[indexInStore] = data.quest;
				return questData;
			});
		}

		// show user a toast
		toast(`Quest removed`, {
			icon: '🗑️',
			position: 'bottom-center',
		});
	};

	const removeQuestConfirmation = async () => {
		if (!selectedQuest.isRecurring) {
			return openModal(ConfirmationModal, {
				title: `Remove ${selectedQuest.name}?`,
				description: 'Are you sure you want to remove the quest?',
				confirmCallbacks: async () => {
					return await questRemovalCallback('all');
				},
			});
		}

		openModal(ConfirmationModal, {
			title: `Remove ${selectedQuest.name}`,
			description: 'Do you want to remove a single, future, or all instances?',
			confirmCallbacks: [
				{
					name: 'All occurences',
					func: async () => {
						return await questRemovalCallback('all');
					},
				},
				{
					name: 'This occurence',
					func: async () => {
						return await questRemovalCallback('single');
					},
				},
				{
					name: 'This and future occurences',
					func: async () => {
						return await questRemovalCallback('future');
					},
				},
			],
		});
	};
</script>

<section
	id="questInfo"
	class="hidden flex-1 flex-col space-y-3 rounded-lg border-2 border-ternary p-3"
	class:!flex={selectedQuest}
>
	{#if selectedQuest}
		<div class="flex-1">
			<h1 class="line-clamp-2 text-2xl font-bold">
				{selectedQuest.name}
			</h1>
			<span class="text-sm">{getLocalDateString(selectedQuest.date)}</span>

			<h2 class="text-xl font-bold">Description</h2>
			<p class="line-clamp-6">
				{selectedQuest.description || '-'}
			</p>
			<h2 class="text-xl font-bold">Reward</h2>
			<Tooltip content="Complete to claim">
				<div class="flex w-fit gap-1 rounded bg-secondary px-2 py-1">
					{#if selectedQuest.isCoinReward}
						<iconify-icon
							width="1.5em"
							height="1.5em"
							icon="ri:copper-coin-line"
						/>
					{/if}
					{selectedQuest.reward}
				</div>
			</Tooltip>
		</div>

		<div class="flex flex-wrap gap-3">
			<Button
				color="green"
				disabled={selectedQuest.isCompleted}
				on:click={completeQuest}
			>
				Complete
			</Button>
			<Button
				color="blue"
				disabled={selectedQuest.isCompleted}
				on:click={openEditTypeModal}
			>
				Edit
			</Button>
			<Button
				color="red"
				on:click={removeQuestConfirmation}
			>
				{selectedQuest.isCompleted ? 'Remove' : 'Abandon'}
			</Button>
			<Button on:click={() => (selectedQuest = null)}>Close</Button>
		</div>
	{/if}
</section>
