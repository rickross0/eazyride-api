const express = require('express');
const router = express.Router();
const carCtrl = require('../controllers/carRentalController');
const { authMiddleware, attachUser } = require('../middleware/auth');
const prisma = require('../config/prisma');

router.post('/', authMiddleware, attachUser, carCtrl.createReservation);
router.get('/', authMiddleware, attachUser, carCtrl.getReservations);

// Store owner: confirm a reservation on their car
router.put('/:id/confirm', authMiddleware, attachUser, async (req, res) => {
  try {
    const reservation = await prisma.rentalReservation.findUnique({
      where: { id: req.params.id },
      include: { car: { select: { ownerId: true, brand: true, model: true } } },
    });
    if (!reservation) return res.status(404).json({ error: 'Reservation not found' });
    if (reservation.car.ownerId !== req.user.id) return res.status(403).json({ error: 'Not your car' });
    if (reservation.status !== 'PENDING') return res.status(400).json({ error: 'Only pending reservations can be confirmed' });

    const updated = await prisma.rentalReservation.update({
      where: { id: req.params.id },
      data: { status: 'CONFIRMED', confirmedAt: new Date() },
    });

    // Notify the rider
    try {
      await prisma.notification.create({
        data: {
          userId: reservation.userId,
          type: 'CAR_RENTAL',
          title: 'Reservation Confirmed',
          message: `Your booking for ${reservation.car.brand} ${reservation.car.model} has been confirmed!`,
        },
      });
    } catch (nErr) { console.error('Notify error:', nErr.message); }

    // Real-time push if available
    try {
      const { emitToUser } = require('../sockets/rideTracking');
      emitToUser(reservation.userId, 'reservation:confirmed', updated);
    } catch (e) {}

    return res.json({ reservation: updated });
  } catch (err) {
    console.error('Confirm reservation error:', err);
    return res.status(500).json({ error: 'Failed to confirm reservation' });
  }
});

// Store owner: cancel a reservation on their car
router.put('/:id/cancel-by-owner', authMiddleware, attachUser, async (req, res) => {
  try {
    const { reason } = req.body;
    const reservation = await prisma.rentalReservation.findUnique({
      where: { id: req.params.id },
      include: { car: { select: { ownerId: true, brand: true, model: true } } },
    });
    if (!reservation) return res.status(404).json({ error: 'Reservation not found' });
    if (reservation.car.ownerId !== req.user.id) return res.status(403).json({ error: 'Not your car' });
    if (['COMPLETED', 'CANCELLED'].includes(reservation.status)) return res.status(400).json({ error: 'Cannot cancel this reservation' });

    const updated = await prisma.rentalReservation.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED', cancelledAt: new Date(), cancelReason: reason || 'Cancelled by car owner' },
    });

    // Notify the rider
    try {
      await prisma.notification.create({
        data: {
          userId: reservation.userId,
          type: 'CAR_RENTAL',
          title: 'Reservation Cancelled',
          message: `Your booking for ${reservation.car.brand} ${reservation.car.model} has been cancelled by the car company.`,
        },
      });
    } catch (nErr) { console.error('Notify error:', nErr.message); }

    try {
      const { emitToUser } = require('../sockets/rideTracking');
      emitToUser(reservation.userId, 'reservation:cancelled', updated);
    } catch (e) {}

    return res.json({ reservation: updated });
  } catch (err) {
    console.error('Cancel-by-owner error:', err);
    return res.status(500).json({ error: 'Failed to cancel reservation' });
  }
});

// Rider cancellation (existing)
router.post('/:id/cancel', authMiddleware, attachUser, carCtrl.cancelReservation);
router.post('/:id/return', authMiddleware, attachUser, carCtrl.returnCar);
module.exports = router;
