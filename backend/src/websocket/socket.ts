import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';

export class WebSocketService {
  private io: Server;

  constructor(httpServer: HTTPServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
          const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:5173',
            'http://localhost:5174',
            'http://localhost:5175',
            'http://localhost:5176',
            'http://localhost:5177',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:5173',
            'http://127.0.0.1:5174',
            'http://127.0.0.1:5175',
            'http://127.0.0.1:5176',
            'http://127.0.0.1:5177',
            process.env.FRONTEND_URL,
          ].filter(Boolean);

          if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            console.warn(`⚠️ Socket.IO CORS rejected origin: ${origin}`);
            callback(null, false);
          }
        },
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    this.setupNamespaces();
  }

  /**
   * إعداد الـ namespaces
   */
  private setupNamespaces(): void {
    // Notifications namespace للإشعارات
    const notificationsNamespace = this.io.of('/notifications');

    notificationsNamespace.on('connection', (socket: Socket) => {
      console.log(`✅ User connected to /notifications: ${socket.id}`);

      // عندما يتصل المستخدم، يضيع نفسه لـ user room
      socket.on('subscribe:user', (userId: string) => {
        socket.join(`user:${userId}`);
        console.log(`📍 User ${userId} subscribed to personal notifications`);
      });

      // عندما يتصل admin، يضيع نفسه لـ admin room
      socket.on('subscribe:admin', (adminId: string) => {
        socket.join('admin');
        console.log(`👤 Admin ${adminId} subscribed to admin notifications`);
      });

      socket.on('disconnect', () => {
        console.log(`❌ User disconnected: ${socket.id}`);
      });
    });
  }

  /**
   * إرسال إشعار لمستخدم معين
   */
  emitToUser(userId: string, eventName: string, data: any): void {
    this.io.of('/notifications').to(`user:${userId}`).emit(eventName, data);
    console.log(`📬 Event '${eventName}' sent to user: ${userId}`);
  }

  /**
   * إرسال إشعار لجميع الـ admins
   */
  emitToAdmins(eventName: string, data: any): void {
    this.io.of('/notifications').to('admin').emit(eventName, data);
    console.log(`📢 Event '${eventName}' sent to all admins`);
  }

  /**
   * إرسال إشعار للكل
   */
  emitToAll(eventName: string, data: any): void {
    this.io.of('/notifications').emit(eventName, data);
    console.log(`📡 Event '${eventName}' broadcast to all`);
  }

  /**
   * عند إنشاء حجز جديد - تحديث النسخة
   */
  notifyNewBooking(booking: any, userId: string, adminId?: string): void {
    // إخطار المستخدم برقم الحجز الفريد وتفاصيل الحزمة
    const userNotification = {
      id: `notif-${Date.now()}-${Math.random()}`,
      type: 'booking:created',
      title: '✅ حجزك تم استقباله بنجاح!',
      message: `تم تأكيد حجزك ${booking.booking_number}. سيتم التواصل معك قريباً.`,
      payload: {
        bookingNumber: booking.booking_number,
        bookingId: booking.id,
        packageTitle: booking.package?.title,
        tripDate: booking.date_start,
        totalPrice: booking.total_price,
      },
      is_read: false,
      created_at: new Date(),
    };

    this.emitToUser(userId, 'notification:new', userNotification);

    // إخطار الـ admin بحجز جديد
    const adminNotification = {
      id: `notif-admin-${Date.now()}-${Math.random()}`,
      type: 'booking:admin-alert',
      title: '🔔 حجز جديد!',
      message: `حجز جديد: ${booking.booking_number} من المستخدم ${userId}`,
      payload: {
        bookingNumber: booking.booking_number,
        bookingId: booking.id,
        userId,
        totalPrice: booking.total_price,
        persons: booking.persons,
        createdAt: new Date(),
      },
      is_read: false,
      created_at: new Date(),
    };

    this.emitToAdmins('notification:new', adminNotification);
  }

  /**
   * عند تأكيد الحجز
   */
  notifyBookingConfirmed(booking: any, userId: string): void {
    this.emitToUser(userId, 'booking:confirmed', {
      type: 'booking_confirmed',
      bookingNumber: booking.booking_number,
      status: booking.status,
      message: 'تم تأكيد حجزك',
      timestamp: new Date(),
    });
  }

  /**
   * تذكير قبل الرحلة
   */
  notifyBookingReminder(booking: any, userId: string, daysUntilTrip: number): void {
    this.emitToUser(userId, 'booking:reminder', {
      type: 'booking_reminder',
      bookingNumber: booking.booking_number,
      daysUntilTrip,
      message: `رحلتك ستبدأ خلال ${daysUntilTrip} أيام`,
      tripDate: booking.date_start,
      timestamp: new Date(),
    });
  }

  /**
   * إخطار إلغاء الحجز
   */
  notifyBookingCancelled(booking: any, userId: string): void {
    this.emitToUser(userId, 'booking:cancelled', {
      type: 'booking_cancelled',
      bookingNumber: booking.booking_number,
      message: 'تم إلغاء الحجز',
      timestamp: new Date(),
    });

    // إخطار الـ admin أيضاً
    this.emitToAdmins('admin:booking-cancelled', {
      type: 'booking_cancelled',
      bookingNumber: booking.booking_number,
      userId,
      message: `تم إلغاء الحجز: ${booking.booking_number}`,
      timestamp: new Date(),
    });
  }

  /**
   * إغلاق الاتصال
   */
  close(): void {
    this.io.close();
  }

  /**
   * عند إرسال إشعار عام للمستخدم
   */
  notifyUserGeneral(userId: string, notification: any): void {
    this.emitToUser(userId, 'notification:new', {
      type: 'general',
      ...notification,
      timestamp: new Date(),
    });
  }

  /**
   * عند إرسال إشعار للـ admin
   */
  notifyAdminGeneral(notification: any): void {
    this.emitToAdmins('notification:new', {
      type: 'admin_alert',
      ...notification,
      timestamp: new Date(),
    });
  }

  /**
   * إرسال تحديث عداد الإشعارات
   */
  emitUnreadCountUpdate(userId: string, unreadCount: number): void {
    this.emitToUser(userId, 'notifications:unread-count', {
      unreadCount,
      timestamp: new Date(),
    });
  }

  /**
   * الحصول على Socket.IO instance
   */
  getIO(): Server {
    return this.io;
  }
}
