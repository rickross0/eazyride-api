const prisma = require('../config/prisma');
const { getFirebaseAdmin } = require('../config/firebase');

async function sendFcmMessage(fcmToken, payload) {
  try {
    const admin = getFirebaseAdmin();
    if (!admin.apps || admin.apps.length === 0) {
      console.warn('[FCM] Firebase not initialized — skipping push notification');
      return null;
    }
    const message = {
      token: fcmToken,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data || {},
      android: { priority: 'high' },
      apns: { payload: { aps: { sound: 'default' } } },
    };
    const response = await admin.messaging().send(message);
    console.log("[FCM] Sent to " + fcmToken.substring(0, 12) + "... — messageId: " + response);
    return response;
  } catch (err) {
    if (err.code === 'messaging/invalid-registration-token' || err.code === 'messaging/registration-token-not-registered') {
      console.warn('[FCM] Invalid token — clearing for user');
      await prisma.user.updateMany({ where: { fcmToken }, data: { fcmToken: null } }).catch(() => {});
    } else {
      console.error('[FCM] Send error:', err.message);
    }
    return null;
  }
}

async function notifyRideUpdate(userId, rideId, status) {
  console.log('[Notify] userId=' + userId + ' rideId=' + rideId + ' status=' + status);
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    await prisma.notification.create({
      data: {
        userId,
        type: 'RIDE_UPDATE',
        title: 'Ride Update',
        message: 'Your ride status: ' + status,
        data: { rideId, status },
      },
    });

    if (user && user.fcmToken) {
      const statusMessages = {
        REQUESTED: 'Looking for a driver...',
        DRIVER_ASSIGNED: 'A driver has been assigned!',
        DRIVER_ARRIVING: 'Your driver is on the way!',
        IN_PROGRESS: 'Your ride has started',
        COMPLETED: 'Your ride is complete',
        CANCELLED: 'Your ride was cancelled',
      };
      await sendFcmMessage(user.fcmToken, {
        title: 'Ride Update',
        body: statusMessages[status] || ('Ride ' + status),
        data: { type: 'RIDE_UPDATE', rideId, status },
      });
    }
  } catch (err) {
    console.error('[Notify] Error:', err.message);
  }
}

async function notifyOrderUpdate(userId, orderId, status) {
  console.log('[Notify] userId=' + userId + ' orderId=' + orderId + ' status=' + status);
  try {
    await prisma.notification.create({
      data: {
        userId,
        type: 'ORDER_UPDATE',
        title: 'Order Update',
        message: 'Your order status: ' + status,
        data: { orderId, status },
      },
    });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user && user.fcmToken) {
      const statusMessages = {
        PENDING: 'Order placed, waiting for confirmation',
        CONFIRMED: 'Your order has been confirmed!',
        PREPARING: 'Your food is being prepared',
        OUT_FOR_DELIVERY: 'Your order is on the way!',
        DELIVERED: 'Your order has been delivered',
        CANCELLED: 'Your order was cancelled',
      };
      await sendFcmMessage(user.fcmToken, {
        title: 'Order Update',
        body: statusMessages[status] || ('Order ' + status),
        data: { type: 'ORDER_UPDATE', orderId, status },
      });
    }
  } catch (err) {
    console.error('[Notify] Error:', err.message);
  }
}

async function sendPush(userId, title, body, data) {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.fcmToken) return null;
    return sendFcmMessage(user.fcmToken, { title, body, data: data || {} });
  } catch (err) {
    console.error('[Notify] sendPush error:', err.message);
    return null;
  }
}

async function notifyDeliveryAssignment(driverUserId, orderId, restaurantName, pickupPin) {
  console.log('[Notify] Delivery assigned: driver=' + driverUserId + ' order=' + orderId);
  try {
    await prisma.notification.create({
      data: {
        userId: driverUserId,
        type: 'DELIVERY_ASSIGNMENT',
        title: 'New Delivery',
        message: 'Pickup from ' + restaurantName + '. PIN: ' + pickupPin,
        data: { orderId, pickupPin },
      },
    });
    const driver = await prisma.user.findUnique({ where: { id: driverUserId } });
    if (driver && driver.fcmToken) {
      await sendFcmMessage(driver.fcmToken, {
        title: 'New Delivery',
        body: 'Pickup from ' + restaurantName,
        data: { type: 'DELIVERY_ASSIGNMENT', orderId },
      });
    }
  } catch (err) {
    console.error('[Notify] Delivery assignment error:', err.message);
  }
}

async function notifyDriverArrival(orderId, restaurantName) {
  console.log('[Notify] Driver arrived at restaurant for order=' + orderId);
  try {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return;
    await prisma.notification.create({
      data: {
        userId: order.riderId,
        type: 'DRIVER_ARRIVED',
        title: 'Driver Arrived',
        message: 'Your delivery driver has arrived at ' + restaurantName,
        data: { orderId },
      },
    });
    const user = await prisma.user.findUnique({ where: { id: order.riderId } });
    if (user && user.fcmToken) {
      await sendFcmMessage(user.fcmToken, {
        title: 'Driver Arrived',
        body: 'Your delivery driver is at ' + restaurantName,
        data: { type: 'DRIVER_ARRIVED', orderId },
      });
    }
  } catch (err) {
    console.error('[Notify] Driver arrival error:', err.message);
  }
}

module.exports = { notifyRideUpdate, notifyOrderUpdate, sendPush, notifyDeliveryAssignment, notifyDriverArrival, notifyCustomerOutForDelivery, notifyDriverRideOffered };

async function notifyCustomerOutForDelivery(userId, orderId) {
  console.log('[Notify] Customer out for delivery: userId=' + userId + ' orderId=' + orderId);
  try {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return;

    await prisma.notification.create({
      data: {
        userId,
        type: 'OUT_FOR_DELIVERY',
        title: 'Out for Delivery',
        message: 'Your order is on the way!',
        data: { orderId, status: 'OUT_FOR_DELIVERY' },
      },
    });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user && user.fcmToken) {
      await sendFcmMessage(user.fcmToken, {
        title: 'Out for Delivery',
        body: 'Your order is on the way!',
        data: { type: 'OUT_FOR_DELIVERY', orderId },
      });
    }
  } catch (err) {
    console.error('[Notify] Customer out-for-delivery error:', err.message);
  }
}

async function notifyDriverRideOffered(driverUserId, rideId, rideData) {
  console.log('[Notify] Ride offered: driver=' + driverUserId + ' rideId=' + rideId);
  try {
    await prisma.notification.create({
      data: {
        userId: driverUserId,
        type: 'RIDE_OFFERED',
        title: 'New Ride Request',
        message: 'A ride nearby is waiting for you!',
        data: { rideId, pickup: rideData.pickupLandmark, dropoff: rideData.dropoffLandmark, fare: rideData.fare },
      },
    });

    const driver = await prisma.user.findUnique({ where: { id: driverUserId } });
    if (driver && driver.fcmToken) {
      await sendFcmMessage(driver.fcmToken, {
        title: 'New Ride Request',
        body: 'A ride nearby is waiting for you!',
        data: { type: 'RIDE_OFFERED', rideId },
      });
    }
  } catch (err) {
    console.error('[Notify] Driver ride offered error:', err.message);
  }
}
