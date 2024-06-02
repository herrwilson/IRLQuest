import { browser } from '$app/environment';
import {
	format,
	startOfDay,
	endOfDay,
	startOfWeek,
	endOfWeek,
	isSameWeek,
	startOfMonth,
	endOfMonth,
	isSameMonth,
} from 'date-fns';

// generate timestamp for id
export const _getNewId = () => Date.now().toString();

export const minifyData = (obj) => {
	return JSON.stringify(obj);
};

export const deminifyData = (string) => {
	try {
		return JSON.parse(string);
	} catch (e) {
		return [];
	}
};

export const isMobile = () => {
	if (!browser) return false;
	// return true if smaller than 768px, (tailwind md-prefix wont trigger)
	return window.matchMedia('(max-width: 767px)').matches;
};

// function used to parse given timestamp or date, or to default to current date
const parseDateString = (unixOrDate) => {
	return unixOrDate ? new Date(unixOrDate) : new Date();
};

// if no parameter is passed use current date
// parameter can be either a timestamp or a string representation of a date
export const getDayName = (unixOrDate = false) => {
	return format(parseDateString(unixOrDate), 'EEEE');
};

export const getDateString = (unixOrDate = false) => {
	return format(parseDateString(unixOrDate), 'yyyy-MM-dd');
};

export const getLocalDateString = (unixOrDate = false) => {
	return format(parseDateString(unixOrDate), 'P');
};

export const getDailyRange = (unixOrDate = false) => {
	const date = parseDateString(unixOrDate);
	return [startOfDay(date), endOfDay(date)];
};

export const getWeekRange = (unixOrDate = false) => {
	const date = parseDateString(unixOrDate);
	const startDate = startOfWeek(date, { weekStartsOn: 1 });
	const endDate = endOfWeek(date, { weekStartsOn: 1 });
	return [startDate, endDate];
};

export const isInWeekRange = (date, range) => {
	return isSameWeek(new Date(date), range[0], { weekStartsOn: 1 });
};

export const getMonthRange = (unixOrDate = false) => {
	const date = parseDateString(unixOrDate);
	const startDate = startOfMonth(date, { weekStartsOn: 1 });
	const endDate = endOfMonth(date, { weekStartsOn: 1 });
	return [startDate, endDate];
};

export const isInMonthRange = (date, range) => {
	return isSameMonth(new Date(date), range[0], { weekStartsOn: 1 });
};
