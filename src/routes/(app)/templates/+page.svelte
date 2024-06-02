<script>
	import { templateStore } from '$lib/store/templates.js';
	import { page } from '$app/stores';

	import TemplateItem from '$lib/components/Templates/TemplateItem.svelte';

	$: if ($page.data.templates) {
		templateStore.set($page.data.templates);
	}
</script>

<h1 class="mb-5 text-center text-3xl capitalize text-ternary">
	Quest Templates
</h1>
<ul class="flex flex-wrap justify-center gap-5">
	{#each $templateStore as template}
		<TemplateItem {template} />
	{/each}
</ul>
