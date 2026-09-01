✅ حل شامل لمشكلة الإشعارات في الـ Navbar

## المشكلة الأصلية
عندما كنت تضغط على الرسائل/الإشعارات في الـ navbar، التطبيق لم يكن ينقلك على الصفحة المناسبة (صفحة الحجز مثلاً).

## تحليل السبب
1. **عدم اتساق نوع الإشعارات**: البيانات من الـ WebSocket كانت تستخدم `booking:created` بينما الـ Frontend كان يتوقع `booking_created`
2. **مشكلة في استخراج البيانات**: البيانات المطلوبة (bookingId) كانت موجودة في `payload` لكن الكود لم يكن يستخرجها بشكل صحيح
3. **المسارات غير مسجلة**: المسارات مثل `/dashboard/bookings/:bookingId` و `/dashboard/refunds/:refundId` لم تكن مسجلة في AppRoutes
4. **عدم الاشتراك في الـ namespace**: الـ Frontend لم يكن يشترك في الـ `/notifications` namespace بشكل صحيح

## الحلول المطبقة

### 1. إنشاء Utility للملاحة من الإشعارات
📁 File: `src/utils/notificationNavigation.js`
- دالة `getNavigationPathFromNotification()` توفر منطق مركزي للملاحة
- تدعم جميع أنواع الإشعارات: bookings, payments, reviews, wishlist, refunds, messages
- توفر logging شامل لتتبع الأخطاء

### 2. تحديث Header Component
📁 File: `src/components/layout/Header.jsx`
- إضافة import للـ `getNavigationPathFromNotification`
- إضافة `subscribe:user` عند اتصال WebSocket
- تحسين معالجة النقر على الإشعارات
- إضافة logging شامل لتتبع ما يحدث

### 3. تحديث AppRoutes
📁 File: `src/AppRoutes.jsx`
- إضافة المسارات الجديدة:
  - `/dashboard/bookings/:bookingId`
  - `/dashboard/refunds/:refundId`
- تأكيد تسجيل جميع المسارات المطلوبة

### 4. تحسين Socket Service
📁 File: `src/services/socketService.js`
- إضافة `onNewNotification()` listener
- دعم الاستماع للإشعارات الجديدة من الـ WebSocket

### 5. البيانات من الـ Backend
✅ البيانات صحيحة بالفعل:
- `type`: مثل `booking:created`, `payment:received`, إلخ
- `payload`: يحتوي على `bookingId`, `packageId`, `refundId`
- يتم إرسالها عبر `emitToUser()` في الـ namespace الصحيح

## كيفية الاستخدام الآن

عندما تنشئ حجز جديد:
```
1. Backend ينشئ إشعار بنوع `booking:created`
2. يرسل الإشعار عبر WebSocket مع `bookingId` في الـ payload
3. Frontend يستقبل الإشعار ويعرضه في الـ navbar
4. عند النقر على الإشعار:
   - يتم استدعاء getNavigationPathFromNotification()
   - ينتج عنها المسار `/dashboard/bookings/{bookingId}`
   - يتم الملاحة لصفحة الحجز مباشرة
```

## أنواع الإشعارات المدعومة
✅ booking:created → `/dashboard/bookings/{bookingId}`
✅ booking:confirmed → `/dashboard/bookings/{bookingId}`
✅ booking:cancelled → `/dashboard/bookings/{bookingId}`
✅ booking:reminder → `/dashboard/bookings/{bookingId}`
✅ payment:received → `/dashboard/bookings/{bookingId}`
✅ payment:failed → `/dashboard/bookings/{bookingId}`
✅ review:approved → `/packages/{packageId}`
✅ review:received → `/packages/{packageId}`
✅ wishlist:item_available → `/packages/{packageId}`
✅ refund:processed → `/dashboard/refunds/{refundId}`
✅ refund:initiated → `/dashboard/refunds/{refundId}`
✅ message:new → `/admin/contact/{messageId}`
✅ admin:alert → `/admin`

## تتبع الأخطاء

يمكنك فتح Developer Tools (F12) وفي Console ستجد:
- 🔔 New notification received: `{notification data}`
- 🔍 [Notification Click] Processing: معلومات الإشعار
- 📚 Booking notification → Path: `/dashboard/bookings/...`
- 🎯 Final navigation path: المسار النهائي

## الملفات المعدلة
1. ✅ `src/components/layout/Header.jsx` - تحديث معالجة الإشعارات
2. ✅ `src/AppRoutes.jsx` - إضافة المسارات الجديدة
3. ✅ `src/services/socketService.js` - تحسين listeners
4. ✅ `src/utils/notificationNavigation.js` - ملف جديد (Utility)

## الخطوات التالية المقترحة
1. اختبار الإشعارات مع حالات مختلفة
2. إضافة animations عند الملاحة من الإشعارات
3. تحديث صور الإشعارات (badges) بناءً على النوع
4. إضافة notificationCenter منفصل للمزيد من التفاصيل
