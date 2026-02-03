const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const connectDB = require('./config/db');
const notificationRoutes = require('./routes/notificationRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const appUsageRoutes = require('./routes/appUsageRoutes');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const videoRoutes = require('./routes/videoRoutes');
const commentRoutes = require('./routes/commentRoutes');
const userRoutes = require('./routes/userRoutes');
const historyRoutes = require('./routes/historyRoutes');
const playlistRoutes = require('./routes/playlistRoutes');

// Initialize express app
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(morgan('dev'));
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger to ensure we see every hit
app.use((req, res, next) => {
    console.log(`[DEBUG] Incoming Request: ${req.method} ${req.url}`);
    next();
});


// Routes
app.use('/api/notifications', notificationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/app-usage', appUsageRoutes);

// Test route
app.get('/', (req, res) => {
    res.json({ message: 'ViewTube API is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        name: err.name || 'InternalServerError',
        message: err.message || 'Something went wrong!'
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
})