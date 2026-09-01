/**
 * useRefund Hook
 * إدارة احترافية لعملية الاسترجاع
 * 
 * الميزات:
 * ✅ حساب سياسة الاسترجاع تلقائياً
 * ✅ دعم أنواع الدفع المختلفة
 * ✅ تتبع الحالة والمراحل
 * ✅ معالجة الأخطاء
 * ✅ تخزين مؤقت ذكي
 */

import { useState, useCallback, useEffect } from 'react';
import refundService from '../services/refundService';
import toast from 'react-hot-toast';

export const useRefund = () => {
  const [refunds, setRefunds] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [refundPolicy, setRefundPolicy] = useState(null);
  const [error, setError] = useState(null);

  /**
   * 📋 جلب جميع المسترجعات
   */
  const fetchRefunds = useCallback(async (limit = 20, offset = 0) => {
    try {
      setLoading(true);
      setError(null);
      const response = await refundService.getRefunds(limit, offset);
      if (response.success) {
        setRefunds(response.data || []);
        return response.data;
      }
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load refunds');
      console.error('❌ Error fetching refunds:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 📊 جلب الإحصائيات
   */
  const fetchStats = useCallback(async () => {
    try {
      const response = await refundService.getRefundStats();
      if (response.success) {
        setStats(response.data);
        return response.data;
      }
    } catch (err) {
      console.error('❌ Error fetching stats:', err);
      setError(err.message);
    }
  }, []);

  /**
   * 🔍 احسب سياسة الاسترجاع للحجز
   */
  const calculatePolicy = useCallback((booking) => {
    try {
      const policy = refundService.calculateRefundByPaymentType(booking);
      setRefundPolicy(policy);
      return policy;
    } catch (err) {
      console.error('❌ Error calculating policy:', err);
      setError(err.message);
      return null;
    }
  }, []);

  /**
   * ✅ وافق على المسترجع
   */
  const approveRefund = useCallback(async (bookingId, refundAmount, reason, notes = '') => {
    try {
      setLoading(true);
      const response = await refundService.approveRefund(bookingId, refundAmount, reason, notes);
      if (response.success) {
        toast.success('✅ Refund approved successfully');
        await fetchRefunds(); // تحديث القائمة
        await fetchStats(); // تحديث الإحصائيات
        return response;
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      toast.error(`❌ ${message}`);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchRefunds, fetchStats]);

  /**
   * ❌ رفض المسترجع
   */
  const rejectRefund = useCallback(async (bookingId, reason) => {
    try {
      setLoading(true);
      const response = await refundService.rejectRefund(bookingId, reason);
      if (response.success) {
        toast.success('✅ Refund rejected');
        await fetchRefunds();
        await fetchStats();
        return response;
      }
    } catch (err) {
      toast.error('❌ Failed to reject refund');
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchRefunds, fetchStats]);

  /**
   * 🔄 تحديث حالة المسترجع
   */
  const updateStatus = useCallback(async (bookingId, status, notes = '') => {
    try {
      setLoading(true);
      const response = await refundService.updateRefundStatus(bookingId, status, notes);
      if (response.success) {
        toast.success(`✅ Refund status updated to ${status}`);
        await fetchRefunds();
        await fetchStats();
        return response;
      }
    } catch (err) {
      toast.error('❌ Failed to update refund status');
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchRefunds, fetchStats]);

  /**
   * 🏷️ احصل على أسباب الاسترجاع
   */
  const getReasons = useCallback(() => {
    return refundService.getCommonRefundReasons();
  }, []);

  /**
   * ⚖️ تحقق من الحالات الخاصة
   */
  const checkSpecialCases = useCallback((booking) => {
    return refundService.checkSpecialCircumstances(booking);
  }, []);

  /**
   * ⏳ احصل على التسلسل الزمني
   */
  const getTimeline = useCallback(() => {
    return refundService.getRefundProcessingTimeline();
  }, []);

  /**
   * 📝 إنشاء رسالة بريد
   */
  const generateEmailMessage = useCallback((booking, refundInfo) => {
    return refundService.generateRefundEmailMessage(booking, refundInfo);
  }, []);

  /**
   * 🎯 احصل على تفاصيل مسترجع معين
   */
  const getRefundDetails = useCallback((refundId) => {
    return refunds.find((r) => r.id === refundId);
  }, [refunds]);

  /**
   * 📉 احصل على مسترجعات معينة بناءً على الحالة
   */
  const getRefundsByStatus = useCallback((status) => {
    return refunds.filter((r) => r.status === status);
  }, [refunds]);

  /**
   * 💰 احسب إجمالي المبالغ المسترجعة
   */
  const getTotalRefunded = useCallback(() => {
    return refunds.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
  }, [refunds]);

  return {
    // البيانات
    refunds,
    stats,
    selectedRefund,
    refundPolicy,
    loading,
    error,

    // الدوال
    fetchRefunds,
    fetchStats,
    calculatePolicy,
    approveRefund,
    rejectRefund,
    updateStatus,
    getReasons,
    checkSpecialCases,
    getTimeline,
    generateEmailMessage,
    getRefundDetails,
    getRefundsByStatus,
    getTotalRefunded,

    // التعيينات
    setSelectedRefund,
    setError,
  };
};

export default useRefund;
