const prisma = require('../config/prisma');

async function autoReleaseExpiredEscrows() {
  console.log('[Cron] Checking expired escrows...');
  try {
    const expired = await prisma.rentalReservation.findMany({
      where: {
        status: 'CONFIRMED',
        endDate: { lt: new Date() },
        depositStatus: 'APPROVED',
      },
    });

    for (const reservation of expired) {
      const wallet = await prisma.wallet.findUnique({ where: { userId: reservation.userId } });
      if (!wallet) continue;

      await prisma.$transaction(async (tx) => {
        await tx.wallet.update({
          where: { userId: reservation.userId },
          data: { balance: { increment: reservation.depositPaid } },
        });

        await tx.transaction.create({
          data: {
            walletId: wallet.id,
            type: 'REFUND',
            amount: reservation.depositPaid,
            balanceBefore: wallet.balance,
            balanceAfter: wallet.balance + reservation.depositPaid,
            description: `Auto-released deposit for expired reservation ${reservation.id}`,
            referenceId: reservation.id,
          },
        });

        await tx.rentalReservation.update({
          where: { id: reservation.id },
          data: { status: 'COMPLETED', returnedAt: new Date() },
        });

        await tx.car.update({
          where: { id: reservation.carId },
          data: { isAvailable: true },
        });
      });
    }

    console.log(`[Cron] Released ${expired.length} expired escrows`);
  } catch (err) {
    console.error('[Cron] Escrow timeout error:', err);
  }
}

module.exports = { autoReleaseExpiredEscrows };
