<script>
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { coinStore } from '$lib/store/coins';
	import { signOut } from '@auth/sveltekit/client';
	import Tooltip from '$lib/components/common/Tooltip.svelte';
	import {
		Label,
		Avatar,
		Dropdown,
		DropdownItem,
		DropdownHeader,
		DropdownDivider,
	} from 'flowbite-svelte';

	$: coinStore.set($page.data.coins);
	$: session = $page.data.session;

	let clickCount = 0;

	// Function to handle the click event on the username
	function handleUsernameClick() {
		// Increment the click counter
		clickCount++;

		// Check if the click count is equal to 3
		if (clickCount === 3) {
			// Copy the user ID to the clipboard
			const userId = session?.user.id;
			navigator.clipboard
				.writeText(userId)
				.then(() => {
					alert('User ID copied to clipboard: ' + userId);
				})
				.catch((error) => {
					console.error('Error copying to clipboard: ', error);
				});

			// Reset the click count
			clickCount = 0;
		}
	}
</script>

{#if session?.user}
	<Avatar
		id="userDrop"
		class="ml-auto"
		src={session?.user.image}
	/>
	<Dropdown
		triggeredBy="#userDrop"
		placement={'bottom-end'}
	>
		<DropdownHeader>
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<button
				class="cursor-default"
				on:click={handleUsernameClick}
			>
				{session?.user.name}
			</button>
			<DropdownDivider />
			<Label>
				<span>Balance</span>
				<div class="flex gap-1">
					<iconify-icon
						width="1.5em"
						height="1.5em"
						icon="ri:copper-coin-line"
					/>
					{$coinStore}
				</div>
			</Label>
		</DropdownHeader>

		<DropdownItem on:click={() => goto('/templates')}
			>Quest Templates</DropdownItem
		>
		<DropdownItem on:click={() => console.log('Not Implemented')}
			>Settings</DropdownItem
		>
		<DropdownItem on:click={() => goto('/about')}>About us</DropdownItem>

		<DropdownDivider />

		<DropdownItem on:click={signOut}>Sign out</DropdownItem>
	</Dropdown>
{/if}
