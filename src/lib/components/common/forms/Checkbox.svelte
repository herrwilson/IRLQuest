<script>
	import { Label, Input } from 'flowbite-svelte';
	import { formFieldProxy } from 'sveltekit-superforms/client';

	export let form;
	export let field;
	export let label = null;

	const { value, errors, constraints } = formFieldProxy(form, field);
	$: boolValue = value;
</script>

<Label class="space-y-2">
	{#if label}<span>{label}</span>{/if}
	<input
		{...$$restProps}
		class={'rounded-lg' + ' ' + $$restProps.class}
		name={field}
		type="checkbox"
		bind:checked={$boolValue}
		{...$constraints}
	/>
</Label>
