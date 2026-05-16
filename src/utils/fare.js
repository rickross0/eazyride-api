const prisma = require('../config/prisma');

const DEFAULT_PRICING = {
  BAJAJ: { baseFare: 0.50, perKmRate: 0.30, perMinuteRate: 0.05, minimumFare: 1.50 },
  CAR:   { baseFare: 1.00, perKmRate: 0.60, perMinuteRate: 0.10, minimumFare: 3.00 },
  DELIVERY_FLAT_FEE: 1.20,
  NO_DRIVER_SURCHARGE: 0.50,
  SURGE: { LOW: 1.5, MEDIUM: 2.0, HIGH: 2.5, EXTREME: 3.0 },
  COMMISSION_RATE: 0.15,
};

async function getPricing(vehicleType) {
  try {
    const setting = await prisma.pricingSetting.findFirst({ where: { vehicleType } });
    if (setting) {
      return {
        baseFare: setting.baseFare,
        perKmRate: setting.perKmRate,
        perMinuteRate: setting.perMinuteRate,
        minimumFare: setting.minimumFare,
      };
    }
  } catch { /* fallback */ }
  return DEFAULT_PRICING[vehicleType] || DEFAULT_PRICING.BAJAJ;
}

async function calculateFare(vehicleType, distanceKm, waitTimeMinutes = 0, surgeMultiplier = 1.0) {
  const pricing = await getPricing(vehicleType);
  const baseFare = pricing.baseFare;
  const distCost = pricing.perKmRate * distanceKm;
  const waitCost = pricing.perMinuteRate * waitTimeMinutes;
  let fare = baseFare + distCost + waitCost;
  fare = fare * surgeMultiplier;
  fare = Math.max(fare, pricing.minimumFare);
  fare = Math.round(fare * 100) / 100;
  return fare;
}

function calculateCommission(fare, rate = 0.15) {
  const commission = fare * rate;
  const driverEarnings = fare - commission;
  return {
    fare,
    commission: Math.round(commission * 100) / 100,
    driverEarnings: Math.round(driverEarnings * 100) / 100,
  };
}

function getDeliveryFee() {
  return DEFAULT_PRICING.DELIVERY_FLAT_FEE;
}

async function getSurgeMultiplier(lat, lng) {
  try {
    const zones = await prisma.surgeZone.findMany({ where: { isActive: true } });
    for (const zone of zones) {
      const dist = haversineDistance(lat, lng, zone.centerLat, zone.centerLng);
      if (dist <= zone.radiusKm) {
        return zone.multiplier || DEFAULT_PRICING.SURGE.LOW;
      }
    }
  } catch { /* no surge table yet */ }
  return 1.0;
}

function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

module.exports = {
  calculateFare,
  calculateCommission,
  getDeliveryFee,
  getSurgeMultiplier,
  haversineDistance,
  DEFAULT_PRICING,
};
