<script>
	import { onDestroy } from 'svelte';

	let dotString = '';
	const stringIterval = setInterval(() => {
		if (dotString.length < 3) return (dotString += '.');
		dotString = '';
	}, 500);

	onDestroy(() => clearInterval(stringIterval));
</script>

<p>Loading{dotString}</p>
