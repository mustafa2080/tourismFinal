/**
 * Price Calculator Utility
 * Used for calculating booking prices and totals
 */

/**
 * Calculate total price for booking
 * @param {number} basePrice - Base price per person
 * @param {number} persons - Number of persons
 * @param {array} extras - Array of extra items [{key, quantity, price}]
 * @returns {object} { baseTotal, extrasTotal, total }
 */
export const calculateTotalPrice = (basePrice, persons, extras = []) => {
  const baseTotal = basePrice * persons;
  
  let extrasTotal = 0;
  extras.forEach(extra => {
    if (extra.price && extra.quantity) {
      extrasTotal += extra.price * extra.quantity;
    }
  });

  const total = baseTotal + extrasTotal;

  return {
    baseTotal: parseFloat(baseTotal.toFixed(2)),
    extrasTotal: parseFloat(extrasTotal.toFixed(2)),
    total: parseFloat(total.toFixed(2)),
    breakdown: {
      basePrice: parseFloat(basePrice.toFixed(2)),
      persons,
      extras: extras.map(e => ({
        name: e.name || e.key,
        quantity: e.quantity,
        price: parseFloat(e.price.toFixed(2)),
        subtotal: parseFloat((e.price * e.quantity).toFixed(2))
      }))
    }
  };
};

/**
 * Apply discount to price
 * @param {number} price - Original price
 * @param {number} discountPercent - Discount percentage (0-100)
 * @returns {object} { original, discount, final }
 */
export const applyDiscount = (price, discountPercent) => {
  if (discountPercent < 0 || discountPercent > 100) {
    throw new Error('Discount must be between 0 and 100');
  }

  const discountAmount = (price * discountPercent) / 100;
  const finalPrice = price - discountAmount;

  return {
    original: parseFloat(price.toFixed(2)),
    discountPercent,
    discountAmount: parseFloat(discountAmount.toFixed(2)),
    final: parseFloat(finalPrice.toFixed(2))
  };
};

/**
 * Apply tax to price
 * @param {number} price - Price before tax
 * @param {number} taxPercent - Tax percentage (e.g., 14 for 14%)
 * @returns {object} { priceBeforeTax, tax, total }
 */
export const applyTax = (price, taxPercent) => {
  const taxAmount = (price * taxPercent) / 100;
  const total = price + taxAmount;

  return {
    priceBeforeTax: parseFloat(price.toFixed(2)),
    taxPercent,
    taxAmount: parseFloat(taxAmount.toFixed(2)),
    total: parseFloat(total.toFixed(2))
  };
};

/**
 * Calculate price per person
 * @param {number} totalPrice - Total price
 * @param {number} persons - Number of persons
 * @returns {number} price per person
 */
export const calculatePerPerson = (totalPrice, persons) => {
  if (persons <= 0) return 0;
  return parseFloat((totalPrice / persons).toFixed(2));
};

/**
 * Calculate group discount
 * @param {number} basePrice - Base price
 * @param {number} persons - Number of persons
 * @returns {number} discounted price per person
 */
export const calculateGroupDiscount = (basePrice, persons) => {
  let discount = 0;

  if (persons >= 20) {
    discount = 20; // 20% discount for groups of 20+
  } else if (persons >= 15) {
    discount = 15; // 15% discount for groups of 15+
  } else if (persons >= 10) {
    discount = 10; // 10% discount for groups of 10+
  } else if (persons >= 5) {
    discount = 5; // 5% discount for groups of 5+
  }

  if (discount === 0) {
    return basePrice;
  }

  return parseFloat((basePrice * (1 - discount / 100)).toFixed(2));
};

/**
 * Calculate early booking discount
 * @param {number} basePrice - Base price
 * @param {Date|string} bookingDate - Date when booking is made
 * @param {Date|string} tripDate - Date of trip
 * @returns {object} { original, discount, final }
 */
export const calculateEarlyBookingDiscount = (basePrice, bookingDate, tripDate) => {
  const booking = new Date(bookingDate);
  const trip = new Date(tripDate);

  const daysInAdvance = Math.floor((trip - booking) / (1000 * 60 * 60 * 24));

  let discountPercent = 0;

  if (daysInAdvance >= 90) {
    discountPercent = 15; // 15% for 90+ days in advance
  } else if (daysInAdvance >= 60) {
    discountPercent = 10; // 10% for 60+ days in advance
  } else if (daysInAdvance >= 30) {
    discountPercent = 5; // 5% for 30+ days in advance
  }

  return applyDiscount(basePrice, discountPercent);
};

