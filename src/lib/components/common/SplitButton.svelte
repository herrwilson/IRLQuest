<script>
	// @kripi-png 2.10.2023
	// normal button with dropdown for more options

	import { Button, ButtonGroup, Dropdown, DropdownItem } from 'flowbite-svelte';
	import { ChevronDownSolid } from 'flowbite-svelte-icons';

	// class for SplitButton itself
	export let selfClass = '';
	export let dropdownPlacement = 'right-start';
	// text for the main button
	export let defaultText = 'Button';
	// color for the main button
	export let defaultColor;
	// click callback for the main button
	export let defaultAction;
	// classes for the main button
	export let defaultClasses = '';

	// color for dropdown, defaults to same as main
	export let secondaryColor = defaultColor;
	// required for Dropdown's triggeredBy prop
	export let dropdownId;
</script>

<ButtonGroup class={selfClass}>
	<Button
		color={defaultColor}
		class={defaultClasses}
		on:click={() => defaultAction()}
	>
		{defaultText}
	</Button>
	<Button
		id={dropdownId}
		color={secondaryColor}
		class="!pl-0 !pr-2"
	>
		<ChevronDownSolid class="ml-2 h-3 w-3 text-white" />
	</Button>
</ButtonGroup>
<Dropdown
	triggeredBy={'#' + dropdownId}
	placement={dropdownPlacement}
	class="flex flex-col space-y-1 p-2"
>
	<slot />
</Dropdown>
