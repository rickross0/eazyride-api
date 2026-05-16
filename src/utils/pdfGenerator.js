// ============================================================
// PDF Report Generator — v3.0.0
// ============================================================

const PDFDocument = require('pdfkit');
const logger = require('./logger');

// Generate ride receipt PDF
const generateRideReceipt = async (ride) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      doc.fontSize(20).text('EazyRide + Haye!', { align: 'center' });
      doc.fontSize(14).text('Ride Receipt', { align: 'center' });
      doc.moveDown();
      doc.fontSize(10)
        .text(`Ride ID: ${ride.id}`)
        .text(`Date: ${new Date(ride.createdAt).toLocaleDateString()}`)
        .text(`From: ${ride.pickupAddress}`)
        .text(`To: ${ride.dropoffAddress}`)
        .text(`Distance: ${(ride.actualDistance / 1000).toFixed(1)} km`)
        .text(`Duration: ${Math.round(ride.actualDuration / 60)} min`)
        .moveDown()
        .text(`Base Fare: $${ride.baseFare.toFixed(2)}`)
        .text(`Distance Fare: $${ride.distanceFare.toFixed(2)}`)
        .text(`Time Fare: $${ride.timeFare.toFixed(2)}`)
        .text(`Surge: $${ride.surgeFare.toFixed(2)}`)
        .text(`Discount: -$${ride.discountAmount.toFixed(2)}`)
        .moveDown()
        .fontSize(14).text(`Total: $${ride.totalFare.toFixed(2)}`, { bold: true });

      doc.end();
    } catch (error) {
      logger.error('PDF generation error:', error.message);
      reject(error);
    }
  });
};

// Generate order receipt PDF
const generateOrderReceipt = async (order) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      doc.fontSize(20).text('EazyRide Food', { align: 'center' });
      doc.fontSize(14).text('Order Receipt', { align: 'center' });
      doc.moveDown();
      doc.fontSize(10)
        .text(`Order: #${order.orderNumber}`)
        .text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`)
        .text(`Status: ${order.status}`)
        .moveDown();

      order.items.forEach(item => {
        doc.text(`${item.menuItem?.name || 'Item'} x${item.quantity} — $${item.totalPrice.toFixed(2)}`);
      });

      doc.moveDown()
        .text(`Subtotal: $${order.subtotal.toFixed(2)}`)
        .text(`Delivery Fee: $${order.deliveryFee.toFixed(2)}`)
        .text(`Service Fee: $${order.serviceFee.toFixed(2)}`)
        .text(`Discount: -$${order.discountAmount.toFixed(2)}`)
        .moveDown()
        .fontSize(14).text(`Total: $${order.totalAmount.toFixed(2)}`, { bold: true });

      doc.end();
    } catch (error) {
      logger.error('PDF generation error:', error.message);
      reject(error);
    }
  });
};

module.exports = { generateRideReceipt, generateOrderReceipt };
