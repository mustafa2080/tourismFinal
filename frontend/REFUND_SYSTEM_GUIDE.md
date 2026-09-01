# 💳 نظام إدارة المسترجعات (Refund System) - التوثيق الشامل

## 📋 نظرة عامة

تم تطوير نظام احترافي لإدارة المسترجعات يجمع بين الـ Backend و Frontend ويدعم:
- ✅ سياسات استرجاع ذكية بناءً على التواريخ
- ✅ دعم أنواع دفع متعددة (On Arrival, Deposit, Full Payment)
- ✅ حسابات تلقائية للمبالغ المسترجعة
- ✅ تتبع الحالة في الوقت الفعلي
- ✅ إشعارات بريدية تلقائية

---

## 🏗️ البنية المعمارية

### Backend Structure
```
Backend:
├── Controllers/
│   └── RefundController.ts        ⭐ معالج جميع عمليات الاسترجاع
├── Routes/
│   ├── admin.routes.ts            ⭐ مسارات إدارة الاسترجاع
│   └── booking.routes.ts
├── Entities/
│   └── Booking.ts                 ⭐ Entity مع حقول الاسترجاع
└── Services/
    └── EmailService.ts            ⭐ إرسال الرسائل البريدية

Frontend Structure:
├── services/
│   ├── refundService.js           ⭐ خدمة الاسترجاع الاحترافية
│   └── adminService.js            (يحتوي على refund methods)
├── hooks/
│   └── useRefund.js               ⭐ Hook للإدارة السهلة
└── pages/
    ├── AdminDashboard/pages/RefundsPage.jsx
    └── RefundPolicyPage.jsx
```

---

## 🔑 الحقول الأساسية في Database

```sql
-- في جدول bookings:
- refund_amount (decimal)           -- المبلغ المسترجع
- refund_reason (text)              -- سبب الاسترجاع
- refund_status (enum)              -- pending, approved, rejected, processed
- refund_processed_at (timestamp)   -- وقت معالجة الاسترجاع
- refund_processed_by (uuid)        -- معرف المسؤول الذي وافق
- refund_notes (text)               -- ملاحظات إضافية
```

---

## 📊 سياسات الاسترجاع (Refund Policies)

```
┌─────────────────────────────────────────────────────┐
│           تيمنج الاسترجاع والنسب المئوية            │
├─────────────────────────────────────────────────────┤
│ ≥ 30 يوم  │ 100% refund ✅  │ رسوم معالجة: 0%       │
│ 15-29 يوم │ 50% refund  ⚠️  │ رسوم معالجة: 5%       │
│ 7-14 يوم  │ 25% refund  ⚠️  │ رسوم معالجة: 7%       │
│ < 7 أيام  │ 0% refund   ❌  │ غير قابل للاسترجاع    │
└─────────────────────────────────────────────────────┘
```

---

## 💰 حسابات الاسترجاع حسب نوع الدفع

### 1️⃣ Pay on Arrival
```javascript
✅ المبلغ المسترجع = $0
💡 المنطق: العميل لم يدفع بعد
📧 الإجراء: الإلغاء يمنع جمع الدفعة عند الوصول
```

### 2️⃣ Deposit Payment
```javascript
📦 دفعة مقدمة = 30% من السعر الكلي
✅ المبلغ المسترجع = (دفعة مقدمة × نسبة الاسترجاع) - رسوم (5%)

مثال:
- السعر الكلي: $1000
- الدفعة المقدمة: $300
- يوم الإلغاء: 20 يوم (نسبة: 50%)
- المسترجع: ($300 × 50%) - ($150 × 5%) = $142.50
```

### 3️⃣ Full Payment
```javascript
✅ المبلغ المسترجع = (السعر الكلي × نسبة الاسترجاع) - رسوم (3%)

مثال:
- السعر الكلي: $1000
- يوم الإلغاء: 20 يوم (نسبة: 50%)
- المسترجع: ($1000 × 50%) - ($500 × 3%) = $485
```

---

## 🚀 كيفية الاستخدام

### 1. في Admin Dashboard - معالجة المسترجعات

