// ============================================================
// FCM Notification Service — v3.0.0
// ============================================================

const { getFirebaseAdmin } = require('../config/firebase');
const { prisma } = require('../config/database');
const logger = require('../utils/logger');

// Send push notification to a single user
const sendNotification = async ({ userId, title, body, data = {} }) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { fcmToken: true },
    });

    if (!user || !user.fcmToken) {
      logger.warn(`No FCM token for user ${userId}`);
      return { success: false, reason: 'no_token' };
    }

    const admin = getFirebaseAdmin();
    const message = {
      notification: { title, body },
      data: { ...data, title, body },
      token: user.fcmToken,
      android: { priority: 'high' },
      apns: { payload: { aps: { sound: 'default' } } },
    };

    const response = await admin.messaging().send(message);
    logger.info(`Notification sent to ${userId}: ${response}`);

    // Save notification to database
    await prisma.notification.create({
      data: {
        userId,
        type: data.type || 'SYSTEM',
        title,
        body,
        data,
      },
    });

    return { success: true, messageId: response };
  } catch (error) {
    logger.error('Notification send failed:', error.message);
    return { success: false, reason: error.message };
  }
};

// Send to multiple users
const sendMulticastNotification = async ({ userIds, title, body, data = {} }) => {
  try {
    const users = await prisma.user.findMany({
      where: { id: { in: userIds }, fcmToken: { not: null } },
      select: { id: true, fcmToken: true },
    });

    if (users.length === 0) {
      return { success: false, reason: 'no_tokens' };
    }

    const admin = getFirebaseAdmin();
    const tokens = users.map(u => u.fcmToken);

    const message = {
      notification: { title, body },
      data: { ...data, title, body },
      tokens,
      android: { priority: 'high' },
      apns: { payload: { aps: { sound: 'default' } } },
    };

    const response = await admin.messaging().sendMulticast(message);
    logger.info(`Multicast notification: ${response.successCount} sent, ${response.failureCount} failed`);

    // Save notifications for each user
    await prisma.notification.createMany({
      data: users.map(u => ({
        userId: u.id,
        type: data.type || 'SYSTEM',
        title,
        body,
        data,
      })),
    });

    return { success: true, successCount: response.successCount, failureCount: response.failureCount };
  } catch (error) {
    logger.error('Multicast notification failed:', error.message);
    return { success: false, reason: error.message };
  }
};

// Send to all users with a specific role
const sendRoleNotification = async ({ role, title, body, data = {} }) => {
  const users = await prisma.user.findMany({
    where: { role, fcmToken: { not: null }, isActive: true },
    select: { id: true },
  });
  return sendMulticastNotification({
    userIds: users.map(u => u.id),
    title, body, data,
  });
};

module.exports = { sendNotification, sendMulticastNotification, sendRoleNotification };
