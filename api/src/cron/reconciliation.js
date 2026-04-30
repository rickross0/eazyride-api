const prisma = require('../config/prisma');
const axios = require('axios');

const WAAFI_BASE_URL = process.env.WAAFI_ENV === 'production'
  ? 'https://api.waafipay.com/asm'
  : 'http://sandbox.waafipay.net/asm';
const WAAFI_MERCHANT_UID = process.env.WAAFI_MERCHANT_UID;
const WAAFI_API_USER_ID  = process.env.WAAFI_API_USER_ID;
const WAAFI_API_KEY      = process.env.WAAFI_API_KEY;

// Stale threshold: transactions pending for over 30 minutes
const STALE_THRESHOLD_MS = 30 * 60 * 1000;
// Maximum discrepancies to flag before stopping
const MAX_DISCREPANCY_REPORTS = 100;

async function dailyReconciliation() {
  console.log('[Cron] Running daily WaafiPay reconciliation...');
  const startTime = Date.now();
  const report = { checked: 0, matched: 0, discrepancies: [], staleCleared: 0, errors: [] };

  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // ── 1. Find all local transactions from yesterday ──
    const localTransactions = await prisma.transaction.findMany({
      where: {
        createdAt: { gte: yesterday, lt: today },
        type: { in: ['RIDE_PAYMENT', 'DELIVERY_PAYMENT', 'DEPOSIT'] },
      },
      orderBy: { createdAt: 'asc' },
    });

    report.checked = localTransactions.length;
    console.log(`[Reconciliation] Found ${localTransactions.length} local transactions to reconcile`);

    // ── 2. Query WaafiPay for yesterday's transactions ──
    let waafiTransactions = [];
    if (WAAFI_MERCHANT_UID && WAAFI_API_USER_ID && WAAFI_API_KEY) {
      try {
        const payload = {
          schemaVersion: '1.0',
          requestId: require('crypto').randomUUID(),
          timestamp: new Date().toISOString(),
          channelName: 'WEB',
          serviceName: 'API_TRANSACTION_LIST',
          serviceParams: {
            merchantUid: WAAFI_MERCHANT_UID,
            apiUserId: WAAFI_API_USER_ID,
            apiKey: WAAFI_API_KEY,
            transactionInfo: {
              startDate: yesterday.toISOString().split('T')[0],
              endDate: today.toISOString().split('T')[0],
            },
          },
        };

        const response = await axios.post(WAAFI_BASE_URL, payload, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000,
        });

        if (response.data && response.data.params && Array.isArray(response.data.params.transactions)) {
          waafiTransactions = response.data.params.transactions;
          console.log(`[Reconciliation] Fetched ${waafiTransactions.length} WaafiPay transactions`);
        } else {
          console.warn('[Reconciliation] WaafiPay response missing transactions list — falling back to local-only check');
        }
      } catch (err) {
        console.error('[Reconciliation] WaafiPay API error:', err.message);
        report.errors.push({ source: 'waafipay_fetch', message: err.message });
      }
    } else {
      console.warn('[Reconciliation] WaafiPay credentials not configured — running local-only stale check');
    }

    // ── 3. Build a lookup map of WaafiPay transactions by referenceId ──
    const waafiMap = new Map();
    for (const wt of waafiTransactions) {
      const refId = wt.referenceId || wt.invoiceId || wt.transactionId;
      if (refId) waafiMap.set(refId, wt);
    }

    // ── 4. Cross-reference each local transaction against WaafiPay ──
    for (const local of localTransactions) {
      const waafiMatch = waafiMap.get(local.referenceId) || waafiMap.get(local.id);

      if (waafiMatch) {
        // Found a match — verify amount
        const waafiAmount = parseFloat(waafiMatch.amount || '0');
        const localAmount = Math.abs(local.amount);
        const diff = Math.abs(waafiAmount - localAmount);

        if (diff > 0.01) { // More than 1 cent difference
          report.discrepancies.push({
            type: 'AMOUNT_MISMATCH',
            localId: local.id,
            referenceId: local.referenceId,
            localAmount,
            waafiAmount: waafiAmount,
            diff: diff.toFixed(2),
          });
        } else {
          report.matched++;
        }
      } else {
        // No match found on WaafiPay side
        // If it's completed locally but not on WaafiPay, that's a discrepancy
        // If it's still pending locally, that might just mean it hasn't settled yet
        const age = Date.now() - new Date(local.createdAt).getTime();
        if (age > STALE_THRESHOLD_MS) {
          report.discrepancies.push({
            type: 'MISSING_ON_WAAFI',
            localId: local.id,
            referenceId: local.referenceId,
            localAmount: Math.abs(local.amount),
            localType: local.type,
            createdAt: local.createdAt,
          });
        }
      }

      // Safety: stop reporting after too many discrepancies
      if (report.discrepancies.length >= MAX_DISCREPANCY_REPORTS) {
        console.warn(`[Reconciliation] Hit max discrepancy reports (${MAX_DISCREPANCY_REPORTS}), stopping cross-reference`);
        break;
      }
    }

    // ── 5. Handle stale pending deposit requests (local-only check) ──
    const stalePending = await prisma.depositRequest.findMany({
      where: {
        status: 'PENDING',
        createdAt: { lt: new Date(Date.now() - STALE_THRESHOLD_MS) },
      },
    });

    for (const sp of stalePending) {
      report.discrepancies.push({
        type: 'STALE_PENDING_DEPOSIT',
        localId: sp.id,
        transactionId: sp.transactionId,
        amount: sp.amount,
        createdAt: sp.createdAt,
      });
    }

    // Auto-cancel deposits pending for over 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const cancelledResult = await prisma.depositRequest.updateMany({
      where: {
        status: 'PENDING',
        createdAt: { lt: oneDayAgo },
      },
      data: { status: 'CANCELLED' },
    });
    report.staleCleared = cancelledResult.count;

    if (cancelledResult.count > 0) {
      console.log(`[Reconciliation] Auto-cancelled ${cancelledResult.count} stale pending deposits (older than 24h)`);
    }

    // ── 6. Log summary ──
    const elapsed = Date.now() - startTime;
    console.log(`[Reconciliation] Complete in ${elapsed}ms — Checked: ${report.checked}, Matched: ${report.matched}, Discrepancies: ${report.discrepancies.length}, Stale cleared: ${report.staleCleared}, Errors: ${report.errors.length}`);

    if (report.discrepancies.length > 0) {
      console.warn('[Reconciliation] Discrepancies found:');
      for (const d of report.discrepancies.slice(0, 10)) {
        console.warn(`  - ${d.type}: localId=${d.localId} ref=${d.referenceId || 'N/A'} amount=${d.localAmount || d.amount}`);
      }
      if (report.discrepancies.length > 10) {
        console.warn(`  ... and ${report.discrepancies.length - 10} more`);
      }
    }

    // ── 7. Store reconciliation report ──
    try {
      await prisma.notification.create({
        data: {
          userId: 'system',
          type: 'RECONCILIATION_REPORT',
          title: 'Daily Reconciliation Report',
          message: `Checked: ${report.checked}, Matched: ${report.matched}, Discrepancies: ${report.discrepancies.length}, Stale cleared: ${report.staleCleared}`,
          data: {
            checked: report.checked,
            matched: report.matched,
            discrepancies: report.discrepancies,
            staleCleared: report.staleCleared,
            errors: report.errors,
          },
        },
      });
    } catch (notifErr) {
      // If userId='system' doesn't exist, just log it
      console.warn('[Reconciliation] Could not store report notification:', notifErr.message);
    }

  } catch (err) {
    console.error('[Cron] Reconciliation error:', err);
    report.errors.push({ source: 'reconciliation_main', message: err.message });
  }

  return report;
}

module.exports = { dailyReconciliation };
