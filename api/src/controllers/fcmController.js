const prisma = require('../config/prisma');

exports.registerFcmToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;
    if (!fcmToken) return res.status(400).json({ error: 'fcmToken is required' });

    await prisma.user.update({
      where: { id: req.userId },
      data: { fcmToken },
    });

    return res.json({ message: 'FCM token registered' });
  } catch (err) {
    console.error('Register FCM token error:', err);
    return res.status(500).json({ error: 'Failed to register FCM token' });
  }
};

exports.removeFcmToken = async (req, res) => {
  try {
    await prisma.user.update({
      where: { id: req.userId },
      data: { fcmToken: null },
    });

    return res.json({ message: 'FCM token removed' });
  } catch (err) {
    console.error('Remove FCM token error:', err);
    return res.status(500).json({ error: 'Failed to remove FCM token' });
  }
};
