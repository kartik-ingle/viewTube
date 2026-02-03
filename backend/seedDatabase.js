const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Video = require('./models/Video');
const Comment = require('./models/Comment');

// Sample data
const CATEGORIES = ['Education', 'Entertainment', 'Gaming', 'Music', 'News', 'Sports', 'Technology', 'Travel', 'Vlog', 'General'];

const SAMPLE_USERS = [
    { username: 'techguru', email: 'tech@example.com', channelName: 'Tech Guru', description: 'Technology reviews and tutorials' },
    { username: 'gamerpro', email: 'gamer@example.com', channelName: 'Pro Gamer', description: 'Gaming walkthroughs and reviews' },
    { username: 'musiclover', email: 'music@example.com', channelName: 'Music Vibes', description: 'Music covers and originals' },
    { username: 'travelvlog', email: 'travel@example.com', channelName: 'Travel Explorer', description: 'Travel vlogs from around the world' },
    { username: 'cookingtips', email: 'cooking@example.com', channelName: 'Chef\'s Kitchen', description: 'Cooking recipes and tips' },
    { username: 'fitnesscoach', email: 'fitness@example.com', channelName: 'Fitness Hub', description: 'Workout routines and health tips' },
    { username: 'artcreator', email: 'art@example.com', channelName: 'Art Studio', description: 'Digital art tutorials' },
    { username: 'sciencefacts', email: 'science@example.com', channelName: 'Science Daily', description: 'Interesting science facts' },
    { username: 'comedycentral', email: 'comedy@example.com', channelName: 'Laugh Factory', description: 'Comedy sketches and stand-up' },
    { username: 'newsupdates', email: 'news@example.com', channelName: 'News Flash', description: 'Latest news and updates' },
];

const SAMPLE_VIDEOS = [
    // Tech
    { title: 'Building a Full Stack App in 2024', description: 'Complete guide to building modern web applications', category: 'Technology', tags: ['programming', 'tutorial', 'web dev'] },
    { title: 'React Best Practices 2024', description: 'Learn the latest React patterns and practices', category: 'Technology', tags: ['react', 'javascript', 'frontend'] },
    { title: 'AI Tools That Will Change Everything', description: 'Exploring the latest AI innovations', category: 'Technology', tags: ['ai', 'tools', 'future'] },
    { title: 'Cloud Computing Explained', description: 'Understanding cloud platforms and services', category: 'Technology', tags: ['cloud', 'aws', 'devops'] },

    // Gaming
    { title: 'Top 10 Games of 2024', description: 'The best games released this year', category: 'Gaming', tags: ['gaming', 'reviews', 'top10'] },
    { title: 'Speedrun World Record Attempt', description: 'Attempting to break the speedrun record', category: 'Gaming', tags: ['speedrun', 'gaming', 'challenge'] },
    { title: 'Gaming Setup Tour 2024', description: 'My complete gaming setup revealed', category: 'Gaming', tags: ['setup', 'gaming', 'tech'] },
    { title: 'Indie Games You Must Play', description: 'Hidden gem indie games worth your time', category: 'Gaming', tags: ['indie', 'gaming', 'recommendations'] },

    // Music
    { title: 'Learn Guitar in 30 Days', description: 'Complete beginner guitar course', category: 'Music', tags: ['guitar', 'tutorial', 'music'] },
    { title: 'Top Songs of the Month', description: 'The hottest tracks right now', category: 'Music', tags: ['music', 'playlist', 'trending'] },
    { title: 'Music Production Tips', description: 'How to produce professional sounding music', category: 'Music', tags: ['production', 'daw', 'tutorial'] },
    { title: 'Classical Music for Focus', description: '2 hours of relaxing classical music', category: 'Music', tags: ['classical', 'study', 'relaxing'] },

    // Education
    { title: 'Python Programming for Beginners', description: 'Start your coding journey with Python', category: 'Education', tags: ['python', 'programming', 'tutorial'] },
    { title: 'Math Made Easy: Calculus', description: 'Understanding calculus concepts simply', category: 'Education', tags: ['math', 'calculus', 'education'] },
    { title: 'History of Ancient Rome', description: 'Exploring the Roman Empire', category: 'Education', tags: ['history', 'rome', 'documentary'] },
    { title: 'Science Experiments at Home', description: 'Fun experiments you can do at home', category: 'Education', tags: ['science', 'experiments', 'fun'] },

    // Travel
    { title: 'Exploring Tokyo Japan', description: 'A week in Tokyo - travel vlog', category: 'Travel', tags: ['japan', 'travel', 'vlog'] },
    { title: 'Budget Travel Tips Europe', description: 'How to travel Europe on a budget', category: 'Travel', tags: ['travel', 'budget', 'europe'] },
    { title: 'Best Beaches in Thailand', description: 'Top beach destinations in Thailand', category: 'Travel', tags: ['thailand', 'beach', 'travel'] },
    { title: 'Solo Travel Guide', description: 'Everything you need to know about solo travel', category: 'Travel', tags: ['solo', 'travel', 'tips'] },

    // Entertainment
    { title: 'Movie Reviews: Latest Releases', description: 'Reviewing the newest movies', category: 'Entertainment', tags: ['movies', 'reviews', 'entertainment'] },
    { title: 'Stand Up Comedy Special', description: 'Full stand-up comedy show', category: 'Entertainment', tags: ['comedy', 'standup', 'funny'] },
    { title: 'Celebrity Interviews', description: 'Exclusive celebrity conversations', category: 'Entertainment', tags: ['celebrity', 'interview', 'entertainment'] },
    { title: 'Magic Tricks Revealed', description: 'Learn amazing magic tricks', category: 'Entertainment', tags: ['magic', 'tricks', 'tutorial'] },

    // Sports
    { title: 'Best Football Goals 2024', description: 'Top goals from this season', category: 'Sports', tags: ['football', 'goals', 'highlights'] },
    { title: 'Basketball Training Drills', description: 'Improve your basketball skills', category: 'Sports', tags: ['basketball', 'training', 'sports'] },
    { title: 'Extreme Sports Compilation', description: 'The most extreme sports moments', category: 'Sports', tags: ['extreme', 'sports', 'action'] },
    { title: 'Yoga for Beginners', description: 'Start your yoga journey', category: 'Sports', tags: ['yoga', 'fitness', 'wellness'] },

    // Vlog
    { title: 'A Day in My Life', description: 'Come spend the day with me', category: 'Vlog', tags: ['vlog', 'daily', 'lifestyle'] },
    { title: 'Morning Routine 2024', description: 'My productive morning routine', category: 'Vlog', tags: ['morning', 'routine', 'productivity'] },
    { title: 'Weekly Vlog #47', description: 'What I did this week', category: 'Vlog', tags: ['weekly', 'vlog', 'life'] },
    { title: 'Moving to a New City', description: 'My moving experience and tips', category: 'Vlog', tags: ['moving', 'vlog', 'life'] },
];

