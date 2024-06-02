<script>
	import { openModal } from 'svelte-modals';
	import { Label, Checkbox, Dropdown, DropdownItem } from 'flowbite-svelte';
	import Button from '$lib/components/common/Button.svelte';
	import { ChevronDownSolid } from 'flowbite-svelte-icons';
	import SplitButton from '$lib/components/common/SplitButton.svelte';
	import {
		getDateString,
		getDailyRange,
		getWeekRange,
		getMonthRange,
	} from '$lib/utils';
	import {
		format,
		addDays,
		subDays,
		addWeeks,
		subWeeks,
		addMonths,
		subMonths,
	} from 'date-fns';
	import Tooltip from '$lib/components/common/Tooltip.svelte';
	import QuestModal from './QuestModal.svelte';
	import TemplateListModal from '$lib/components/Templates/TemplateListModal.svelte';

	export let sortingMethod;
	export let activeDateRange;

	const createNewQuest = (data = null) => {
		// in daily view pass selected date to the modal, otherwise default to today (null)
		const sortByDay = sortingMethod === 'daily';
		// use data when creating using template
		openModal(QuestModal, {
			data,
			date: getDateString(sortByDay ? activeDateRange[0] : null),
			formAction: '?/create',
		});
	};

	let sortDropdownOpen = false;
	const handleSortingChange = (e) => {
		e.preventDefault();
		sortDropdownOpen = false;

		const categoryType = e.target.dataset.sortingType;
		sortingMethod = categoryType;

		if (sortingMethod === 'tags') return;

		switch (sortingMethod) {
			case 'daily':
				activeDateRange = getDailyRange();
				break;

			case 'weekly':
				activeDateRange = getWeekRange();
				break;

			case 'monthly':
				activeDateRange = getMonthRange();
				break;
		}
	};

	const handleScopeChange = (e, direction, toCurrent = false) => {
		e.preventDefault();
		if (sortingMethod === 'tags') return;

		// change date scope according to current sorting method
		const rangeStart = activeDateRange[0];
		switch (sortingMethod) {
			case 'weekly': {
				if (toCurrent) {
					activeDateRange = getWeekRange();
					break;
				}
				// assign either subWeeks or addWeeks to helper variable _method
				const _method = direction === 'previous' ? subWeeks : addWeeks;
				activeDateRange = getWeekRange(_method(rangeStart, 1));
				break;
			}

			case 'daily': {
				if (toCurrent) {
					activeDateRange = getDailyRange();
					break;
				}
				// assign either subDays or addDays to helper variable _method
				const _method = direction === 'previous' ? subDays : addDays;
				activeDateRange = getDailyRange(_method(rangeStart, 1));
				break;
			}

			case 'monthly': {
				if (toCurrent) {
					activeDateRange = getMonthRange();
					break;
				}
				// assign either subMonths or addMonths to helper variable _method
				const _method = direction === 'previous' ? subMonths : addMonths;
				activeDateRange = getMonthRange(_method(rangeStart, 1));
				break;
			}
		}
	};

	const showUseTemplateList = () => {
		openModal(TemplateListModal, {
			onSelect: (data) => {
				createNewQuest(data);
			},
		});
	};
</script>

<div class="flex flex-wrap gap-3">
	<Label class="flex flex-col space-y-1 text-ternary">
		<span>Show tags</span>
		<Button id="selectTagsButton">
			<iconify-icon
				width="1.5em"
				height="1.5em"
				icon="mdi:tag"
			></iconify-icon>
			<ChevronDownSolid class="-mr-1 ml-2 text-white" />
		</Button>
	</Label>
	<Dropdown
		placement={'bottom-start'}
		class="space-y-3 p-2"
	>
		<li>
			<Checkbox class="capitalize">Under construction</Checkbox>
		</li>
	</Dropdown>
	<Label class="flex flex-col space-y-1 text-ternary">
		<span>Categorize by</span>
		<Button id="selectViewButton">
			<iconify-icon
				width="1.5em"
				height="1.5em"
				icon="material-symbols:calendar-month"
			/>
			<span class="ml-3 capitalize">{sortingMethod}</span>
			<ChevronDownSolid class="-mr-1 ml-2 text-white" />
		</Button>
	</Label>
	<Dropdown
		bind:open={sortDropdownOpen}
		placement={'bottom-start'}
	>
		<DropdownItem
			data-sorting-type={'daily'}
			on:click={handleSortingChange}
		>
			Daily
		</DropdownItem>
		<DropdownItem
			data-sorting-type={'weekly'}
			on:click={handleSortingChange}
		>
			Weekly
		</DropdownItem>
		<DropdownItem
			data-sorting-type={'monthly'}
			on:click={() => {}}
		>
			Monthly
		</DropdownItem>
		<DropdownItem
			data-sorting-type={'tags'}
			on:click={() => {}}
		>
			Tags
		</DropdownItem>
	</Dropdown>

	{#if sortingMethod !== 'tags'}
		<div class="inline-flex gap-3 self-end">
			<Tooltip content={format(new Date(), 'cccc, MMMM dd')}>
				<Button
					aria-hidden="true"
					aria-label={`Today, ${format(new Date(), 'cccc, MMMM dd')}`}
					on:click={(e) => handleScopeChange(e, null, true)}
				>
					Today
				</Button>
			</Tooltip>
			<Tooltip
				content={'Previous ' + { weekly: 'week', daily: 'day' }[sortingMethod]}
			>
				<Button
					id="previousScope"
					aria-label={'Previous ' +
						{ weekly: 'week', daily: 'day' }[sortingMethod]}
					class="!p-2.5"
					on:click={(e) => handleScopeChange(e, 'previous')}
				>
					<iconify-icon
						width="1.5em"
						height="1.5em"
						icon="carbon:previous-outline"
					/>
				</Button>
			</Tooltip>
			<Tooltip
				content={'Next ' + { weekly: 'week', daily: 'day' }[sortingMethod]}
			>
				<Button
					id="nextScope"
					aria-label={'Next ' + { weekly: 'week', daily: 'day' }[sortingMethod]}
					class="!p-2.5"
					on:click={(e) => handleScopeChange(e, 'next')}
				>
					<iconify-icon
						width="1.5em"
						height="1.5em"
						icon="carbon:next-outline"
					/>
				</Button>
			</Tooltip>
		</div>
	{/if}
	<SplitButton
		selfClass="h-[41px] mt-auto"
		defaultText="New"
		defaultAction={createNewQuest}
		defaultColor="green"
		dropdownPlacement="bottom"
		dropdownId="createQuestMoreOptions"
	>
		<Button
			on:click={showUseTemplateList}
			size="sm"
			class="capitalize">Use template</Button
		>
	</SplitButton>
</div>
