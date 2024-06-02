import { writable, get } from 'svelte/store';

export const coinStore = writable(0);

export const removeCoinsFromBalance = (coins) => {
	return new Promise((resolve, reject) => {
		// if price is invalid
		if (isNaN(parseInt(coins))) {
			throw RangeError('Coins should be a positive integer.');
			reject();
		}
		// if user doesn't have enough coins
		if (coins > get(coinStore)) {
			throw RangeError('Not enough coins.');
			reject();
		}

		// save changes
		fetch('/api/user', {
			method: 'POST',
			body: JSON.stringify({
				type: 'coins',
				data: get(coinStore),
			}),
		})
			.then(() => {
				coinStore.update((value) => value - parseInt(coins));
				resolve();
			})
			.catch(reject);
	});
};
