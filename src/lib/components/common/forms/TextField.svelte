<script>
	import { Label, Input } from 'flowbite-svelte';
	import { formFieldProxy } from 'sveltekit-superforms/client';

	export let form;
	export let field;
	export let type = 'text';
	export let label = null;

	const { path, value, errors, constraints } = formFieldProxy(form, field);

	// set field's type on when component is mounted
	const typeAction = (node) => {
		node.type = type;
	};
</script>

<Label class="w-full space-y-2">
	{#if label}<span>{label}</span>{/if}
	<!--
	classes are yoinked from Input element
	this is because as of yet Input does not support use:action directive
	making dynamic type not possible
	-->
	<input
		class="block w-full rounded-lg border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
		name={field}
		use:typeAction
		bind:value={$value}
		{...$constraints}
		{...$$restProps}
	/>
</Label>
