<script>
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import * as rrule from 'rrule';
	const { datetime } = rrule;
	import { closeModal } from 'svelte-modals';
	import { getDateString } from '$lib/utils';
	import { saveAsTemplate } from '$lib/store/templates';
	import { Label, Input } from 'flowbite-svelte';
	import Button from '$lib/components/common/Button.svelte';
	import {
		superForm,
		intProxy,
		dateProxy as _dateProxy,
	} from 'sveltekit-superforms/client';
	import {
		getQuestIndexById,
		getRecurrenceOptions,
		updateQuestStoreWithFormData,
	} from '$lib/store/quests.js';
	import Tooltip from '$lib/components/common/Tooltip.svelte';
	import ModalWrapper from '$lib/components/common/ModalWrapper.svelte';
	import toast from 'svelte-french-toast';

	import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte';

	// isOpen is provided automatically
	export let isOpen;
	export let date = null;
	export let formAction;
	export let scope = null;
	// used when creating using template
	// template's data is passed to the modal and used as default values for the form
	export let data = null;

	let selectedRecurrence = 'none';
	let isSavedAsTemplate = false;

	const isEditing = formAction === '?/edit';
	if (isEditing) formAction += `&scope=${scope}`;

	const handleSaveAsTemplate = async (data) => {
		const res = await fetch('/api/templates', {
			method: 'POST',
			body: JSON.stringify(data),
		});

		const resJson = await res.json();
		// save locally to store
		saveAsTemplate(resJson.template);

		toast('Template saved!', {
			icon: '✅',
		});
	};

	const { form, enhance, errors, constraints } = superForm(
		data || $page.data.form,
		{
			invalidateAll: false,
			warnings: { noValidationAndConstraints: false },
			// callbacks
			onResult: async ({ result }) => {
				if (data) {
					closeModal();

					toast(isEditing ? 'Quest saved!' : 'Quest created!', {
						icon: '✅',
					});

					updateQuestStoreWithFormData(result.data);

					if (isSavedAsTemplate) {
						handleSaveAsTemplate(result.data);
					}
				}
			},
			onUpdated: async ({ form }) => {
				if (!form.valid) return;

				toast(isEditing ? 'Quest saved!' : 'Quest created!', {
					icon: '✅',
				});
				closeModal();
				// update client view
				updateQuestStoreWithFormData($page.form);

				// save quest as template
				if (isSavedAsTemplate) {
					handleSaveAsTemplate($page.form);
				}

				// reset form values back to defaults
				// TODO: come up with better solution
				selectedRecurrence = 'none';
				form.data = {
					name: 'New Quest',
					isCoinReward: true,
					reward: '',
					isRecurring: false,
					recurrencePattern: null,
				};

				// clear the search params
				if (isEditing) goto('/');
			},
		},
	);

	const dateProxy = _dateProxy(form, 'date', { format: 'date-utc' });
	const endDateProxy = _dateProxy(form, 'endDate', { format: 'date-utc' });
	const rewardProxy = intProxy(form, 'reward');

	if (date) $dateProxy = date;

	const handleDateChange = () => {
		if ($form.isRecurring) {
			updateRecurrencePattern();
		} else {
			$endDateProxy = $dateProxy;
		}
	};

	const handleRewardTypeToggle = () => {
		$form.reward = '';
		$form.isCoinReward = !$form.isCoinReward;
	};

	const handleRecurrenceChange = () => {
		$form.isRecurring = selectedRecurrence !== 'none';
		$endDateProxy = $form.isRecurring ? '9999-12-31' : $dateProxy;
		updateRecurrencePattern();
	};

	const updateRecurrencePattern = () => {
		const options = getRecurrenceOptions($form.date);
		const ruleString = options[selectedRecurrence].rule?.toString();
		// stringify to not lose newlines (see SG-173)
		$form.recurrencePattern = $form.isRecurring
			? JSON.stringify(ruleString)
			: null;
	};

	function setToday() {
		$dateProxy = getDateString();
		handleDateChange();
	}

	function setTomorrow() {
		let tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		$dateProxy = getDateString(tomorrow);
		handleDateChange();
	}

	function setNextWeek() {
		let nextWeek = new Date();
		nextWeek.setDate(nextWeek.getDate() + 7);
		$dateProxy = getDateString(nextWeek);
		handleDateChange();
	}

	let showDatePicker = false;
	function toggleCustomDate() {
		showDatePicker = !showDatePicker;
	}
	$: dateInputClass = showDatePicker ? '' : 'hidden';
</script>

<!-- enable for debuggin purposes -->
<!-- <SuperDebug data={$form} /> -->

<ModalWrapper {isOpen}>
	<form
		method="POST"
		action={formAction}
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
				{...$constraints.name}
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
		<div class="space-y-2">
			<span aria-hidden="true">Date</span>

			<style>
				.small-button {
					font-size: 0.85rem;
					padding: 9px 19px;
				}
			</style>

			<div class="my-2 flex gap-2">
				<Button
					class="small-button"
					on:click={setToday}>Today</Button
				>
				<Button
					class="small-button"
					on:click={setTomorrow}>Tomorrow</Button
				>
				<Button
					class="small-button"
					on:click={setNextWeek}>Next week</Button
				>
				<Button
					class="small-button"
					on:click={toggleCustomDate}
					>{showDatePicker ? 'Cancel' : 'Custom'}</Button
				>
			</div>

			<!-- date picker is hidden by default -->
			<Input
				type="date"
				name="date"
				class={dateInputClass}
				aria-hidden={!showDatePicker}
				bind:value={$dateProxy}
				on:change={handleDateChange}
				{...$constraints.date}
			/>
		</div>
		<select
			bind:value={selectedRecurrence}
			on:change={handleRecurrenceChange}
		>
			{#each ['none', 'daily', 'weekly', 'monthly', 'weekday'] as type}
				<option value={type}>
					{type}
				</option>
			{/each}
		</select>
		<Label class="space-y-2">
			<span>Description</span>
			<Input
				type="text"
				name="description"
				bind:value={$form.description}
				{...$constraints.description}
			/>
		</Label>
		<div class="flex gap-2">
			<Input
				class="basis-0"
				type="checkbox"
				data-cy="saveTemplateCheckbox"
				bind:value={isSavedAsTemplate}
			/>
			<span class="font-medium text-gray-900">Save as a template</span>
		</div>
		<Button
			class="small-button"
			type="submit"
			data-cy="questSubmit"
		>
			{#if isEditing}
				Save
			{:else}
				Create
			{/if}
		</Button>

		<input
			name="id"
			type="text"
			class="hidden"
			aria-hidden="true"
			bind:value={$form.id}
		/>
		<input
			name="endDate"
			type="date"
			class="hidden"
			aria-hidden="true"
			bind:value={$endDateProxy}
		/>
		<input
			name="isRecurring"
			type="checkbox"
			class="hidden"
			aria-hidden="true"
			bind:checked={$form.isRecurring}
		/>
		<input
			name="recurrencePattern"
			type="text"
			class="hidden"
			aria-hidden="true"
			bind:value={$form.recurrencePattern}
		/>
	</form>
</ModalWrapper>
