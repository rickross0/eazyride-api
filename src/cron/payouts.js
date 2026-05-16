const prisma = require('../config/prisma');
const waafiPay = require('../services/waafiPay');

async function processWeeklyPayouts() {
  console.log('[Cron] Processing weekly payouts...');
  try {
    const drivers = await prisma.driverProfile.findMany({
      where: { isApproved: true, totalEarnings: { gt: 0 } },
      include: { user: { select: { id: true, phone: true } } },
    });

    let processed = 0;
    let failed = 0;

    for (const driver of drivers) {
      const payoutAmount = driver.totalEarnings;
      if (payoutAmount <= 0) continue;

      const periodEnd = new Date();
      const periodStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      try {
        // Process based on payout method
        if (driver.payoutMethod === 'EVC' && driver.payoutPhone) {
          const referenceId = `PAYOUT-${driver.id}-${Date.now()}`;
          await waafiPay.purchase(driver.payoutPhone, payoutAmount, referenceId, `Weekly payout for driver ${driver.userId}`);
        }

        // Create payout record
        await prisma.payoutRequest.create({
          data: {
            driverId: driver.id,
            userId: driver.userId,
            amount: payoutAmount,
            status: driver.payoutMethod === 'WALLET' ? 'COMPLETED' : 'COMPLETED',
            periodStart,
            periodEnd,
            notes: `Auto payout via ${driver.payoutMethod || 'WALLET'}`,
          },
        });

        // Reset driver earnings
        await prisma.driverProfile.update({
          where: { id: driver.id },
          data: { totalEarnings: 0 },
        });

        processed++;
      } catch (err) {
        console.error(`[Cron] Payout failed for driver ${driver.id}:`, err.message);

        // Record failed payout
        await prisma.payoutRequest.create({
          data: {
            driverId: driver.id,
            userId: driver.userId,
            amount: payoutAmount,
            status: 'FAILED',
            periodStart,
            periodEnd,
            notes: `Payout failed: ${err.message}`,
          },
        });

        failed++;
      }
    }

    console.log(`[Cron] Payouts complete: ${processed} processed, ${failed} failed`);
  } catch (err) {
    console.error('[Cron] Payout error:', err);
  }
}

module.exports = { processWeeklyPayouts };
