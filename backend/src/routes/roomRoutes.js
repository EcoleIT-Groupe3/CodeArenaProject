const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const auth = require('../middleware/auth');

router.post('/', auth, roomController.createRoom);
router.get('/', auth, roomController.getActiveRooms);
router.get('/:id', auth, roomController.getRoomById);
router.post('/join', auth, roomController.joinRoom);
router.delete('/:id/leave', auth, roomController.leaveRoom);
router.get('/:id/participants', auth, roomController.getRoomParticipants);
router.patch('/:id/status', auth, roomController.updateRoomStatus);
router.get('/:id/chat', auth, roomController.getChatMessages);
router.post('/:id/chat', auth, roomController.sendChatMessage);

module.exports = router;
