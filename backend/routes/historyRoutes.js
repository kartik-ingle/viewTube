const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, historyController.addToHistory);
router.get('/', authMiddleware, historyController.getUserHistory);
router.delete('/', authMiddleware, historyController.clearHistory);
router.delete('/:id', authMiddleware, historyController.deleteHistoryEntry);

module.exports = router;