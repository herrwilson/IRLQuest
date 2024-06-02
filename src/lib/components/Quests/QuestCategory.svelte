<script>
	import QuestList from './QuestList.svelte';

	export let hasQuests;
	export let quests;
	export let dayName;
	export let selectedQuest;
	export let completionCount;

	$: completionRate = quests.length ? `${completionCount}/${quests.length}` : 0;
</script>

<details open={hasQuests}>
	<summary>
		<p
			class="inline text-xl font-bold"
			class:opacity-50={!hasQuests}
			class:font-normal={!hasQuests}
		>
			{dayName}
			<span class="align-center text-sm">({completionRate})</span>
		</p>
	</summary>
	<QuestList
		bind:selectedQuest
		{quests}
	/>
</details>