```jsx
import useRefund from '@/hooks/useRefund';

function RefundsManagement() {
  const {
    refunds,
    stats,
    loading,
    fetchRefunds,
    approveRefund,
    rejectRefund,
    getRefundsByStatus
  } = useRefund();

  useEffect(() => {
    // جلب جميع المسترجعات عند فتح الصفحة
    fetchRefunds();
  }, []);

  const handleApprove = async (bookingId, amount, reason) => {
    await approveRefund(bookingId, amount, reason, 'Admin note');
    // ✅ سيتم تحديث القائمة والإحصائيات تلقائياً
  };

  const handleReject = async (bookingId, reason) => {
    await rejectRefund(bookingId, reason);
    // ❌ سيتم رفض الاسترجاع وتحديث البيانات
  };

  return (
    <div>
      {/* قائمة المسترجعات */}
      {refunds.map(refund => (
        <div key={refund.id}>
          <p>Booking: {refund.booking_number}</p>
          <p>Amount: ${refund.amount}</p>
          <p>Status: {refund.status}</p>
          <button onClick={() => handleApprove(refund.id, refund.amount, refund.reason)}>
            ✅ Approve
          </button>
          <button onClick={() => handleReject(refund.id, 'Invalid reason')}>
            ❌ Reject
          </button>
        </div>
      ))}
    </div>
  );
}
```

### 2. حساب سياسة الاسترجاع قبل الإلغاء

```jsx
import refundService from '@/services/refundService';

function CancelBooking({ booking }) {
  const refundInfo = refundService.calculateRefundByPaymentType(booking);
  
  return (
    <div>
      {/* عرض سياسة الاسترجاع */}
      <p>{refundInfo.policyInfo.message}</p>
      <p>Refund Amount: ${refundInfo.netRefund.toFixed(2)}</p>
      <p>Processing Fees: ${refundInfo.fees.toFixed(2)}</p>
      
      {/* تحذيرات خاصة */}
      {booking.payment_type === 'on_arrival' && (
        <Alert type="info">
          ℹ️ Pay on Arrival - No payment will be collected
        </Alert>
      )}
    </div>
  );
}
```

### 3. جلب الحالات الخاصة

```jsx
const specialCases = refundService.checkSpecialCircumstances(booking);

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
```

### 4. إرسال رسالة بريد تلقائية

```jsx
const emailMessage = refundService.generateRefundEmailMessage(booking, refundInfo);

// سيحتوي على:
// - subject: 'Full Refund Approved - Booking BK-12345'
// - body: رسالة احترافية مفصلة بكل التفاصيل
```

---

## 📡 API Endpoints

### Admin Endpoints

```
POST   /admin/bookings/:bookingId/refund
       Body: { refundAmount, refundReason, notes }
       ✅ وافق على المسترجع

PUT    /admin/bookings/:bookingId/refund/status
       Body: { status, notes }
       🔄 تحديث حالة المسترجع

POST   /admin/bookings/:bookingId/refund/reject
       Body: { reason }
       ❌ رفض المسترجع

GET    /admin/refunds?limit=20&offset=0
       📋 جلب جميع المسترجعات

GET    /admin/refunds?status=pending
       📋 جلب مسترجعات معينة بالحالة

GET    /admin/refunds/stats
       📊 احصائيات المسترجعات
```

---

## 🔄 مراحل معالجة المسترجاع

```
┌─────────────────────────────────────────────────┐
│         Customer Cancellation Request           │
└──────────────┬──────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────┐
│   System calculates refund policy (auto)        │
│   - Checks days until trip                      │
│   - Determines refund percentage                │
│   - Calculates processing fees                  │
└──────────────┬──────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────┐
│   Admin Reviews & Approves/Rejects (Manual)     │
└──────────────┬──────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────┐
│   Status: 'approved' or 'rejected'              │
│   - Send approval email with details            │
│   - Update booking status                       │
└──────────────┬──────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────┐
│   Bank Processes Refund (5-10 business days)    │
│   - Money returns to original payment method    │
└──────────────┬──────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────┐
│   Status: 'processed'                           │
│   - Refund complete                             │
└─────────────────────────────────────────────────┘
```

---

## 🎯 الحالات الخاصة

### 1. No-Show (عدم المجيء)
- المبلغ المسترجع: **$0**
- الحالة: **Non-refundable**
- الإجراء: رفع رسوم عدم المجيء

### 2. Operator Cancels Trip
- المبلغ المسترجع: **100% + رسوم**
- الحالة: **Full refund**
- الإجراء: إرسال عرض إعادة جدولة

