# نظام الإشعارات المتكامل - دليل المطور

## نظرة عامة
تم إعداد نظام إشعارات متكامل يربط الفرونتاند بالباكاند من خلال:
1. **WebSocket** - للإشعارات الفورية في الوقت الفعلي
2. **REST API** - لاسترجاع الإشعارات وتحديثها
3. **Toast Notifications** - لإظهار الإشعارات للمستخدم

---

## المكونات الرئيسية

### 1. الفرونتاند

#### مكونات UI
- **Header.jsx** - عرض icon الجرس مع عداد الإشعارات غير المقروءة
- **NotificationCenter.jsx** - مركز إدارة الإشعارات الشامل

#### Hooks
- **useNotifications.js** - إدارة حالة الإشعارات والاتصال مع الـ WebSocket

#### الخدمات
- **notificationsService.js** - API endpoints للتعامل مع الإشعارات
- **socketService.js** - إدارة الاتصالات WebSocket

#### الأدوات
- **toastHandler.js** - عرض الإشعارات الفورية (Toast)

---

## 2. الباكاند

#### Entities
- **Notification.ts** - كيان الإشعار في قاعدة البيانات

#### Controllers
- **NotificationController.ts** - معالجة طلبات الإشعارات

#### Services
- **NotificationService.ts** - منطق إنشاء وإدارة الإشعارات
- **BookingService.ts** - ينشئ إشعارات عند إنشاء حجز جديد

#### WebSocket
- **socket.ts** - إرسال الإشعارات عبر WebSocket للمستخدمين

#### Routes
- **notification.routes.ts** - نقاط نهاية الإشعارات

---

## تدفق الإشعارات

### 1. إشعار الحجز الجديد

```
المستخدم ينشئ حجز
    ↓
BookingController.createBooking()
    ↓
BookingService.createBooking()
    ↓
NotificationService.notifyBookingCreated() → حفظ في DB
    ↓
WebSocketService.notifyNewBooking() → إرسال عبر WebSocket
    ↓
Notification:new event في الفرونتاند
    ↓
Toast + Update UI + Increment counter
```

### 2. استقبال الإشعارات

```
الفرونتاند يتصل:
    ↓
socketService.init() → اتصال WebSocket
    ↓
subscribe:user event → الاشتراك في الإشعارات الشخصية
    ↓
listen to notification:new events
    ↓
عرض Toast + إضافة للـ state
```

---

## الاستخدام

### في الفرونتاند

```jsx
// 1. استيراد الـ Hook
import { useNotifications } from '../hooks/useNotifications';

// 2. استخدام في Component
const MyComponent = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    deleteNotification
  } = useNotifications();

  return (
    <div>
      <p>عدد الإشعارات غير المقروءة: {unreadCount}</p>
      {notifications.map(notif => (
        <div key={notif.id}>
          <h3>{notif.title}</h3>
          <p>{notif.message}</p>
          <button onClick={() => markAsRead(notif.id)}>
            وضع علامة كمقروء
          </button>
        </div>
      ))}
    </div>
  );
};
```

### في الباكاند

```typescript
// 1. إنشاء إشعار
const notificationService = new NotificationService();
await notificationService.notifyBookingCreated(userId, {
  bookingNumber: 'BK-123456',
  packageTitle: 'عطلة في مصر',
  tripDate: '2024-12-25',
  totalPrice: 5000
});

// 2. الإشعار يُحفظ تلقائياً في DB
// 3. يُرسل عبر WebSocket للمستخدم
// 4. يُعرض في الفرونتاند
```

---

## API Endpoints

### GET `/api/notifications`
الحصول على إشعارات المستخدم
```
Query Parameters:
- limit: 20 (افتراضي)
- offset: 0 (افتراضي)
```

### GET `/api/notifications/unread`
عدد الإشعارات غير المقروءة
```
Response:
{
  "success": true,
  "data": { "unreadCount": 5 }
}
```

### PUT `/api/notifications/:id/read`
وضع علامة على إشعار كمقروء

### PUT `/api/notifications/read-all`
وضع علامة على جميع الإشعارات كمقروءة

### DELETE `/api/notifications/:id`
حذف إشعار واحد

### DELETE `/api/notifications`
حذف جميع الإشعارات

---

## WebSocket Events

### من الفرونتاند → الباكاند

```javascript
socket.emit('subscribe:user', userId);
socket.emit('subscribe:admin', adminId);
```

### من الباكاند → الفرونتاند

```javascript
// إشعار جديد
socket.on('notification:new', (notification) => {
  // notification = {
  //   id, title, message, type,
  //   payload, is_read, created_at
  // }
});

// تحديث عداد الإشعارات غير المقروءة
socket.on('notifications:unread-count', (data) => {
  // data = { unreadCount: 5 }
});
```

---

## أنواع الإشعارات

```typescript
'booking:created'      // حجز جديد تم إنشاؤه
'booking:confirmed'    // حجز تم تأكيده
'booking:cancelled'    // حجز تم إلغاؤه
'booking:reminder'     // تذكير قبل الرحلة
'review:approved'      // تقييم تم قبوله
'review:rejected'      // تقييم تم رفضه
'admin:alert'         // تنبيه للإدارة
'general'             // إشعار عام
```

---

## معالجة الأخطاء

### خطأ WebSocket

```javascript
// في socketService.js، يتم التعامل مع أخطاء الاتصال تلقائياً
// مع محاولات إعادة الاتصال
```

### خطأ API

```javascript
// في notificationsService.js
try {
  const response = await notificationsService.getNotifications();
} catch (error) {
  showErrorToast('فشل في تحميل الإشعارات');
}
```

---

## اختبار النظام

### اختبر الحصول على الإشعارات
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/notifications
```

### اختبر WebSocket
```javascript
const socket = io('http://localhost:5000', {
  reconnection: true
});

socket.on('connect', () => {
  console.log('Connected');
  socket.emit('subscribe:user', 'user-id-here');
});

socket.on('notification:new', (data) => {
  console.log('New notification:', data);
});
```

---

## الأداء والتحسينات

### 1. تخزين مؤقت
- يتم تخزين الإشعارات في `state` في الفرونتاند
- تحديث فقط الإشعارات الجديدة عند الاستقبال

### 2. الحد من حمل قاعدة البيانات
- الإشعارات القديمة (أكثر من 30 يوم) يتم حذفها تلقائياً
- استخدام pagination للإشعارات

### 3. WebSocket Optimization
- اتصال واحد لكل مستخدم
- إعادة اتصال تلقائية عند انقطاع الاتصال
- دعم polling كخيار احتياطي

---

## ملاحظات مهمة

1. **التوثيق**: جميع الطلبات تتطلب token المصادقة
2. **الأمان**: الإشعارات محمية وكل مستخدم يرى إشعاراته فقط
3. **الأداء**: استخدم pagination عند جلب عدد كبير من الإشعارات
4. **النسخة الاحتياطية**: يتم حفظ جميع الإشعارات في قاعدة البيانات

---

## الدعم

للتقارير عن الأخطاء أو الاقتراحات، يرجى التواصل مع فريق التطوير.