const SAMPLE_THUMBNAILS = [
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400',
    'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400',
    'https://images.unsplash.com/photo-1496065187959-7f07b8353c55?w=400',
    'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400',
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
    'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400',
    'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400',
    'https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=400',
];

const SAMPLE_VIDEO_URLS = [
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
];

async function seedDatabase() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await User.deleteMany({});
        await Video.deleteMany({});
        await Comment.deleteMany({});
        console.log('✅ Cleared existing data');

        // Create users
        console.log('👥 Creating users...');
        const hashedPassword = await bcrypt.hash('password123', 10);
        const users = [];

        for (const userData of SAMPLE_USERS) {
            const user = await User.create({
                username: userData.username,
                email: userData.email,
                password: hashedPassword,
                channelName: userData.channelName,
                channelDescription: userData.description,
                profilePicture: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.channelName)}&background=random&size=200`,
            });
            users.push(user);
        }
        console.log(`✅ Created ${users.length} users`);

        // Create cross-subscriptions (users subscribe to each other)
        console.log('🔗 Creating subscriptions...');
        for (let i = 0; i < users.length; i++) {
            const subscriberCount = Math.floor(Math.random() * 5) + 2;
            for (let j = 0; j < subscriberCount; j++) {
                const randomUserIndex = Math.floor(Math.random() * users.length);
                if (randomUserIndex !== i) {
                    if (!users[i].subscribedChannels.includes(users[randomUserIndex]._id)) {
                        users[i].subscribedChannels.push(users[randomUserIndex]._id);
                        users[randomUserIndex].subscribers.push(users[i]._id);
                    }
                }
            }
            await users[i].save();
        }
        console.log('✅ Created subscriptions');

        // Create videos
        console.log('🎬 Creating videos...');
        const videos = [];

        for (let i = 0; i < SAMPLE_VIDEOS.length; i++) {
            const videoData = SAMPLE_VIDEOS[i];
            const randomUser = users[Math.floor(Math.random() * users.length)];
            const randomDaysAgo = Math.floor(Math.random() * 180);
            const createdDate = new Date();
            createdDate.setDate(createdDate.getDate() - randomDaysAgo);

            const video = await Video.create({
                title: videoData.title,
                description: videoData.description,
                videoUrl: SAMPLE_VIDEO_URLS[Math.floor(Math.random() * SAMPLE_VIDEO_URLS.length)],
                thumbnailUrl: SAMPLE_THUMBNAILS[Math.floor(Math.random() * SAMPLE_THUMBNAILS.length)],
                duration: Math.floor(Math.random() * 1200) + 60, // 1-20 minutes
                views: Math.floor(Math.random() * 100000),
                category: videoData.category,
                tags: videoData.tags,
                uploadedBy: randomUser._id,
                createdAt: createdDate,
                isPublished: true,
            });

            // Add random likes (10-50% of views)
            const likeCount = Math.floor(video.views * (Math.random() * 0.4 + 0.1));
            for (let j = 0; j < Math.min(likeCount, users.length); j++) {
                const randomLiker = users[Math.floor(Math.random() * users.length)];
                if (!video.likes.includes(randomLiker._id)) {
                    video.likes.push(randomLiker._id);
                }
            }

            await video.save();
            videos.push(video);
        }
        console.log(`✅ Created ${videos.length} videos`);

        // Create comments
        console.log('💬 Creating comments...');
        let commentCount = 0;
        for (const video of videos) {
            const numComments = Math.floor(Math.random() * 8) + 2;
            for (let i = 0; i < numComments; i++) {
                const randomUser = users[Math.floor(Math.random() * users.length)];
                const comments = [
                    'Great video!',
                    'Thanks for sharing this!',
                    'Very informative',
                    'This helped me a lot',
                    'Amazing content!',
                    'Keep up the good work',
                    'Subscribed!',
                    'More videos like this please',
                ];

                await Comment.create({
                    videoId: video._id,
                    userId: randomUser._id,
                    text: comments[Math.floor(Math.random() * comments.length)],
                });
                commentCount++;
            }
        }
        console.log(`✅ Created ${commentCount} comments`);

        console.log('\n🎉 Database seeded successfully!');
        console.log('\n📊 Summary:');
        console.log(`   👥 Users: ${users.length}`);
        console.log(`   🎬 Videos: ${videos.length}`);
        console.log(`   💬 Comments: ${commentCount}`);
        console.log('\n🔐 All users have password: password123');
        console.log('\n✨ You can now login with any of these accounts:');
        users.slice(0, 5).forEach(user => {
            console.log(`   📧 ${user.email}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();