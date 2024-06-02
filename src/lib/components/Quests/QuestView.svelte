<script>
	import { onMount } from 'svelte';
	import * as rrule from 'rrule';
	const { rrulestr } = rrule;
	import { browser } from '$app/environment';
	import { questStore } from '$lib/store/quests';
	import { format, eachDayOfInterval } from 'date-fns';
	import {
		getDayName,
		getDateString,
		getLocalDateString,
		getWeekRange,
		isInWeekRange,
	} from '$lib/utils';
	import QuestList from './QuestList.svelte';
	import QuestCategory from './QuestCategory.svelte';

	export let activeDateRange;
	export let sortingMethod;
	export let selectedQuest;

	// METHODS
	const getActiveQuests = (quests) => {
		if (!quests) return [];
		return quests.filter((quest) => !quest.isCompleted);
	};

	const getActiveQuestCount = (categories) => {
		return categories.reduce((acc, [dayName, quests]) => {
			return (acc += getActiveQuests(quests).length);
		}, 0);
	};

	const getRecurringQuests = (quests) => {
		return quests.filter(
			(quest) => quest.isRecurring && quest.recurrencePattern,
		);
	};

	const getWeekdayCategories = (dateRange) => {
		// eachDayOfInterval returns a list of dates in given interval
		const arrayOfDates = eachDayOfInterval({
			start: dateRange[0],
			end: dateRange[1],
		}).map(getDateString);
		const weekdayCategories = arrayOfDates.reduce((obj, date) => {
			return { ...obj, [date]: [] };
		}, {});

		return weekdayCategories;
	};

	const populateWithRecurringQuests = (categories, quests, dateRange) => {
		if (!quests) return categories;

		quests.forEach((quest) => {
			// generate a list of occurences of a quest for a date range,
			// map dates to YYYY-MM-DD format, and copy the quest for each date
			const rule = rrulestr(quest.recurrencePattern, { forceset: true });
			rule
				.between(dateRange[0], dateRange[1], true)
				.map(getDateString)
				.forEach((date, index) => {
					// copy the real quest and set new date and id
					const copyOfQuest = { ...quest, date, id: `${quest.id}_${index}` };
					categories[date].push(copyOfQuest);
				});
		});

		return categories;
	};

	const getQuestsForTheDay = (quests, dateRange) => {
		// initialize an empty category
		const date = getDateString(dateRange[0]);
		const categories = { [date]: [] };
		// return the empty category if there are no quests
		if (!quests) return Object.entries(categories);
		// populate category
		const questsForTheDate = quests.filter(
			(quest) => getDateString(quest.date) === date,
		);
		categories[date].push(...questsForTheDate);

		const recurringQuestCategory = populateWithRecurringQuests(
			categories,
			getRecurringQuests(quests),
			dateRange,
		);

		return Object.entries(recurringQuestCategory);
	};

	const categorizeByWeekday = (quests, dateRange) => {
		const categories = getWeekdayCategories(dateRange);
		// if there are no quests, return empty categories
		if (!quests) return Object.entries(categories);
		// populate categories with non-recurring quests
		// recurring quests will be added later
		quests
			.filter((quest) => {
				return !quest.isRecurring && isInWeekRange(quest.date, dateRange);
			})
			.forEach((quest) => categories[getDateString(quest.date)].push(quest));

		const recurringQuestCategory = populateWithRecurringQuests(
			categories,
			getRecurringQuests(quests),
			dateRange,
		);

		return Object.entries(recurringQuestCategory);
	};

	const sortingMethods = {
		daily: getQuestsForTheDay,
		weekly: categorizeByWeekday,
		monthly: () => {},
		tags: () => {},
	};

	const fetchQuests = async (dateRange) => {
		const response = await fetch(
			`/api/quests?start=${dateRange[0]}&end=${dateRange[1]}`,
		);
		const data = await response.json();
		questStore.set(data.quests);
	};

	onMount(async () => {
		if ($questStore.length === 0) fetchQuests(activeDateRange);
	});

	$: quests = $questStore;
	$: if (browser) fetchQuests(activeDateRange);
	$: sortMethod = sortingMethods[sortingMethod];
	$: sortedQuests = sortMethod(quests, activeDateRange);
	$: activeQuestCount = getActiveQuestCount(sortedQuests);
</script>

<div
	id="categoriesList"
	class="h-full overflow-y-scroll rounded-lg border-2 border-ternary p-3 tablet:flex-1"
>
	<h1 class="text-2xl font-bold">
		Active Quests ({activeQuestCount})
	</h1>

	{#if sortingMethod !== 'daily'}
		<time
			datetime={getDateString(activeDateRange[0]) +
				'/' +
				getDateString(activeDateRange[1])}
		>
			{getLocalDateString(activeDateRange[0])}
			&ndash;
			{getLocalDateString(activeDateRange[1])}
		</time>
	{:else}
		<p class="text-xl font-bold">
			<time datetime={getDateString(activeDateRange[0])}>
				{format(activeDateRange[0], 'cccc, MMMM dd')}
			</time>
		</p>
	{/if}

	{#if sortingMethod !== 'daily'}
		{#each sortedQuests as [date, quests]}
			{@const hasQuests = getActiveQuests(quests).length > 0}
			{@const completionCount = quests.length - getActiveQuests(quests).length}
			<QuestCategory
				bind:selectedQuest
				dayName={getDayName(date)}
				{hasQuests}
				{quests}
				{completionCount}
			/>
		{/each}
	{:else}
		<QuestList
			bind:selectedQuest
			quests={sortedQuests[0][1]}
			itemClass="text-lg"
		>
			<p
				slot="noQuestsText"
				class="mt-10 text-center text-xl font-bold"
			>
				No quests for the day
			</p>
		</QuestList>
	{/if}
</div>

<style>
	#categoriesList::-webkit-scrollbar {
		@apply w-6;
	}

	#categoriesList::-webkit-scrollbar-button {
		@apply h-2;
	}

	#categoriesList::-webkit-scrollbar-thumb {
		@apply bg-ternary;
		@apply border-solid;
		@apply border-primary;
		@apply border-x-[.5em];
		border-radius: 100% 100% 100% 100% / 10% 10% 10% 10%;
	}

	@media (min-width: 768px) {
		#categoriesList::-webkit-scrollbar-thumb {
			border-radius: 100% 100% 100% 100% / 4% 4% 4% 4%;
		}
	}
</style>
