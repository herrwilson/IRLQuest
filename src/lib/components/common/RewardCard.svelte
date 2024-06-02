<script>
	import { CashOutline } from 'flowbite-svelte-icons';

	export let showQuantity = true;
	export let showDescription = true;

	let isHovering = false;
</script>

<div
	class="relative flex min-h-[370px] max-w-[300px] shrink-0 flex-col rounded-lg bg-secondary pb-2"
	role="listitem"
	on:mouseenter={() => (isHovering = true)}
	on:mouseleave={() => (isHovering = false)}
>
	{#if isHovering}
		<div class="absolute right-2 top-2">
			<slot name="editButton" />
			<slot name="removeButton" />
		</div>
	{/if}
	<slot name="picture" />
	<div class="flex items-center px-4">
		<h1 class="truncate text-2xl font-bold">
			<slot name="name" />
		</h1>
		{#if showQuantity}
			<span
				class="ml-auto text-2xl"
				data-cy="RewardItemQuantity"
			>
				<slot name="quantity" />
			</span>
		{/if}
	</div>

	{#if showDescription}
		<p class="description mb-auto text-ellipsis px-4 text-sm">
			<slot name="description" />
		</p>
	{:else}
		<br />
	{/if}

	<div class="flex items-center gap-2 px-4">
		<span class="flex grow items-center gap-2 text-3xl">
			<!-- price should include both the number and the icon -->
			<slot name="price" />
		</span>
		<slot name="buyButton" />
	</div>
</div>

<style>
	.description {
		overflow: hidden;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
	}
</style>
