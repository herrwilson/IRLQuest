import { fail } from '@sveltejs/kit';

export async function load({ locals, fetch, depends }) {
	try {
		const res = await fetch('/api/user');
		const { coins } = await res.json();

		depends('get:coins');

		return {
			coins,
			session: await locals.getSession(),
		};
	} catch (err) {
		return fail(500, { message: err });
	}
}
