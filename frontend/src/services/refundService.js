/**
 * Refund Service
 * Handles refund management and policies
 * 
 * نظام إدارة المبالغ المسترجعة:
 * ====================================
 * 1. سياسات الاسترجاع تعتمد على تاريخ الإلغاء
 * 2. أنواع الدفع المختلفة لها معالجة مختلفة
 * 3. يتم تتبع حالة المسترجع تلقائياً
 * 4. بريد إلكتروني تلقائي للعميل عند الموافقة
 */

import apiClient from './apiClient';

export const refundService = {
  /**
   * 🔍 احسب سياسة الاسترجاع بناءً على تاريخ الرحلة
   * @param {string} tripStartDate - تاريخ بداية الرحلة
   * @param {number} totalPrice - السعر الكلي
   * @returns {object} سياسة الاسترجاع
   */
  calculateRefundPolicy: (tripStartDate, totalPrice) => {
    const today = new Date();
    const tripDate = new Date(tripStartDate);
    const daysUntilTrip = Math.ceil((tripDate - today) / (1000 * 60 * 60 * 24));

    let refundPercentage = 0;
    let refundMessage = '';
    let canRefund = false;

    if (daysUntilTrip >= 30) {
      // 100% refund - More than 30 days
      refundPercentage = 100;
      refundMessage = '✅ 100% refund - Full amount will be returned';
      canRefund = true;
    } else if (daysUntilTrip >= 15) {
      // 50% refund - 15-29 days
      refundPercentage = 50;
      refundMessage = '⚠️ 50% refund - Half amount will be returned';
      canRefund = true;
    } else if (daysUntilTrip >= 7) {
      // 25% refund - 7-14 days
      refundPercentage = 25;
      refundMessage = '⚠️ 25% refund - Limited refund available';
      canRefund = true;
    } else if (daysUntilTrip > 0) {
      // Non-refundable - Less than 7 days
      refundPercentage = 0;
      refundMessage = '❌ Non-refundable - Cancellation too close to trip date';
      canRefund = false;
    } else {
      // Trip already started
      refundPercentage = 0;
      refundMessage = '❌ Non-refundable - Trip has already started';
      canRefund = false;
    }

    const refundAmount = (totalPrice * refundPercentage) / 100;

    return {
      daysUntilTrip,
      refundPercentage,
      refundAmount,
      canRefund,
      message: refundMessage,
      category: daysUntilTrip >= 30 ? 'full' : daysUntilTrip >= 15 ? 'partial' : 'limited',
    };
  },

  /**
   * 💳 احسب الاسترجاع بناءً على نوع الدفع
   * @param {object} booking - بيانات الحجز
   * @returns {object} تفاصيل الاسترجاع
   */
  calculateRefundByPaymentType: (booking) => {
    const policy = refundService.calculateRefundPolicy(
      booking.date_start,
      booking.total_price
    );

    let refundInfo = {
      policyInfo: policy,
      paymentType: booking.payment_type,
      totalBookingPrice: booking.total_price,
      refundableAmount: 0,
      fees: 0,
      netRefund: 0,
      details: {},
    };

    // معالجة بناءً على نوع الدفع
    switch (booking.payment_type) {
      case 'on_arrival':
        refundInfo.details = {
          message: '✅ Pay on Arrival - No payment received yet',
          description: 'This booking uses "Pay on Arrival". Customer has not paid yet. Canceling will prevent payment collection.',
          refundableAmount: 0,
          fees: 0,
        };
        break;

      case 'deposit':
        const depositAmount = booking.total_price * 0.3; // عادة 30% دفعة مقدمة
        refundInfo.refundableAmount = (depositAmount * policy.refundPercentage) / 100;
        refundInfo.fees = refundInfo.refundableAmount * 0.05; // 5% رسوم معالجة
        refundInfo.netRefund = refundInfo.refundableAmount - refundInfo.fees;
        refundInfo.details = {
          message: `📦 Deposit Payment - ${policy.message}`,
          description: `Deposit amount: $${depositAmount.toFixed(2)} (30% of total)`,
          depositPercentage: 30,
          refundableAmount: refundInfo.refundableAmount,
          processingFees: refundInfo.fees,
        };
        break;

      case 'full_payment':
        refundInfo.refundableAmount = (booking.total_price * policy.refundPercentage) / 100;
        refundInfo.fees = refundInfo.refundableAmount * 0.03; // 3% رسوم معالجة
        refundInfo.netRefund = refundInfo.refundableAmount - refundInfo.fees;
        refundInfo.details = {
          message: `💰 Full Payment - ${policy.message}`,
          description: 'Full payment received. Refund will be processed to original payment method.',
          fullPaymentProcessing: true,
          refundableAmount: refundInfo.refundableAmount,
          processingFees: refundInfo.fees,
        };
        break;

      default:
        refundInfo.details = {
          message: 'Unknown payment type',
        };
    }

    return refundInfo;
  },

  /**
   * ⏳ احسب وقت معالجة الاسترجاع
   * @returns {object} تفاصيل الوقت
   */
  getRefundProcessingTimeline: () => ({
    step1: {
      name: 'Refund Request',
      time: 'Immediate',
      description: 'Your cancellation request is submitted',
    },
    step2: {
      name: 'Verification',
      time: '1-2 business days',
      description: 'We verify your booking details and policy',
    },
    step3: {
      name: 'Processing',
      time: '3-5 business days',
      description: 'Refund is processed and sent to payment provider',
    },
    step4: {
      name: 'Bank Processing',
      time: '3-10 business days',
      description: 'Your bank processes the refund (varies by bank)',
    },
    total: '10-17 business days',
  }),

  /**
   * 📋 احصل على جميع المسترجعات
   */
  getRefunds: async (limit = 20, offset = 0) => {
    try {
      const response = await apiClient.get('/admin/refunds', {
        params: { limit, offset },
      });
      return response;
    } catch (error) {
      console.error('❌ Error fetching refunds:', error);
      throw error;
    }
  },

  /**
   * 📊 احصل على إحصائيات المسترجعات
   */
  getRefundStats: async () => {
    try {
      const response = await apiClient.get('/admin/refunds/stats');
      return response;
    } catch (error) {
      console.error('❌ Error fetching refund stats:', error);
      throw error;
    }
  },

  /**
   * ✅ وافق على المسترجع
   */
  approveRefund: async (bookingId, refundAmount, refundReason, notes = '') => {
    try {
      const response = await apiClient.post(`/admin/bookings/${bookingId}/refund`, {
        refundAmount,
        refundReason,
        notes,
      });
      return response;
    } catch (error) {
      console.error('❌ Error approving refund:', error);
      throw error;
    }
  },

  /**
   * ❌ رفض المسترجع
   */
  rejectRefund: async (bookingId, reason) => {
    try {
      const response = await apiClient.post(
        `/admin/bookings/${bookingId}/refund/reject`,
        { reason }
      );
      return response;
    } catch (error) {
      console.error('❌ Error rejecting refund:', error);
      throw error;
    }
  },

  /**
   * 🔄 تحديث حالة المسترجع
   */
  updateRefundStatus: async (bookingId, status, notes = '') => {
    try {
      const response = await apiClient.put(
        `/admin/bookings/${bookingId}/refund/status`,
        { status, notes }
      );
      return response;
    } catch (error) {
      console.error('❌ Error updating refund status:', error);
      throw error;
    }
  },

  /**
   * 🏷️ احصل على أسباب الاسترجاع الشائعة
   */
  getCommonRefundReasons: () => [
    { id: 'personal', label: 'Personal Emergency', emoji: '🚨' },
    { id: 'health', label: 'Health Issues', emoji: '🏥' },
    { id: 'financial', label: 'Financial Difficulties', emoji: '💰' },
    { id: 'schedule', label: 'Schedule Conflict', emoji: '📅' },
    { id: 'weather', label: 'Bad Weather', emoji: '⛈️' },
    { id: 'trip_changed', label: 'Trip Changed', emoji: '🔄' },
    { id: 'unsatisfied', label: 'Not Satisfied', emoji: '😞' },
    { id: 'other', label: 'Other', emoji: '❓' },
  ],

  /**
   * ⚖️ تحقق من الحالات الخاصة للاسترجاع
   */
  checkSpecialCircumstances: (booking) => {
    const circumstances = [];

    // إذا كانت الرحلة قريبة جداً
    const today = new Date();
    const tripDate = new Date(booking.date_start);
    const daysUntilTrip = Math.ceil((tripDate - today) / (1000 * 60 * 60 * 24));

    if (daysUntilTrip < 0) {
      circumstances.push({
        type: 'started',
        severity: 'high',
        message: '❌ Trip has already started - Refund not available',
      });
    } else if (daysUntilTrip <= 3) {
      circumstances.push({
        type: 'urgent',
        severity: 'high',
        message: '⚠️ Cancellation very close to trip date - Limited refund available',
      });
    }

    // إذا كان هناك add-ons غير قابلة للاسترجاع
    if (booking.extras && booking.extras.length > 0) {
      circumstances.push({
        type: 'has_extras',
        severity: 'medium',
        message: '📌 This booking has add-ons - Refund policy may apply separately',
      });
    }

    return circumstances;
  },

  /**
   * 📝 إنشاء رسالة تلقائية للمسترجع
   */
  generateRefundEmailMessage: (booking, refundInfo) => {
    const policyCategory = refundInfo.policyInfo.category;
    const categoryLabel =
      policyCategory === 'full'
        ? 'Full Refund'
        : policyCategory === 'partial'
          ? 'Partial Refund'
          : 'Limited Refund';

    return {
      subject: `${categoryLabel} Approved - Booking ${booking.booking_number}`,
      body: `
Dear ${booking.user?.name},

Your refund request for booking ${booking.booking_number} has been approved.

📊 Refund Details:
- Original Amount: $${booking.total_price.toFixed(2)}
- Refund Percentage: ${refundInfo.policyInfo.refundPercentage}%
- Refund Amount: $${refundInfo.netRefund.toFixed(2)}
- Processing Fees: $${refundInfo.fees.toFixed(2)}
- Payment Type: ${booking.payment_type.replace('_', ' ').toUpperCase()}

⏳ Processing Timeline:
Expected refund time: 10-17 business days
Your bank may take additional time to process.

${
  booking.payment_type === 'on_arrival'
    ? '✅ Note: This was a "Pay on Arrival" booking. No payment was collected.'
    : '💳 Refund will be returned to your original payment method.'
}

If you have any questions, please contact our support team.

Best regards,
TourHub Support Team
      `,
    };
  },
};

export default refundService;
