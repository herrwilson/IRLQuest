export const load = async ({ fetch, depends }) => {
	const inventoryRes = await fetch('/api/rewards/inventory');
	const inventory = await inventoryRes.json();

	depends('get:inventory');

	return { inventory };
};
