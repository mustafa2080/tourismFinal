/**
 * 📋 REFUND SYSTEM - كيفية الاستخدام في الكود
 * ============================================
 */

// ============================================================
// 1️⃣ استخدام الـ Service بشكل مباشر
// ============================================================

import refundService from '@/services/refundService';

// حساب سياسة الاسترجاع
const booking = {
  date_start: '2025-02-15',
  total_price: 1000,
  payment_type: 'full_payment'
};

const policy = refundService.calculateRefundPolicy(
  booking.date_start,
  booking.total_price
);

console.log(policy);
// {
//   daysUntilTrip: 25,
//   refundPercentage: 100,
//   refundAmount: 1000,
//   canRefund: true,
//   message: '✅ 100% refund - Full amount will be returned'
// }

// حساب مفصل حسب نوع الدفع
const refundInfo = refundService.calculateRefundByPaymentType(booking);

console.log(refundInfo);
// {
//   policyInfo: { ... },
//   paymentType: 'full_payment',
//   totalBookingPrice: 1000,
//   refundableAmount: 1000,
//   fees: 30,        // 3% رسوم
//   netRefund: 970,
//   details: { ... }
// }

// ============================================================
// 2️⃣ استخدام الـ Hook (الطريقة الموصى بها)
// ============================================================

import useRefund from '@/hooks/useRefund';

