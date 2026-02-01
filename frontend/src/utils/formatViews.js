export const formatViews = (views) => {
    if (!views) return '0 views';

    if (views < 1000) {
        return `${views} views`;
    } else if (views < 1000000) {
        return `${(views / 1000).toFixed(1)}K views`;
    } else if (views < 1000000000) {
        return `${(views / 1000000).toFixed(1)}M views`;
    } else {
        return `${(views / 1000000000).toFixed(1)}B views`;
    }
};

export const formatDuration = (seconds) => {
    if (!seconds) return '0:00';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
};

export const formatSubscribers = (count) => {
    if (!count) return '0 subscribers';

    if (count === 1) return '1 subscriber';

    if (count < 1000) {
        return `${count} subscribers`;
    } else if (count < 1000000) {
        return `${(count / 1000).toFixed(1)}K subscribers`;
    } else {
        return `${(count / 1000000).toFixed(1)}M subscribers`;
    }
};