<script>
	import { BugSolid, OpenBookSolid } from 'flowbite-svelte-icons';
</script>

<footer class="fixed bottom-0 hidden select-none laptop:flex">
	<div class="made-with-wrapper flex flex-col p-5">
		<div class="flex gap-5 text-xl text-ternary">
			<a
				class=""
				target="_blank"
				href="https://docs.google.com/forms/d/e/1FAIpQLScbr2q9o6nui4HNxHboyX63TzOmvuqoOEJPWSNeLlwIPD-DHA/viewform"
			>
				Feedback <OpenBookSolid
					class="inline"
					size="md"
				/>
			</a>
			<a
				class=""
				target="_blank"
				href="https://docs.google.com/forms/d/e/1FAIpQLScfgjEoZ1Tvw2u1DY-Z58-18IAKvsvI7G9lAX7IloMtg5FpZg/viewform"
			>
				Bug report <BugSolid
					class="inline"
					size="md"
				/>
			</a>
		</div>
	</div>
</footer>
