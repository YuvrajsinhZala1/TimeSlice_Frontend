const express = require('express');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const Task = require('../models/Task');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user's chats
router.get('/', auth, async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user.id,
      isActive: true
    })
    .populate('participants', 'username isOnline lastSeen')
    .populate('taskId', 'title status')
    .populate('lastMessage')
    .sort({ lastActivity: -1 });

    res.json(chats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get chat messages
router.get('/:chatId/messages', auth, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const chat = await Chat.findById(req.params.chatId);
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (!chat.participants.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const messages = await Message.find({ chatId: req.params.chatId })
      .populate('senderId', 'username')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Mark messages as read
    await Message.updateMany(
      { 
        chatId: req.params.chatId,
        senderId: { $ne: req.user.id },
        'readBy.userId': { $ne: req.user.id }
      },
      {
        $push: {
          readBy: {
            userId: req.user.id,
            readAt: new Date()
          }
        }
      }
    );

    res.json(messages.reverse());
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send message
router.post('/:chatId/messages', auth, async (req, res) => {
  try {
    const { content } = req.body;

    const chat = await Chat.findById(req.params.chatId);
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (!chat.participants.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const message = new Message({
      chatId: req.params.chatId,
      senderId: req.user.id,
      content,
      readBy: [{
        userId: req.user.id,
        readAt: new Date()
      }]
    });

    await message.save();

    // Update chat last activity and message
    chat.lastMessage = message._id;
    chat.lastActivity = new Date();
    await chat.save();

    await message.populate('senderId', 'username');

    res.status(201).json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get unread message count
router.get('/unread-count', auth, async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user.id,
      isActive: true
    });

    let unreadCount = 0;

    for (const chat of chats) {
      const count = await Message.countDocuments({
        chatId: chat._id,
        senderId: { $ne: req.user.id },
        'readBy.userId': { $ne: req.user.id }
      });
      unreadCount += count;
    }

    res.json({ unreadCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;