function MyComponent() {
  const {
    // البيانات
    refunds,           // قائمة المسترجعات
    stats,             // الإحصائيات
    selectedRefund,    // المسترجع المختار
    refundPolicy,      // سياسة الاسترجاع
    loading,           // حالة التحميل
    error,             // الأخطاء

    // الدوال
    fetchRefunds,                // جلب المسترجعات
    fetchStats,                  // جلب الإحصائيات
    calculatePolicy,             // حساب السياسة
    approveRefund,               // موافقة
    rejectRefund,                // رفض
    updateStatus,                // تحديث الحالة
    getReasons,                  // أسباب الاسترجاع
    checkSpecialCases,           // الحالات الخاصة
    getTimeline,                 // التسلسل الزمني
    generateEmailMessage,        // رسالة البريد
    getRefundDetails,            // تفاصيل المسترجع
    getRefundsByStatus,          // مسترجعات بحالة معينة
    getTotalRefunded,            // إجمالي المسترجع

    // التعيينات
    setSelectedRefund,
    setError
  } = useRefund();

  // استخدام:
  useEffect(() => {
    // جلب البيانات عند فتح الصفحة
    fetchRefunds(20, 0);
    fetchStats();
  }, []);

  return (
    <div>
      {/* عرض الإحصائيات */}
      {stats && (
        <div>
          <p>Total Refunds: {stats.totalRefunds}</p>
          <p>Total Amount: ${stats.totalAmount}</p>
          <p>Approval Rate: {stats.approvalRate}%</p>
        </div>
      )}

      {/* عرض قائمة المسترجعات */}
      {refunds.map(refund => (
        <div key={refund.id} onClick={() => setSelectedRefund(refund)}>
          <p>Booking: {refund.booking_number}</p>
          <p>Amount: ${refund.amount}</p>
          <p>Status: {refund.status}</p>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// 3️⃣ حساب سياسة الاسترجاع في صفحة إلغاء الحجز
// ============================================================

function CancelBookingPage() {
  const { calculatePolicy } = useRefund();

  const booking = {
    date_start: '2025-02-10',
    total_price: 500,
    payment_type: 'deposit'
  };

  const policy = calculatePolicy(booking);

  return (
    <div>
      <h2>Cancellation Policy</h2>
      
      {/* عرض السياسة */}
      <div className={policy.canRefund ? 'text-green-600' : 'text-red-600'}>
        <p>{policy.message}</p>
        <p>Refund: ${policy.refundAmount}</p>
        <p>Percentage: {policy.refundPercentage}%</p>
      </div>

      {/* عرض التحذيرات */}
      {!policy.canRefund && (
        <div className="alert alert-warning">
          ⚠️ This cancellation is outside the refund window
        </div>
      )}

      <button onClick={handleCancel}>
        {policy.canRefund ? 'Cancel & Refund' : 'Cancel (No Refund)'}
      </button>
    </div>
  );
}

// ============================================================
// 4️⃣ معالجة المسترجع في Admin Panel
// ============================================================

function RefundApprovalModal() {
  const { approveRefund, rejectRefund, selectedRefund } = useRefund();
  const [notes, setNotes] = useState('');

  const handleApprove = async () => {
    try {
      await approveRefund(
        selectedRefund.id,
        selectedRefund.amount,
        selectedRefund.reason,
        notes
      );
      toast.success('✅ Refund approved');
      // سيتم تحديث البيانات تلقائياً
    } catch (error) {
      toast.error('❌ Failed to approve');
    }
  };

  const handleReject = async () => {
    try {
      await rejectRefund(selectedRefund.id, notes);
      toast.success('✅ Refund rejected');
    } catch (error) {
      toast.error('❌ Failed to reject');
    }
  };

  return (
    <div>
      <p>Amount: ${selectedRefund.amount}</p>
      <p>Status: {selectedRefund.status}</p>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Add notes..."
      />

      <button onClick={handleApprove}>✅ Approve</button>
      <button onClick={handleReject}>❌ Reject</button>
    </div>
  );
}

// ============================================================
// 5️⃣ جلب الأسباب الشائعة للاسترجاع
// ============================================================

import refundService from '@/services/refundService';

function RefundReasonSelect() {
  const reasons = refundService.getCommonRefundReasons();

  return (
    <select>
      <option>Select a reason...</option>
      {reasons.map(reason => (
        <option key={reason.id} value={reason.id}>
          {reason.emoji} {reason.label}
        </option>
      ))}
    </select>
  );
}

// النتيجة:
// 🚨 Personal Emergency
// 🏥 Health Issues
// 💰 Financial Difficulties
// 📅 Schedule Conflict
// ⛈️ Bad Weather
// 🔄 Trip Changed
// 😞 Not Satisfied
// ❓ Other

// ============================================================
// 6️⃣ التحقق من الحالات الخاصة
// ============================================================

function SpecialCasesChecker() {
  const { checkSpecialCases } = useRefund();

  const booking = {
    date_start: '2025-01-25',
    total_price: 1000,
    extras: [{ id: 1 }]  // له إضافات
  };

  const specialCases = checkSpecialCases(booking);

  return (
    <div>
      {specialCases.map(caseItem => (
        <div key={caseItem.type} className={`alert alert-${caseItem.severity}`}>
          {caseItem.message}
        </div>
      ))}
    </div>
  );
}

// النتيجة:
// [
//   {
//     type: 'urgent',
//     severity: 'high',
//     message: '⚠️ Cancellation very close to trip date'
//   },
//   {
//     type: 'has_extras',
//     severity: 'medium',
//     message: '📌 This booking has add-ons'
//   }
// ]

// ============================================================
// 7️⃣ التسلسل الزمني للمعالجة
// ============================================================

function RefundTimeline() {
  const timeline = refundService.getRefundProcessingTimeline();

  return (
    <div>
      <h3>Processing Timeline</h3>
      
      <div>
        <p>Step 1: {timeline.step1.name} - {timeline.step1.time}</p>
        <p>{timeline.step1.description}</p>
      </div>

      <div>
        <p>Step 2: {timeline.step2.name} - {timeline.step2.time}</p>
        <p>{timeline.step2.description}</p>
      </div>

      <div>
        <p>Step 3: {timeline.step3.name} - {timeline.step3.time}</p>
        <p>{timeline.step3.description}</p>
      </div>

      <div>
        <p>Step 4: {timeline.step4.name} - {timeline.step4.time}</p>
        <p>{timeline.step4.description}</p>
      </div>

      <p className="font-bold">Total: {timeline.total}</p>
    </div>
  );
}

// ============================================================
// 8️⃣ إنشاء رسالة بريد تلقائية
// ============================================================

function SendRefundEmail() {
  const booking = { /* ... */ };
  const refundInfo = { /* ... */ };

  const emailMessage = refundService.generateRefundEmailMessage(booking, refundInfo);

  return (
    <div>
      <p>To: {booking.user.email}</p>
      <p>Subject: {emailMessage.subject}</p>
      <textarea readOnly value={emailMessage.body} />

      <button onClick={() => sendEmail(emailMessage)}>
        Send Email
      </button>
    </div>
  );
}

// ============================================================
// 9️⃣ فلترة المسترجعات بالحالة
// ============================================================

function RefundsByStatus() {
  const { getRefundsByStatus } = useRefund();

  const pendingRefunds = getRefundsByStatus('pending');
  const approvedRefunds = getRefundsByStatus('approved');
  const rejectedRefunds = getRefundsByStatus('rejected');

  return (
    <div>
      <div>
        <h3>Pending ({pendingRefunds.length})</h3>
        {pendingRefunds.map(r => <RefundCard key={r.id} refund={r} />)}
      </div>

      <div>
        <h3>Approved ({approvedRefunds.length})</h3>
        {approvedRefunds.map(r => <RefundCard key={r.id} refund={r} />)}
      </div>

      <div>
        <h3>Rejected ({rejectedRefunds.length})</h3>
        {rejectedRefunds.map(r => <RefundCard key={r.id} refund={r} />)}
      </div>
    </div>
  );
}

// ============================================================
// 🔟 حساب إجمالي المبالغ المسترجعة
// ============================================================

function RefundStats() {
  const { getTotalRefunded, stats } = useRefund();

  const totalRefunded = getTotalRefunded();

  return (
    <div className="stats">
      <p>Total Refunded: ${totalRefunded.toLocaleString()}</p>
      <p>Average per Refund: ${(totalRefunded / (stats?.totalRefunds || 1)).toFixed(2)}</p>
      <p>Total Requests: {stats?.totalRefunds}</p>
    </div>
  );
}

// ============================================================
// ✅ ملخص الطرق
// ============================================================

/**
 * Service Methods:
 * 1. calculateRefundPolicy()           - حساب سياسة الاسترجاع
 * 2. calculateRefundByPaymentType()    - حساب حسب نوع الدفع
 * 3. getRefundProcessingTimeline()     - التسلسل الزمني
 * 4. getCommonRefundReasons()          - الأسباب الشائعة
 * 5. checkSpecialCircumstances()       - الحالات الخاصة
 * 6. generateRefundEmailMessage()      - رسالة البريد
 * 7. getRefunds()                      - جلب المسترجعات
 * 8. getRefundStats()                  - الإحصائيات
 * 9. approveRefund()                   - موافقة
 * 10. rejectRefund()                   - رفض
 * 11. updateRefundStatus()             - تحديث الحالة
 */

/**
 * Hook Methods:
 * 1. fetchRefunds()                    - جلب البيانات
 * 2. fetchStats()                      - جلب الإحصائيات
 * 3. calculatePolicy()                 - حساب السياسة
 * 4. approveRefund()                   - موافقة
 * 5. rejectRefund()                    - رفض
 * 6. updateStatus()                    - تحديث الحالة
 * 7. getReasons()                      - الأسباب
 * 8. checkSpecialCases()               - الحالات الخاصة
 * 9. getTimeline()                     - التسلسل الزمني
 * 10. generateEmailMessage()           - رسالة البريد
 * 11. getRefundDetails()               - تفاصيل
 * 12. getRefundsByStatus()             - فلترة
 * 13. getTotalRefunded()               - الإجمالي
 */

// ============================================================
// 🎯 الاستخدام الموصى به
// ============================================================

/**
 * للـ Admin Pages: استخدم الـ Hook
 *   ✅ أسهل وأنظف
 *   ✅ تحديثات تلقائية
 *   ✅ معالجة أخطاء شاملة
 *
 * للحسابات البسيطة: استخدم Service مباشرة
 *   ✅ حساب الرسوم
 *   ✅ حساب السياسة
 *   ✅ عرض الرسائل
 */

export default RefundServiceGuide;
