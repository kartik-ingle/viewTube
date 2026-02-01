import { formatDistanceToNow } from 'date-fns';

export const formatDate = (date) => {
    if (!date) return '';

    try {
        return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch (error) {
        return '';
    }
};

export const formatFullDate = (date) => {
    if (!date) return '';

    try {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(date).toLocaleDateString(undefined, options);
    } catch (error) {
        return '';
    }
};