/**
 * Calculate seasonal pricing
 * @param {number} basePrice - Base price
 * @param {Date|string} date - Travel date
 * @returns {object} { basePrice, seasonMultiplier, finalPrice }
 */
export const calculateSeasonalPrice = (basePrice, date) => {
  const d = new Date(date);
  const month = d.getMonth(); // 0-11

  let multiplier = 1.0;

  // High season: June-August, December
  if (month >= 5 && month <= 7) {
    multiplier = 1.3; // 30% increase
  } else if (month === 11) {
    multiplier = 1.25; // 25% increase
  }
  // Low season: January-March
  else if (month >= 0 && month <= 2) {
    multiplier = 0.8; // 20% discount
  }

  const finalPrice = basePrice * multiplier;

  return {
    basePrice: parseFloat(basePrice.toFixed(2)),
    season: getSeason(month),
    seasonMultiplier: multiplier,
    finalPrice: parseFloat(finalPrice.toFixed(2))
  };
};

/**
 * Get season name from month
 * @param {number} month - Month (0-11)
 * @returns {string} season name
 */
const getSeason = (month) => {
  if (month >= 5 && month <= 7) return 'High Season';
  if (month === 11 || month === 0 || month === 1) return 'Holiday Season';
  if (month >= 0 && month <= 2) return 'Low Season';
  return 'Regular Season';
};

/**
 * Calculate payment plan (installments)
 * @param {number} totalPrice - Total price
 * @param {number} installments - Number of installments
 * @returns {object} { totalPrice, installments: [{number, amount, dueDate}] }
 */
export const calculatePaymentPlan = (totalPrice, installments = 3) => {
  const amountPerInstallment = parseFloat((totalPrice / installments).toFixed(2));
  const plan = [];

  for (let i = 1; i <= installments; i++) {
    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + i - 1);

    plan.push({
      number: i,
      amount: amountPerInstallment,
      dueDate: dueDate.toISOString().split('T')[0]
    });
  }

  // Adjust last installment for rounding
  const totalPaid = plan.reduce((sum, p) => sum + p.amount, 0);
  const roundingDiff = totalPrice - totalPaid;
  if (roundingDiff !== 0) {
    plan[plan.length - 1].amount += roundingDiff;
  }

  return {
    totalPrice: parseFloat(totalPrice.toFixed(2)),
    installmentCount: installments,
    installments: plan
  };
};

/**
 * Format price breakdown
 * @param {object} breakdown - Breakdown object from calculateTotalPrice
 * @returns {string} formatted breakdown
 */
export const formatPriceBreakdown = (breakdown) => {
  let text = `Base: ${breakdown.basePrice} × ${breakdown.persons} persons = ${breakdown.baseTotal}\n`;

  if (breakdown.extras && breakdown.extras.length > 0) {
    text += '\nExtras:\n';
    breakdown.extras.forEach(extra => {
      text += `  - ${extra.name}: ${extra.price} × ${extra.quantity} = ${extra.subtotal}\n`;
    });
  }

  return text;
};

/**
 * Calculate refund amount
 * @param {number} totalPrice - Original total price
 * @param {number} daysBeforeTrip - Days before trip
 * @returns {object} { refundPercent, refundAmount, remainingCharge }
 */
export const calculateRefund = (totalPrice, daysBeforeTrip) => {
  let refundPercent = 0;

  if (daysBeforeTrip >= 30) {
    refundPercent = 100;
  } else if (daysBeforeTrip >= 14) {
    refundPercent = 75;
  } else if (daysBeforeTrip >= 7) {
    refundPercent = 50;
  } else if (daysBeforeTrip >= 3) {
    refundPercent = 25;
  }

  const refundAmount = (totalPrice * refundPercent) / 100;
  const remainingCharge = totalPrice - refundAmount;

  return {
    totalPrice: parseFloat(totalPrice.toFixed(2)),
    daysBeforeTrip,
    refundPercent,
    refundAmount: parseFloat(refundAmount.toFixed(2)),
    remainingCharge: parseFloat(remainingCharge.toFixed(2))
  };
};

export default {
  calculateTotalPrice,
  applyDiscount,
  applyTax,
  calculatePerPerson,
  calculateGroupDiscount,
  calculateEarlyBookingDiscount,
  calculateSeasonalPrice,
  calculatePaymentPlan,
  formatPriceBreakdown,
  calculateRefund
};