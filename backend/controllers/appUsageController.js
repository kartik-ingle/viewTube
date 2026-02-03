const AppUsage = require('../models/AppUsage');
const mongoose = require('mongoose');
const moment = require('moment-timezone');

// Track app usage
exports.trackAppUsage = async (req, res) => {
    try {
        const { duration } = req.body; // duration in seconds
        const userId = req.userId;

        if (!duration || duration <= 0) {
            return res.status(400).json({ message: 'Valid duration is required' });
        }

        // Get current date in IST
        const istDate = moment.tz('Asia/Kolkata').startOf('day').toDate();

        // Create app usage entry
        await AppUsage.create({
            userId,
            duration,
            sessionDate: istDate,
            sessionStartTime: new Date()
        });

        res.status(201).json({
            message: 'App usage tracked successfully'
        });
    } catch (error) {
        console.error('Track app usage error:', error);
        res.status(500).json({ message: 'Error tracking app usage' });
    }
};

// Get today's total app usage (IST)
exports.getTodayAppUsage = async (req, res) => {
    try {
        const userId = req.userId;

        // Get start and end of today in IST
        const todayStart = moment.tz('Asia/Kolkata').startOf('day').toDate();
        const todayEnd = moment.tz('Asia/Kolkata').endOf('day').toDate();

        // Aggregate total app usage for today
        const result = await AppUsage.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                    sessionDate: {
                        $gte: todayStart,
                        $lte: todayEnd
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalSeconds: { $sum: '$duration' }
                }
            }
        ]);

        const totalSeconds = result.length > 0 ? result[0].totalSeconds : 0;
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);

        res.json({
            totalSeconds,
            hours,
            minutes,
            formatted: `${hours}h ${minutes}m`
        });
    } catch (error) {
        console.error('Get today app usage error:', error);
        res.status(500).json({ message: 'Error fetching app usage' });
    }
};

// Get app usage stats (weekly, monthly)
exports.getAppUsageStats = async (req, res) => {
    try {
        const userId = req.userId;

        // Get dates in IST
        const todayStart = moment.tz('Asia/Kolkata').startOf('day').toDate();
        const weekStart = moment.tz('Asia/Kolkata').subtract(7, 'days').startOf('day').toDate();
        const monthStart = moment.tz('Asia/Kolkata').subtract(30, 'days').startOf('day').toDate();

        // Helper function to get usage for a period
        const getUsageForPeriod = async (startDate) => {
            const result = await AppUsage.aggregate([
                {
                    $match: {
                        userId: new mongoose.Types.ObjectId(userId),
                        sessionDate: { $gte: startDate }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalSeconds: { $sum: '$duration' }
                    }
                }
            ]);
            return result[0]?.totalSeconds || 0;
        };

        const formatTime = (seconds) => {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            return {
                hours,
                minutes,
                totalSeconds: seconds,
                formatted: `${hours}h ${minutes}m`
            };
        };

        const [todaySeconds, weekSeconds, monthSeconds] = await Promise.all([
            getUsageForPeriod(todayStart),
            getUsageForPeriod(weekStart),
            getUsageForPeriod(monthStart)
        ]);

        res.json({
            today: formatTime(todaySeconds),
            week: formatTime(weekSeconds),
            month: formatTime(monthSeconds),
            dailyAverage: formatTime(Math.floor(monthSeconds / 30))
        });
    } catch (error) {
        console.error('Get app usage stats error:', error);
        res.status(500).json({ message: 'Error fetching app usage stats' });
    }
};

// Get daily breakdown for the last 7 days
exports.getDailyBreakdown = async (req, res) => {
    try {
        const userId = req.userId;

        const weekStart = moment.tz('Asia/Kolkata').subtract(7, 'days').startOf('day').toDate();

        const dailyUsage = await AppUsage.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                    sessionDate: { $gte: weekStart }
                }
            },
            {
                $group: {
                    _id: '$sessionDate',
                    totalSeconds: { $sum: '$duration' }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        const formatted = dailyUsage.map(day => ({
            date: moment(day._id).format('MMM DD'),
            hours: Math.floor(day.totalSeconds / 3600),
            minutes: Math.floor((day.totalSeconds % 3600) / 60),
            totalSeconds: day.totalSeconds
        }));

        res.json({ dailyBreakdown: formatted });
    } catch (error) {
        console.error('Get daily breakdown error:', error);
        res.status(500).json({ message: 'Error fetching daily breakdown' });
    }
};