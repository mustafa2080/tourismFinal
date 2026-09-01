/**
 * ✅ نظام الإشعارات الفورية مع العداد - دليل التطبيق
 * 
 * تم تطبيق نظام شامل للإشعارات الفورية مع الميزات التالية:
 * 
 * 📋 الميزات المطبقة:
 * ========================
 * 
 * 1️⃣ إشعار ترحيبي عند التسجيل (مرحبا بك)
 *    - يتم إنشاؤه تلقائياً في AuthService.register()
 *    - نوع: 'general'
 *    - يُرسل فوراً عبر WebSocket
 * 
 * 2️⃣ إشعار عند الحجز (تم استقبال حجزك)
 *    - يتم إنشاؤه تلقائياً في BookingService.createBooking()
 *    - نوع: 'booking:created'
 *    - يحتوي على تفاصيل الحجز والسعر
 * 
 * 3️⃣ إشعار عند إرسال رسالة Contact (تم استقبال رسالتك)
 *    - يتم إنشاؤه تلقائياً في ContactService.submitContactForm()
 *    - يُرسل للمستخدم + إشعار للـ Admin
 *    - نوع: 'general' للمستخدم
 * 
 * 4️⃣ عداد الإشعارات المقروءة/غير المقروءة
 *    - يتم تحديثه فوراً عبر WebSocket
 *    - يعرض في الـ Badge على رمز الجرس
 * 
 * 🔧 المكونات الرئيسية:
 * ========================
 * 
 * Backend:
 * --------
 * 📁 src/services/NotificationService.ts
 *    - إنشاء وإدارة الإشعارات
 *    - حفظ في قاعدة البيانات
 *    - أنواع: booking:created, booking:confirmed, general, admin:alert, إلخ
 * 
 * 📁 src/websocket/socket.ts
 *    - notifyUserGeneral() - إرسال إشعار فوري للمستخدم
 *    - emitUnreadCountUpdate() - تحديث العداد
 *    - notifyAdminGeneral() - إشعارات الـ Admin
 * 
 * 📁 src/services/AuthService.ts
 *    - إنشاء إشعار ترحيبي عند التسجيل
 * 
 * 📁 src/services/BookingService.ts
 *    - إنشاء إشعار الحجز عند createBooking()
 * 
 * 📁 src/services/ContactService.ts
 *    - إشعار استقبال الرسالة للمستخدم
 *    - إشعار جديد للـ Admin
 * 
 * Frontend:
 * ---------
 * 📁 src/hooks/useNotifications.js
 *    - Hook لإدارة الإشعارات
 *    - الاستماع للإشعارات الفورية عبر WebSocket
 *    - جلب الإشعارات من الـ API
 * 
 * 📁 src/components/NotificationCenter.jsx
 *    - مكون React لعرض الإشعارات
 *    - جرس بـ Badge للعداد
 *    - قائمة الإشعارات بـ Filter
 * 
 * 📁 src/styles/NotificationCenter.css
 *    - أنماط كاملة متجاوبة
 * 
 * 🚀 كيفية الاستخدام:
 * ====================
 * 
 * 1. في App.jsx أو Layout الرئيسي:
 *    ```jsx
 *    import NotificationCenter from './components/NotificationCenter';
 *    
 *    function App() {
 *      return (
 *        <header>
 *          <NotificationCenter />
 *        </header>
 *      );
 *    }
 *    ```
 * 
 * 2. تهيئة WebSocket:
 *    ```jsx
 *    import { socketService } from './services/socketService';
 *    import { useAuth } from './context/AuthContext';
 *    
 *    function App() {
 *      const { user } = useAuth();
 *      
 *      useEffect(() => {
 *        if (user) {
 *          // إنشاء الاتصال
 *          const socket = socketService.connect();
 *          
 *          // الاشتراك في الإشعارات الشخصية
 *          socket.emit('subscribe:user', user.id);
 *        }
 *      }, [user]);
 *    }
 *    ```
 * 
 * 🎯 نقاط مهمة:
 * ===============
 * 
 * ✅ الإشعارات تُحفظ في قاعدة البيانات
 * ✅ تُرسل فوراً عبر WebSocket
 * ✅ العداد يُحدّث تلقائياً
 * ✅ رسالة ترحيبية للمستخدمين الجدد
 * ✅ إشعار عند كل حجز جديد
 * ✅ إشعار عند رسالة contact من المستخدم
 * ✅ واجهة سهلة الاستخدام
 * ✅ متجاوبة على جميع الأجهزة
 * 
 * 🔐 الأمان:
 * ============
 * - كل مستخدم يرى فقط إشعاراته
 * - الـ Admin يرى إشعارات إدارية
 * - التحقق من الصلاحيات في كل عملية
 * 
 * 📊 مثال API Endpoints:
 * ========================
 * GET    /api/notifications - جلب جميع الإشعارات
 * GET    /api/notifications/unread - عداد غير المقروءة
 * GET    /api/notifications/unread/list - قائمة غير المقروءة
 * PUT    /api/notifications/:id/read - وضع علامة مقروء
 * PUT    /api/notifications/read-all - وضع علامة على الكل
 * DELETE /api/notifications/:id - حذف إشعار
 * DELETE /api/notifications - حذف الكل
 * 
 * 🔔 أنواع الإشعارات المدعومة:
 * =============================
 * - booking:created - تم استقبال الحجز
 * - booking:confirmed - تم تأكيد الحجز
 * - booking:cancelled - تم إلغاء الحجز
 * - booking:reminder - تذكير قبل الرحلة
 * - review:approved - تم قبول التقييم
 * - review:rejected - تم رفض التقييم
 * - payment:received - تم استقبال الدفع
 * - admin:alert - تنبيه إداري
 * - general - إشعار عام
 * 
 * 💾 نموذج Notification في قاعدة البيانات:
 * =============================================
 * {
 *   id: UUID,
 *   user_id: UUID,
 *   type: string,
 *   title: string,
 *   message: string,
 *   payload: JSON,
 *   is_read: boolean,
 *   created_at: timestamp,
 *   updated_at: timestamp
 * }
 * 
 * ✨ الخطوات التالية (اختيارية):
 * ==============================
 * 1. إضافة نوتيفيكيشن للبريد الإلكتروني
 * 2. إضافة نوتيفيكيشن SMS
 * 3. إضافة Push Notifications
 * 4. إضافة صوت التنبيه
 * 5. إضافة صفحة إعدادات الإشعارات
 * 6. إضافة إحصائيات الإشعارات
 */

