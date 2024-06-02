import { z } from 'zod';
import { db } from '$lib/firebase/admin';
import { fail, json, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/server';

export async function load({ locals, fetch, depends }) {
	const res = await fetch('/api/templates');
	const { templates } = await res.json();

	// for some reason invalidating /api/templates does not work, so use depends instead
	// look into again after updaing svelte
	depends('templates');

	return {
		templates,
		session: await locals.getSession(),
	};
}

const schema = z.object({
	id: z.string().nullable().default(null),
	name: z.string().default('New Quest'),
	reward: z.union([z.number().int().min(0).max(100000), z.string()]).default(0),
	isCoinReward: z.boolean().default(true),
	description: z.string().optional().default(''),
});

export const actions = {
	edit: async ({ request, locals, url }) => {
		const session = await locals.getSession();
		if (!session) return fail(401);

		const form = await superValidate(request, schema);

		if (!form.valid) {
			return fail(400, { form });
		}

		const DOC_REF = await db
			.collection('users')
			.doc(session.user.id)
			.collection('templates')
			.doc(form.data.id);

		const item = await DOC_REF.get();
		if (!item.exists) {
			return fail(404, {
				form,
				message: `no templates found with id ${form.data.id}`,
			});
		}

		DOC_REF.set({ ...form.data }, { merge: true });
		return { form, template: form.data };
	},
};
