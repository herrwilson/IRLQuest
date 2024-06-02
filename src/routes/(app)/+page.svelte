<script>
	import { questStore } from '$lib/store/quests';
	import { getWeekRange } from '$lib/utils';
	import { afterNavigate } from '$app/navigation';
	import { openModal, closeAllModals } from 'svelte-modals';
	import QuestView from '$lib/components/Quests/QuestView.svelte';
	import QuestModal from '$lib/components/Quests/QuestModal.svelte';
	import QuestInfoBox from '$lib/components/Quests/QuestInfoBox.svelte';
	import QuestListToolbar from '$lib/components/Quests/QuestListToolbar.svelte';

	let selectedQuest = null;
	// default active scope to current week
	let activeDateRange = getWeekRange();
	// default sorting method to weekly
	let sortingMethod = 'weekly';

	// when edit button is pressed, open an edit modal
	afterNavigate(async ({ from, to }) => {
		const editId = to?.url.searchParams.get('edit');
		const scope = to?.url.searchParams.get('scope');

		// future and single edit actions require edited quest's date so pass them to the modal
		const date =
			scope === 'future' || scope === 'single' ? selectedQuest.date : null;
		if (editId && scope) {
			// replace option: modal will replace the last modal in the stack
			openModal(
				QuestModal,
				{ scope, date, formAction: '?/edit' },
				{ replace: true },
			);
		}
	});
</script>

<main class="m-5 flex-1 select-none overflow-hidden laptop:mb-0">
	<div
		class="mx-auto flex h-full flex-col gap-3 rounded-lg bg-primary p-3 text-ternary laptop:w-4/5 desktop:w-3/5"
	>
		<QuestListToolbar
			bind:activeDateRange
			bind:sortingMethod
		/>
		<div class="flex flex-1 flex-col gap-3 overflow-hidden tablet:flex-row">
			<QuestView
				bind:activeDateRange
				bind:sortingMethod
				bind:selectedQuest
			/>
			<QuestInfoBox bind:selectedQuest />
		</div>
	</div>
</main>
