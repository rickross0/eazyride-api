// ============================================================
// Fare Calculation Service — v3.0.0
// ============================================================

const { prisma } = require('../config/database');
const logger = require('../utils/logger');

// Default fare settings (fallback)
const DEFAULT_FARES = {
  sedan: { baseFare: 1.5, perKm: 0.5, perMinute: 0.08, minimumFare: 3 },
  suv: { baseFare: 2.5, perKm: 0.8, perMinute: 0.1, minimumFare: 5 },
  van: { baseFare: 3, perKm: 1, perMinute: 0.12, minimumFare: 6 },
};

// Calculate ride fare
const calculateFare = async ({ distance, duration, vehicleType = 'sedan', surgeMultiplier = 1, promoCode = null }) => {
  try {
    // Get fare settings from DB or use defaults
    let fareSettings = await prisma.fareSetting.findUnique({ where: { vehicleType } });
    if (!fareSettings) {
      fareSettings = DEFAULT_FARES[vehicleType] || DEFAULT_FARES.sedan;
      fareSettings = { ...fareSettings, surgeMultiplier: 1 };
    }

    const baseFare = fareSettings.baseFare;
    const perKmRate = fareSettings.perKmRate || fareSettings.perKm;
    const perMinuteRate = fareSettings.perMinuteRate || fareSettings.perMinute;
    const minimumFare = fareSettings.minimumFare;

    // Calculate components
    const distanceFare = (distance / 1000) * perKmRate; // distance in meters
    const timeFare = (duration / 60) * perMinuteRate; // duration in seconds
    const surgeFare = (baseFare + distanceFare + timeFare) * (surgeMultiplier - 1);

    let totalFare = baseFare + distanceFare + timeFare + surgeFare;

    // Apply promo code if provided
    let discountAmount = 0;
    if (promoCode) {
      const promo = await prisma.promoCode.findUnique({ where: { code: promoCode } });
      if (promo && promo.isActive && new Date() >= promo.startDate && new Date() <= promo.endDate) {
        if (promo.discountType === 'PERCENTAGE') {
          discountAmount = totalFare * (promo.discountValue / 100);
        } else {
          discountAmount = Math.min(promo.discountValue, totalFare);
        }
        totalFare -= discountAmount;
      }
    }

    // Enforce minimum fare
    totalFare = Math.max(totalFare, minimumFare);

    // Calculate commission
    const commissionRate = vehicleType === 'sedan' ? 0.15 : (vehicleType === 'suv' ? 0.15 : 0.10);
    const commissionAmount = totalFare * commissionRate;
    const driverEarnings = totalFare - commissionAmount;

    return {
      baseFare: parseFloat(baseFare.toFixed(2)),
      distanceFare: parseFloat(distanceFare.toFixed(2)),
      timeFare: parseFloat(timeFare.toFixed(2)),
      surgeFare: parseFloat(surgeFare.toFixed(2)),
      discountAmount: parseFloat(discountAmount.toFixed(2)),
      totalFare: parseFloat(totalFare.toFixed(2)),
      commissionAmount: parseFloat(commissionAmount.toFixed(2)),
      driverEarnings: parseFloat(driverEarnings.toFixed(2)),
      minimumFare: parseFloat(minimumFare.toFixed(2)),
    };
  } catch (error) {
    logger.error('Fare calculation error:', error.message);
    throw error;
  }
};

// Calculate food delivery fee
const calculateDeliveryFee = async ({ distance, storeId }) => {
  try {
    const store = storeId ? await prisma.store.findUnique({ where: { id: storeId } }) : null;
    const deliveryFee = store ? store.deliveryFee : 1.0;
    const serviceFee = 0.5;

    return {
      deliveryFee: parseFloat(deliveryFee.toFixed(2)),
      serviceFee: parseFloat(serviceFee.toFixed(2)),
    };
  } catch (error) {
    logger.error('Delivery fee calculation error:', error.message);
    return { deliveryFee: 1.0, serviceFee: 0.5 };
  }
};

// Calculate car rental price
const calculateRentalPrice = async ({ carId, startDate, endDate }) => {
  try {
    const car = await prisma.car.findUnique({ where: { id: carId } });
    if (!car) throw new Error('Car not found');

    const hours = Math.abs(new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60);
    const days = Math.ceil(hours / 24);

    let subtotal;
    if (hours <= 24) {
      subtotal = car.pricePerDay;
    } else {
      subtotal = days * car.pricePerDay;
    }

    const depositAmount = subtotal * 0.3;
    const serviceFee = subtotal * 0.05;
    const totalAmount = subtotal + serviceFee;
    const commissionAmount = subtotal * 0.05;
    const providerEarnings = subtotal - commissionAmount;

    return {
      hours: parseFloat(hours.toFixed(2)),
      days,
      subtotal: parseFloat(subtotal.toFixed(2)),
      depositAmount: parseFloat(depositAmount.toFixed(2)),
      serviceFee: parseFloat(serviceFee.toFixed(2)),
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      commissionAmount: parseFloat(commissionAmount.toFixed(2)),
      providerEarnings: parseFloat(providerEarnings.toFixed(2)),
    };
  } catch (error) {
    logger.error('Rental price calculation error:', error.message);
    throw error;
  }
};

module.exports = { calculateFare, calculateDeliveryFee, calculateRentalPrice };
