import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import { CacheManager } from '../config/cache.js';

/**
 * Optimized WebSocket Service
 * Handles high-concurrency scenarios efficiently
 */

export class OptimizedWebSocketService {
  private io: Server;
  private connectionStats = {
    connected: 0,
    disconnected: 0,
    totalConnections: 0,
  };

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
            process.env.FRONTEND_URL,
          ].filter(Boolean);

          if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            console.warn(`⚠️ Socket.IO CORS rejected: ${origin}`);
            callback(null, false);
          }
        },
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
      // ⚡ PERFORMANCE OPTIMIZATIONS
      maxHttpBufferSize: 1e6, // 1MB max payload
      pingInterval: 25000, // Ping every 25 seconds
      pingTimeout: 5000, // Timeout if no pong in 5 seconds
      allowUpgrades: true,
      path: '/socket.io/',
    });

    // Monitor server stats
    this.setupMonitoring();
    this.setupNamespaces();
  }

  /**
   * Monitor WebSocket performance
   */
  private setupMonitoring(): void {
    setInterval(() => {
      const stats = {
        ...this.connectionStats,
        clientsConnected: this.io.engine.clientsCount,
        roomsActive: Object.keys(this.io.sockets.adapter.rooms || {}).length,
      };

      console.log(`📊 [WebSocket Stats]`, stats);

      // Store in cache for dashboard monitoring
      CacheManager.getInstance().set('websocket:stats', stats, 60).catch(() => {
        // Silent fail
      });
    }, 30000); // Every 30 seconds
  }

  /**
   * Setup optimized namespaces
   */
  private setupNamespaces(): void {
    const notificationsNamespace = this.io.of('/notifications');

    notificationsNamespace.on('connection', (socket: Socket) => {
      this.connectionStats.connected++;
      this.connectionStats.totalConnections++;

      console.log(`✅ Connected [${this.connectionStats.connected}]: ${socket.id}`);

      // Subscribe to user notifications
      socket.on('subscribe:user', (userId: string) => {
        if (!userId || typeof userId !== 'string') {
          return socket.disconnect();
        }

        socket.join(`user:${userId}`);
        socket.data.userId = userId;
        console.log(`📍 User ${userId} subscribed`);
      });

      // Subscribe to admin notifications
      socket.on('subscribe:admin', (adminId: string) => {
        if (!adminId) {
          return socket.disconnect();
        }

        socket.join('admin');
        socket.data.adminId = adminId;
        console.log(`👤 Admin ${adminId} subscribed`);
      });

      // Heartbeat to keep connection alive
      socket.on('ping', () => {
        socket.emit('pong', { timestamp: Date.now() });
      });

      socket.on('disconnect', () => {
        this.connectionStats.connected--;
        this.connectionStats.disconnected++;
        console.log(`❌ Disconnected: ${socket.id}`);
      });

      socket.on('error', (error: any) => {
        console.error(`❌ Socket error:`, error);
      });
    });
  }

  /**
   * Send notification to specific user
   */
  emitToUser(userId: string, eventName: string, data: any): void {
    this.io.of('/notifications').to(`user:${userId}`).emit(eventName, data);
  }

  /**
   * Send notification to all admins
   */
  emitToAdmins(eventName: string, data: any): void {
    this.io.of('/notifications').to('admin').emit(eventName, data);
  }

  /**
   * Broadcast to all users
   */
  emitToAll(eventName: string, data: any): void {
    this.io.of('/notifications').emit(eventName, data);
  }

  /**
   * Send notification in batches to prevent overload
   */
  async emitToManyUsers(
    userIds: string[],
    eventName: string,
    data: any,
    batchSize: number = 100
  ): Promise<void> {
    for (let i = 0; i < userIds.length; i += batchSize) {
      const batch = userIds.slice(i, i + batchSize);

      // Send batch concurrently
      await Promise.all(
        batch.map((userId) =>
          Promise.resolve(this.emitToUser(userId, eventName, data))
        )
      );

      // Small delay between batches
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  }

  /**
   * Notify new booking
   */
  notifyNewBooking(booking: any, userId: string): void {
    this.emitToUser(userId, 'booking:created', {
      type: 'booking_created',
      bookingNumber: booking.booking_number,
      message: 'Your booking has been received',
      timestamp: new Date(),
    });

    this.emitToAdmins('admin:new-booking', {
      type: 'new_booking',
      bookingNumber: booking.booking_number,
      userId,
      totalPrice: booking.total_price,
      timestamp: new Date(),
    });
  }

  /**
   * Close WebSocket
   */
  close(): void {
    this.io.close();
    console.log('✅ WebSocket server closed');
  }

  /**
   * Get IO instance
   */
  getIO(): Server {
    return this.io;
  }

  /**
   * Get connection stats
   */
  getStats() {
    return {
      ...this.connectionStats,
      clientsConnected: this.io.engine.clientsCount,
    };
  }
}
