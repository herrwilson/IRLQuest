<script>
	import { openModal } from 'svelte-modals';
	import RewardItem from '$lib/components/Rewards/RewardItem.svelte';
	import RewardModal from '$lib/components/Rewards/RewardModal.svelte';

	export let data;

	const openRewardModal = () => {
		openModal(RewardModal, {
			data: data.form,
		});
	};
</script>

<div class="mx-auto my-3 flex flex-row rounded-xl bg-secondary p-2">
	<button
		class="text-3xl"
		on:click={openRewardModal}
	>
		Add Reward
	</button>
</div>
<div
	id="rewardList"
	class="mx-auto flex flex-col flex-wrap items-center gap-4 px-5 tablet:flex-row"
>
	{#each data.rewards as reward}
		<!-- use spread operator to pass all reward's properties as separate props -->
		<RewardItem {reward} />
	{/each}
</div>
