<script>
	import { page } from '$app/stores';
	import { closeModal } from 'svelte-modals';
	import { Label, Input } from 'flowbite-svelte';
	import { invalidate } from '$app/navigation';
	import { superForm, intProxy } from 'sveltekit-superforms/client';
	import { templateStore } from '$lib/store/templates';
	import Button from '$lib/components/common/Button.svelte';
	import Tooltip from '$lib/components/common/Tooltip.svelte';
	import ModalWrapper from '$lib/components/common/ModalWrapper.svelte';
	import toast from 'svelte-french-toast';

	import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte';

	// isOpen is provided automatically
	export let isOpen;
	export let template;

	const { form, enhance, errors, constraints } = superForm(template, {
		invalidateAll: false,
		// TODO: ignore the warnings as rewrite the modal using new insight from Reward rework
		warnings: { noValidationAndConstraints: false },
		// callbacks
		onResult: ({ result }) => {
			if (result.type !== 'success') return;

			toast('Template saved!', {
				icon: '✅',
			});

			closeModal();
			// refetch data and reload page
			invalidate('templates');
			// if the modal was opened from the template list on quest log
			if ($page.url.pathname === '/') {
				templateStore.update((store) => {
					// find index of reward with given id and replace it with new data
					let i = store.indexOf(
						store.find((_temp) => _temp.id === template.id),
					);
					store[i] = result.data.template;

					return store;
				});
			}
		},
	});

	const rewardProxy = intProxy(form, 'reward');

	const handleRewardTypeToggle = () => {
		$form.reward = '';
		$form.isCoinReward = !$form.isCoinReward;
	};
</script>

<!-- <SuperDebug data={$form} /> -->

<ModalWrapper {isOpen}>
	<form
		method="POST"
		action="/templates?/edit"
		class="flex flex-col gap-6 text-left"
		use:enhance
	>
		<!-- button to disable submit by pressing enter -->
		<button
			type="submit"
			class="hidden"
			aria-hidden="true"
			disabled
		/>
		<Tooltip content="Click to edit">
			<Input
				class="mx-auto !w-2/3 cursor-pointer border-0 !bg-transparent text-center !text-3xl font-medium text-ternary hover:underline"
				type="text"
				name="name"
				aria-label="Quest name"
				required
				placeholder="Enter name"
				bind:value={$form.name}
			/>
		</Tooltip>

		<div class="flex gap-2">
			<Label class="flex flex-col gap-2">
				<span>Type</span>
				<Tooltip content={$form.isCoinReward ? 'Coin' : 'Custom'}>
					<button
						id="typeToggle"
						aria-label="Coin reward"
						aria-pressed={$form.isCoinReward}
						class="flex items-center justify-center justify-self-end rounded-lg bg-white p-1.5 text-3xl"
						on:click|preventDefault|stopPropagation={handleRewardTypeToggle}
					>
						<!-- elements are created and hidden if not active to prevent loading on toggle -->
						<iconify-icon
							class:hidden={!$form.isCoinReward}
							icon="ri:copper-coin-line"
						/>
						<iconify-icon
							class:hidden={$form.isCoinReward}
							icon="material-symbols:text-fields-rounded"
						/>
					</button>
				</Tooltip>
			</Label>
			<Label class="flex-1 space-y-2">
				<span>Reward</span>
				{#if $form.isCoinReward}
					<Input
						name="reward"
						type="number"
						aria-label="Coin reward"
						placeholder="Enter coin reward"
						bind:value={$rewardProxy}
						min="0"
						max="100000"
					/>
				{:else}
					<Input
						name="reward"
						type="text"
						aria-label="Custom reward"
						placeholder="Chocolate bar"
						bind:value={$form.reward}
					/>
				{/if}
			</Label>
		</div>
		<Label class="space-y-2">
			<span>Description</span>
			<Input
				type="text"
				name="description"
				bind:value={$form.description}
			/>
		</Label>
		<Button
			class="w-full"
			type="submit"
			data-cy="templateSubmit"
		>
			Save
		</Button>

		<input
			name="id"
			type="text"
			class="hidden"
			aria-hidden="true"
			bind:value={$form.id}
		/>
	</form>
</ModalWrapper>
