const express = require('express');
const router = express.Router();

router.post('/send-message', async (req, res) => {
  const { senderId, receiverId, message } = req.body;

  // Basic validation
  if (!senderId || !receiverId || !message) {
    return res.status(400).json({ message: 'Sender, receiver, and message are required' });
  }

  try {
    // Save the message to the database
    const newMessage = new Message({
      senderId,
      receiverId,
      message,
      sentAt: new Date(),
    });
    await newMessage.save();

    // Respond with a success message
    res.status(201).json({ message: 'Message sent successfully', newMessage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
