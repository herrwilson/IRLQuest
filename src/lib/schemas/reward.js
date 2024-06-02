import { z } from 'zod';

const rewardSchema = z
	.object({
		id: z.string(),
		name: z.string().trim(),
		price: z.number().int().min(0).max(100000),
		description: z.string().trim().nullish(),
		quantityInStore: z.number().int().min(1).max(99),
		quantityInInventory: z.number().min(0).default(0),
		isInfinite: z.boolean().default(false),
		imageUrl: z.string().trim().url().nullish(),
		isInventoryOnly: z.boolean().default(false),
	})
	.partial()
	.required({
		name: true,
		price: true,
	});

export default rewardSchema;
