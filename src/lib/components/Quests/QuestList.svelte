<script>
	export let quests;
	export let selectedQuest;
	export let itemClass = '';
</script>

<ul>
	{#each quests as quest}
		<li role="none">
			<button
				on:click={() => (selectedQuest = quest)}
				on:keypress={() => (selectedQuest = quest)}
				class={'max-w-sm' + itemClass ? ' ' + itemClass : ''}
				class:font-bold={selectedQuest === quest}
				class:line-through={quest.isCompleted}
				class:opacity-50={quest.isCompleted}
			>
				{quest.name}
			</button>
		</li>
	{:else}
		<slot name="noQuestsText" />
	{/each}
</ul>
