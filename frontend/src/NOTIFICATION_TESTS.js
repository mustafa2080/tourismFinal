/**
 * 🧪 ملف الاختبارات الشامل - نظام الإشعارات الفورية
 * 
 * استخدم هذا الملف للتحقق من أن كل شيء يعمل بشكل صحيح
 */

// 1. اختبر التسجيل والإشعار الترحيبي
// =====================================
export const testWelcomeNotification = async () => {
  console.log('🧪 اختبار: الإشعار الترحيبي عند التسجيل');
  
  try {
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'محمد أحمد',
        email: 'test@example.com',
        password: 'Password123',
        phone: '201012345678',
      }),
    });

    const data = await response.json();
    console.log('✅ التسجيل ناجح:', data);
    console.log('💡 يجب أن ترى إشعار ترحيبي في الـ Frontend');

    // تحقق من الإشعار في قاعدة البيانات
    const userId = data.data.user.id;
    await checkUserNotifications(userId);
  } catch (error) {
    console.error('❌ خطأ:', error);
  }
};

// 2. اختبر إشعار الحجز
// =====================
export const testBookingNotification = async (userId, packageId) => {
  console.log('🧪 اختبار: إشعار عند إنشاء حجز');
  
  try {
    const response = await fetch('http://localhost:5000/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        packageId,
        tripStartDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        persons: { adults: 2, children: 0, seniors: 0 },
        extras: [],
        totalPrice: 5000,
        paymentType: 'on_arrival',
      }),
    });

    const data = await response.json();
    console.log('✅ الحجز ناجح:', data);
    console.log('💡 يجب أن ترى إشعار الحجز في الـ Frontend');

    // تحقق من الإشعار
    await checkUserNotifications(userId);
  } catch (error) {
    console.error('❌ خطأ:', error);
  }
};

// 3. اختبر إشعار Contact
// =======================
export const testContactNotification = async () => {
  console.log('🧪 اختبار: إشعار عند إرسال رسالة');
  
  try {
    const response = await fetch('http://localhost:5000/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'محمد',
        email: 'user@example.com',
        phone: '201012345678',
        subject: 'استفسار حول الرحلات',
        message: 'هل هناك عروض خاصة على الرحلات؟',
      }),
    });

    const data = await response.json();
    console.log('✅ الرسالة أُرسلت:', data);
    console.log('💡 يجب أن يرى المستخدم إشعار الاستقبال');
    console.log('💡 يجب أن يرى الـ Admin إشعار بالرسالة الجديدة');
  } catch (error) {
    console.error('❌ خطأ:', error);
  }
};

// 4. اختبر جلب الإشعارات
// ========================
export const testGetNotifications = async () => {
  console.log('🧪 اختبار: جلب الإشعارات');
  
  try {
    const response = await fetch('http://localhost:5000/api/notifications', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    const data = await response.json();
    console.log('✅ الإشعارات:', data);
    
    if (data.data && data.data.length > 0) {
      console.log(`✅ وجدت ${data.data.length} إشعار`);
      console.log('أول إشعار:', data.data[0]);
    } else {
      console.log('⚠️ لا توجد إشعارات');
    }
  } catch (error) {
    console.error('❌ خطأ:', error);
  }
};

// 5. اختبر عداد غير المقروءة
// =============================
export const testUnreadCount = async () => {
  console.log('🧪 اختبار: عداد غير المقروءة');
  
  try {
    const response = await fetch('http://localhost:5000/api/notifications/unread', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    const data = await response.json();
    console.log('✅ عداد غير المقروءة:', data.data.unreadCount);
    
    if (data.data.unreadCount > 0) {
      console.log(`✅ هناك ${data.data.unreadCount} إشعار غير مقروء`);
    } else {
      console.log('✅ جميع الإشعارات مقروءة');
    }
  } catch (error) {
    console.error('❌ خطأ:', error);
  }
};

// 6. اختبر وضع علامة مقروء
// ==========================
export const testMarkAsRead = async (notificationId) => {
  console.log('🧪 اختبار: وضع علامة مقروء');
  
  try {
    const response = await fetch(
      `http://localhost:5000/api/notifications/${notificationId}/read`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );

    const data = await response.json();
    console.log('✅ تم وضع علامة مقروء:', data);
  } catch (error) {
    console.error('❌ خطأ:', error);
  }
};

// 7. اختبر WebSocket Connection
// ================================
export const testWebSocketConnection = () => {
  console.log('🧪 اختبار: اتصال WebSocket');
  
  try {
    const { io } = window;
    if (!io) {
      console.error('❌ Socket.IO لم يُحمّل');
      return;
    }

    const socket = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('✅ WebSocket متصل:', socket.id);
      
      // الاشتراك في الإشعارات
      socket.emit('subscribe:user', 'test-user-id');
      console.log('✅ تم الاشتراك في الإشعارات');

      // الاستماع للإشعارات
      socket.on('notification:new', (data) => {
        console.log('📬 إشعار جديد:', data);
      });

      socket.on('notifications:unread-count', (data) => {
        console.log('📊 تحديث العداد:', data);
      });
    });

    socket.on('error', (error) => {
      console.error('❌ خطأ في WebSocket:', error);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ خطأ في الاتصال:', error);
    });
  } catch (error) {
    console.error('❌ خطأ:', error);
  }
};

// 8. helper function - check user notifications
// ===============================================
export const checkUserNotifications = async (userId) => {
  console.log('📊 جاري التحقق من الإشعارات...');
  
  try {
    const response = await fetch(
      `http://localhost:5000/api/notifications?limit=5`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );

    const data = await response.json();
    if (data.data && data.data.length > 0) {
      console.log('✅ وجدت إشعارات:');
      data.data.forEach((notif, index) => {
        console.log(`  ${index + 1}. ${notif.title} - ${notif.message}`);
      });
    }
  } catch (error) {
    console.error('❌ خطأ في التحقق:', error);
  }
};

// 9. اختبر سريع شامل
// =====================
export const runFullTest = async () => {
  console.log(`
╔════════════════════════════════════════════════════╗
║     🧪 اختبار شامل نظام الإشعارات الفورية       ║
╚════════════════════════════════════════════════════╝
  `);

  console.log('1️⃣ اختبار اتصال WebSocket...');
  testWebSocketConnection();

  console.log('\n2️⃣ اختبار جلب الإشعارات...');
  await testGetNotifications();

  console.log('\n3️⃣ اختبار عداد غير المقروءة...');
  await testUnreadCount();

  console.log('\n4️⃣ اختبار رسالة contact...');
  await testContactNotification();

  console.log(`
╔════════════════════════════════════════════════════╗
║            ✅ اختبارات قيد التنفيذ                ║
╚════════════════════════════════════════════════════╝

للتوسع:
  • testWelcomeNotification() - اختبر التسجيل
  • testBookingNotification() - اختبر الحجز
  • testGetNotifications() - جلب الإشعارات
  • testUnreadCount() - عداد غير المقروءة
  • testMarkAsRead(id) - وضع علامة مقروء
  `);
};

// 10. export للاستخدام في الـ Console
// ======================================
window.notificationTests = {
  testWelcomeNotification,
  testBookingNotification,
  testContactNotification,
  testGetNotifications,
  testUnreadCount,
  testMarkAsRead,
  testWebSocketConnection,
  runFullTest,
};

console.log(`
✅ اختبارات الإشعارات جاهزة!

استخدم في Console:
  notificationTests.runFullTest()
  notificationTests.testGetNotifications()
  notificationTests.testUnreadCount()
  وغيرها...
`);
