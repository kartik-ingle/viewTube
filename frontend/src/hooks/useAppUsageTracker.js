import { useEffect, useRef } from 'react';
import api from '../utils/api';

export const useAppUsageTracker = (isAuthenticated) => {
    const sessionStartTime = useRef(null);
    const lastSaveTime = useRef(null);
    const isPageVisible = useRef(true);

    useEffect(() => {
        if (!isAuthenticated) return;

        // Initialize session start time
        sessionStartTime.current = Date.now();
        lastSaveTime.current = Date.now();

        // Track time every 10 seconds
        const trackingInterval = setInterval(() => {
            if (isPageVisible.current) {
                trackAppUsage();
            }
        }, 10000); // Track every 10 seconds

        // Handle page visibility changes
        const handleVisibilityChange = () => {
            if (document.hidden) {
                // Page is hidden - save current session time
                isPageVisible.current = false;
                trackAppUsage();
            } else {
                // Page is visible again - reset last save time
                isPageVisible.current = true;
                lastSaveTime.current = Date.now();
            }
        };

        // Handle beforeunload (page close/refresh)
        const handleBeforeUnload = () => {
            trackAppUsage();
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('beforeunload', handleBeforeUnload);

        // Cleanup
        return () => {
            trackAppUsage(); // Final save
            clearInterval(trackingInterval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [isAuthenticated]);

    const trackAppUsage = async () => {
        if (!lastSaveTime.current) return;

        const now = Date.now();
        const timeSpentSeconds = Math.floor((now - lastSaveTime.current) / 1000);

        if (timeSpentSeconds > 0) {
            try {
                await api.post('/app-usage/track', {
                    duration: timeSpentSeconds
                });
                lastSaveTime.current = now;
            } catch (error) {
                console.error('Failed to track app usage:', error);
            }
        }
    };
};