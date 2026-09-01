import { AppDataSource } from '../config/connection.js';
import { Booking } from '../entities/Booking.js';
import { User } from '../entities/User.js';

export class ReportsService {
  private bookingRepository = AppDataSource.getRepository(Booking);
  private userRepository = AppDataSource.getRepository(User);

  /**
   * Get revenue report with daily breakdown
   */
  async getRevenueReport(startDate: Date, endDate: Date) {
    try {
      console.log('💰 [ReportsService.getRevenueReport] START', {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      const bookings = await this.bookingRepository
        .createQueryBuilder('booking')
        .where('booking.created_at >= :startDate', { startDate })
        .andWhere('booking.created_at <= :endDate', { endDate })
        .andWhere('booking.status != :status', { status: 'cancelled' })
        .orderBy('booking.created_at', 'DESC')
        .getMany();

      console.log('📋 [ReportsService.getRevenueReport] Found bookings:', {
        count: bookings.length,
        statusCounts: {
          confirmed: bookings.filter(b => b.status === 'confirmed').length,
          completed: bookings.filter(b => b.status === 'completed').length,
          cancelled: bookings.filter(b => b.status === 'cancelled').length,
        },
        samplePrices: bookings.slice(0, 3).map(b => ({ id: b.id, price: b.total_price, status: b.status, created: b.created_at }))
      });

      // Calculate totals
      const totalRevenue = bookings.reduce((sum, b) => sum + (Number(b.total_price) || 0), 0);
      const totalBookings = bookings.length;
      const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

      console.log('💹 [ReportsService.getRevenueReport] Calculations:', {
        totalRevenue,
        totalBookings,
        averageBookingValue,
      });

      // Build daily revenue breakdown
      const dailyRevenue: Record<string, number> = {};
      bookings.forEach(booking => {
        const date = new Date(booking.created_at).toISOString().split('T')[0];
        if (!dailyRevenue[date]) {
          dailyRevenue[date] = 0;
        }
        dailyRevenue[date] += Number(booking.total_price) || 0;
      });

      // Calculate growth metrics
      const midpoint = new Date(startDate.getTime() + (endDate.getTime() - startDate.getTime()) / 2);
      const firstHalf = bookings.filter(b => new Date(b.created_at) < midpoint);
      const secondHalf = bookings.filter(b => new Date(b.created_at) >= midpoint);
      
      const firstHalfRevenue = firstHalf.reduce((sum, b) => sum + (Number(b.total_price) || 0), 0);
      const secondHalfRevenue = secondHalf.reduce((sum, b) => sum + (Number(b.total_price) || 0), 0);
      
      const growthRate = firstHalfRevenue > 0 
        ? ((secondHalfRevenue - firstHalfRevenue) / firstHalfRevenue) * 100 
        : 0;

      console.log('✅ [ReportsService.getRevenueReport] END - Returning:', {
        totalRevenue,
        totalBookings,
        averageBookingValue,
        dailyRevenueKeys: Object.keys(dailyRevenue),
      });

      return {
        period: { startDate, endDate },
        totalRevenue,
        totalBookings,
        averageBookingValue,
        dailyRevenue,
        growthRate: Math.round(growthRate),
      };
    } catch (error) {
      console.error('Error generating revenue report:', error);
      throw error;
    }
  }

  /**
   * Get top packages by bookings and revenue
   */
  async getTopPackages(limit: number = 10, startDate?: Date, endDate?: Date) {
    try {
      let query = this.bookingRepository
        .createQueryBuilder('booking')
        .leftJoinAndSelect('booking.package', 'package')
        .where('booking.status != :status', { status: 'cancelled' });

      if (startDate && endDate) {
        query = query
          .andWhere('booking.created_at >= :startDate', { startDate })
          .andWhere('booking.created_at <= :endDate', { endDate });
      }

      const bookings = await query.getMany();

      // Group by package
      const packageStats = new Map<string, any>();
      
      bookings.forEach(booking => {
        if (!booking.package_id) return;
        
        if (!packageStats.has(booking.package_id)) {
          packageStats.set(booking.package_id, {
            packageId: booking.package_id,
            packageName: booking.package?.title || 'Unknown',
            bookingCount: 0,
            revenue: 0,
            avgRating: 0,
          });
        }
        
        const stats = packageStats.get(booking.package_id);
        stats.bookingCount += 1;
        stats.revenue += Number(booking.total_price) || 0;
      });

      // Sort and limit
      const topPackages = Array.from(packageStats.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, limit)
        .map(pkg => ({
          ...pkg,
          revenue: Math.round(pkg.revenue),
        }));

      return topPackages;
    } catch (error) {
      console.error('Error generating top packages report:', error);
      throw error;
    }
  }

  /**
   * Get booking statistics by status
   */
  async getBookingStats() {
    try {
      const statuses = ['pending', 'confirmed', 'completed', 'cancelled'];
      const stats: Record<string, number> = {};

      for (const status of statuses) {
        const count = await this.bookingRepository
          .createQueryBuilder('booking')
          .where('booking.status = :status', { status })
          .getCount();
        stats[status] = count;
      }

      const total = Object.values(stats).reduce((sum, val) => sum + val, 0);

      return {
        ...stats,
        total,
        completionRate: total > 0 ? Math.round((stats.completed / total) * 100) : 0,
        cancellationRate: total > 0 ? Math.round((stats.cancelled / total) * 100) : 0,
      };
    } catch (error) {
      console.error('Error generating booking stats:', error);
      throw error;
    }
  }

  /**
   * Get customer statistics
   */
  async getCustomerStats() {
    try {
      const totalCustomers = await this.userRepository
        .createQueryBuilder('user')
        .where('user.role = :role', { role: 'customer' })
        .getCount();

      const customersWithBookings = await this.bookingRepository
        .createQueryBuilder('booking')
        .select('COUNT(DISTINCT booking.user_id)', 'count')
        .getRawOne();

      const newCustomersThisMonth = await this.userRepository
        .createQueryBuilder('user')
        .where('user.role = :role', { role: 'customer' })
        .andWhere('user.created_at >= :date', {
          date: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        })
        .getCount();

      const returnCustomersResult = await this.bookingRepository
        .createQueryBuilder('booking')
        .select('booking.user_id', 'user_id')
        .addSelect('COUNT(*)', 'bookingCount')
        .groupBy('booking.user_id')
        .having('COUNT(*) > 1')
        .getRawMany();

      return {
        totalCustomers,
        customersWithBookings: customersWithBookings?.count || 0,
        newCustomersThisMonth,
        returnCustomersCount: returnCustomersResult.length,
        returnRate: totalCustomers > 0 
          ? Math.round((returnCustomersResult.length / totalCustomers) * 100) 
          : 0,
      };
    } catch (error) {
      console.error('Error generating customer stats:', error);
      throw error;
    }
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(startDate: Date, endDate: Date) {
    try {
      const bookings = await this.bookingRepository
        .createQueryBuilder('booking')
        .where('booking.created_at >= :startDate', { startDate })
        .andWhere('booking.created_at <= :endDate', { endDate })
        .getMany();

      const revenue = bookings
        .filter(b => b.status !== 'cancelled')
        .reduce((sum, b) => sum + (Number(b.total_price) || 0), 0);

      const occupancy = {
        total: bookings.length,
        completed: bookings.filter(b => b.status === 'completed').length,
        cancelled: bookings.filter(b => b.status === 'cancelled').length,
        confirmed: bookings.filter(b => b.status === 'confirmed').length,
      };

      return {
        period: { startDate, endDate },
        revenue,
        occupancy,
        successRate: occupancy.total > 0 
          ? Math.round(((occupancy.completed) / occupancy.total) * 100) 
          : 0,
      };
    } catch (error) {
      console.error('Error generating performance metrics:', error);
      throw error;
    }
  }

  /**
   * Get monthly revenue trends
   */
  async getMonthlyTrends(months: number = 6) {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);

      const bookings = await this.bookingRepository
        .createQueryBuilder('booking')
        .where('booking.created_at >= :startDate', { startDate })
        .andWhere('booking.created_at <= :endDate', { endDate })
        .andWhere('booking.status != :status', { status: 'cancelled' })
        .getMany();

      // Group by month
      const monthlyData: Record<string, any> = {};
      
      bookings.forEach(booking => {
        const date = new Date(booking.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = {
            month: monthKey,
            bookings: 0,
            revenue: 0,
          };
        }
        
        monthlyData[monthKey].bookings += 1;
        monthlyData[monthKey].revenue += Number(booking.total_price) || 0;
      });

      return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
    } catch (error) {
      console.error('Error generating monthly trends:', error);
      throw error;
    }
  }
}
