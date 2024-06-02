<script>
	import { onMount } from 'svelte';
	import { closeModal } from 'svelte-modals';
	import { superForm } from 'sveltekit-superforms/client';
	import { Label, Input } from 'flowbite-svelte';
	import Button from '$lib/components/common/Button.svelte';
	import Tooltip from '$lib/components/common/Tooltip.svelte';
	import ModalWrapper from '$lib/components/common/ModalWrapper.svelte';
	import toast from 'svelte-french-toast';
	import TextField from '$lib/components/common/forms/TextField.svelte';
	import Checkbox from '$lib/components/common/forms/Checkbox.svelte';

	import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte';

	// provided automatically
	export let isOpen;
	// superValidated data, either from PageData or manually in RewardItem
	export let data;
	export let edit = false;

	// formData is needed for formFieldProxy that is used inside TextField
	// therefore we do not deconstruct it immediately
	const formData = superForm(data, {
		resetForm: true,
		// events
		onSubmit: ({ formData }) => {
			// send tainted data to the server when editing
			if (edit) {
				formData.set('tainted', JSON.stringify($tainted));
			}
		},
		onUpdate: async ({ form }) => {
			closeModal();
			toast.success(edit ? 'Reward saved' : 'Reward created');
		},
		onError: ({ result }) => {
			toast.error('Client error');
			console.error(result);
		},
	});
	const { form, constraints, errors, enhance, tainted } = formData;

	// FIXME: for unknown reason even though data contains edited reward's information
	// the values are not applied to the form.
	// it may be a bug on superforms' side
	// so consider making an MRE and asking on Discord or creating an issue
	onMount(() => {
		if (edit) {
			for (const key of Object.keys(data.data)) {
				const value = data.data[key];
				$form[key] = value;
			}
			// previous taints the form so reset tainted store
			tainted.set({});
		}
	});
</script>

<!-- enable for debuggin purposes -->
<!-- <SuperDebug data={$form} />-->
<ModalWrapper {isOpen}>
	<h1 class="text-xl">
		{#if edit}
			Edit Reward
		{:else}
			Create Reward
		{/if}
	</h1>
	<form
		class="flex flex-col gap-6 text-left"
		method="POST"
		use:enhance
	>
		<input
			type="hidden"
			name="id"
			bind:value={$form.id}
			{...$constraints.id}
		/>

		<TextField
			form={formData}
			field="name"
			label="Name"
			data-cy="rewardName"
		/>

		<TextField
			form={formData}
			field="price"
			label="Price"
			type="number"
			data-cy="rewardPrice"
		/>

		<TextField
			form={formData}
			field="description"
			label="Description"
			placeholder="The best reward"
		/>

		<TextField
			form={formData}
			field="imageUrl"
			label="Image URL"
			type="url"
			placeholder="https://google.com/image.png"
		/>

		<div class="flex gap-2">
			<TextField
				form={formData}
				field="quantityInStore"
				label="Quantity"
				type="number"
				data-cy="Modalquantity"
			/>

			<Checkbox
				form={formData}
				field="isInfinite"
				label="Infinite"
				class="p-5"
			/>
		</div>

		<Button
			class="w-full"
			type="submit"
		>
			Save
		</Button>
	</form>
</ModalWrapper>
