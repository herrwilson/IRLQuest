<script>
	import InventoryItem from '$lib/components/Inventory/InventoryItem.svelte';

	export let data;
</script>

<div
	id="inventoryList"
	class="mx-auto flex flex-col flex-wrap items-center gap-4 px-5 tablet:flex-row"
>
	{#each data.inventory as reward}
		<InventoryItem {reward} />
	{/each}
</div>