// استخدام في الـ Auth:
// عند التسجيل الناجح → إشعار ترحيبي
// عند تسجيل الدخول → تحديث الإشعارات المعلقة

// استخدام في الـ Booking:
// عند إنشاء حجز → إشعار فوري
// عند تأكيد الحجز → إشعار تأكيد
// عند إلغاء الحجز → إشعار إلغاء

// استخدام في Contact:
// عند إرسال رسالة → إشعار للمستخدم + تنبيه للـ Admin

export const NOTIFICATION_TYPES = {
  BOOKING_CREATED: 'booking:created',
  BOOKING_CONFIRMED: 'booking:confirmed',
  BOOKING_CANCELLED: 'booking:cancelled',
  BOOKING_REMINDER: 'booking:reminder',
  REVIEW_APPROVED: 'review:approved',
  REVIEW_REJECTED: 'review:rejected',
  PAYMENT_RECEIVED: 'payment:received',
  ADMIN_ALERT: 'admin:alert',
  GENERAL: 'general',
};

export const NOTIFICATION_MESSAGES = {
  WELCOME: {
    title: 'مرحباً بك! 👋',
    message: (name) => `${name}، أهلاً وسهلاً في عائلتنا. استمتع باستكشاف أفضل الرحلات السياحية.`,
  },
  BOOKING_CREATED: {
    title: 'تم استقبال حجزك! 🎉',
    message: (bookingNum, packageName) => `تم استقبال حجزك #${bookingNum} لـ ${packageName}`,
  },
  CONTACT_RECEIVED: {
    title: 'تم استقبال رسالتك ✅',
    message: (name) => `شكراً لتواصلك معنا ${name}. سيتم الرد عليك قريباً.`,
  },
};