### 3. Medical Emergency
- المبلغ المسترجع: **100% (مع توثيق)**
- الحالة: **Special case**
- الإجراء: معالجة يدوية من الإدارة

### 4. Force Majeure (كوارث)
- المبلغ المسترجع: **Depends on policy**
- الحالة: **Special consideration**
- الإجراء: تحقق من وثائق حكومية

---

## 📈 الإحصائيات المتتبعة

```javascript
{
  totalRefunds: 45,           // عدد المسترجعات
  totalAmount: 15000,         // إجمالي المبالغ المسترجعة
  approvalRate: 85,           // نسبة الموافقة (%)
  pendingRefunds: 5,          // قيد الانتظار
  approvedRefunds: 35,        // الموافق عليها
  rejectedRefunds: 5,         // المرفوضة
  processedRefunds: 0         // المكتملة
}
```

---

## ⚡ الأخطاء الشائعة وحلها

### Error 1: Refund amount exceeds booking total
```javascript
❌ الخطأ: محاولة استرجاع مبلغ أكثر من السعر الكلي
✅ الحل: التحقق من المبلغ قبل الموافقة
```

### Error 2: Payment on arrival - No refund needed
```javascript
❌ الخطأ: محاولة استرجاع لحجز "Pay on Arrival"
✅ الحل: التعامل مع "Pay on Arrival" خاصة (محاسبة فقط)
```

### Error 3: Trip already started
```javascript
❌ الخطأ: محاولة استرجاع بعد بداية الرحلة
✅ الحل: فحص تاريخ الرحلة قبل الموافقة
```

---

## 🎓 أمثلة عملية

### مثال 1: Approve Full Refund
```javascript
const booking = {
  id: 'BK-123',
  date_start: '2025-02-15',  // 25 يوم من الآن
  total_price: 1000,
  payment_type: 'full_payment'
};

const refundInfo = refundService.calculateRefundByPaymentType(booking);
// النتيجة:
// {
//   refundPercentage: 100,
//   refundAmount: 1000,
//   fees: 30,                    // 3% رسوم
//   netRefund: 970,
//   message: '100% refund - Full amount will be returned'
// }

await refundService.approveRefund(booking.id, 970, 'Customer requested');
// ✅ الاسترجاع معتمد والبريد أُرسل
```

### مثال 2: Partial Refund (Deposit)
```javascript
const booking = {
  id: 'BK-456',
  date_start: '2025-01-25',  // 5 أيام فقط
  total_price: 500,
  payment_type: 'deposit'
};

const refundInfo = refundService.calculateRefundByPaymentType(booking);
// النتيجة:
// {
//   refundPercentage: 0,         // لا يمكن الاسترجاع
//   refundAmount: 0,
//   fees: 0,
//   message: 'Non-refundable - Trip too close'
// }

await refundService.rejectRefund(booking.id, 'Outside refund window');
// ❌ الاسترجاع مرفوض لأن التاريخ قريب جداً
```

---

## 🔐 الأمان والصلاحيات

```javascript
// يجب أن يكون المستخدم admin للموافقة على المسترجعات
- POST   /admin/bookings/:id/refund        → adminMiddleware ✅
- PUT    /admin/bookings/:id/refund/status → adminMiddleware ✅
- POST   /admin/bookings/:id/refund/reject → adminMiddleware ✅
- GET    /admin/refunds                    → adminMiddleware ✅
```

---

## 📞 الدعم والمساعدة

### إذا واجهت مشاكل:

1. **تحقق من السجلات** (console + backend logs)
2. **تأكد من صلاحيات المسؤول**
3. **تحقق من تاريخ الرحلة والسياسة**
4. **تواصل مع فريق الدعم**

---

## ✅ Checklist للاستخدام

- [ ] تثبيت refundService و useRefund
- [ ] تحديث RefundsPage مع الـ hook الجديد
- [ ] اختبار سياسات الاسترجاع المختلفة
- [ ] اختبار أنواع الدفع الثلاثة
- [ ] اختبار الرسائل البريدية
- [ ] اختبار الإحصائيات
- [ ] نشر في الإنتاج

---

**آخر تحديث:** November 2024 ✅
**الإصدار:** 1.0.0 - Production Ready 🚀
