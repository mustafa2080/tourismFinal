// src/controllers/StatsController.ts
import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/connection.js';
import { Booking } from '../entities/Booking.js';
import { User } from '../entities/User.js';

export class StatsController {
  /**
   * Get comprehensive dashboard statistics
   */
  async getDashboardStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const timeRange = (req.query.timeRange as string) || '30days';
      
      console.log('📊 [StatsController.getDashboardStats] Fetching stats for:', timeRange);

      const bookingRepo = AppDataSource.getRepository(Booking);
      const userRepo = AppDataSource.getRepository(User);

      // Calculate date range
      const { startDate, endDate } = this.getDateRange(timeRange);

      // Get total stats
      const totalRevenue = await bookingRepo
        .createQueryBuilder('booking')
        .select('SUM(booking.total_price)', 'total')
        .where('booking.status IN (:...statuses)', { statuses: ['confirmed', 'completed'] })
        .getRawOne();

      const totalBookings = await bookingRepo
        .createQueryBuilder('booking')
        .select('COUNT(booking.id)', 'count')
        .where('booking.created_at >= :startDate', { startDate })
        .getRawOne();

      const bookingsByStatus = await bookingRepo
        .createQueryBuilder('booking')
        .select('booking.status', 'status')
        .addSelect('COUNT(booking.id)', 'count')
        .groupBy('booking.status')
        .getRawMany();

      const totalUsers = await userRepo.count();

      const newUsersThisMonth = await userRepo
        .createQueryBuilder('user')
        .where('user.created_at >= :startDate', { startDate })
        .getCount();

      const conversionRate = await this.calculateConversionRate(bookingRepo, startDate, endDate);

      const avgOrderValue = totalRevenue?.total && totalBookings?.count 
        ? (parseFloat(totalRevenue.total) / parseInt(totalBookings.count)).toFixed(2)
        : 0;

      // Growth calculations
      const previousPeriodRevenue = await this.getPreviousPeriodRevenue(bookingRepo, timeRange, startDate);
      const revenueGrowth = this.calculateGrowth(parseFloat(totalRevenue?.total || 0), previousPeriodRevenue);

      const previousPeriodBookings = await this.getPreviousPeriodBookings(bookingRepo, timeRange, startDate);
      const bookingGrowth = this.calculateGrowth(parseInt(totalBookings?.count || 0), previousPeriodBookings);

      const previousPeriodUsers = await this.getPreviousPeriodUsers(userRepo, timeRange, startDate);
      const userGrowth = this.calculateGrowth(totalUsers, previousPeriodUsers);

      const stats = {
        totalRevenue: parseFloat(totalRevenue?.total || 0),
        totalBookings: parseInt(totalBookings?.count || 0),
        activeUsers: totalUsers,
        newUsersThisMonth,
        conversionRate: parseFloat(conversionRate),
        avgOrderValue: parseFloat(avgOrderValue as string),
        revenueGrowth: parseFloat(revenueGrowth.toFixed(2)),
        bookingGrowth: parseFloat(bookingGrowth.toFixed(2)),
        userGrowth: parseFloat(userGrowth.toFixed(2)),
        bookingsByStatus: this.transformBookingsByStatus(bookingsByStatus),
      };

      console.log('✅ [StatsController.getDashboardStats] Stats retrieved:', {
        revenue: stats.totalRevenue,
        bookings: stats.totalBookings,
        users: stats.activeUsers,
      });

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('❌ [StatsController.getDashboardStats] Error:', error);
      next(error);
    }
  }

  /**
   * Get revenue trend data for charts
   */
  async getRevenueTrend(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const timeRange = (req.query.timeRange as string) || '30days';
      
      console.log('📈 [StatsController.getRevenueTrend] Generating trend for:', timeRange);

      const bookingRepo = AppDataSource.getRepository(Booking);
      const { startDate, endDate, days } = this.getDateRange(timeRange);

      const trendData = [];

      for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const dailyRevenue = await bookingRepo
          .createQueryBuilder('booking')
          .select('SUM(booking.total_price)', 'total')
          .where('booking.created_at >= :date', { date })
          .andWhere('booking.created_at < :nextDate', { nextDate })
          .andWhere('booking.status IN (:...statuses)', { statuses: ['confirmed', 'completed'] })
          .getRawOne();

        const dailyBookings = await bookingRepo
          .createQueryBuilder('booking')
          .select('COUNT(booking.id)', 'count')
          .where('booking.created_at >= :date', { date })
          .andWhere('booking.created_at < :nextDate', { nextDate })
          .getRawOne();

        trendData.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          revenue: parseFloat(dailyRevenue?.total || 0),
          bookings: parseInt(dailyBookings?.count || 0),
        });
      }

      res.status(200).json({
        success: true,
        data: trendData,
      });
    } catch (error) {
      console.error('❌ [StatsController.getRevenueTrend] Error:', error);
      next(error);
    }
  }

  /**
   * Get booking status distribution
   */
  async getBookingDistribution(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const bookingRepo = AppDataSource.getRepository(Booking);

      const distribution = await bookingRepo
        .createQueryBuilder('booking')
        .select('booking.status', 'status')
        .addSelect('COUNT(booking.id)', 'count')
        .groupBy('booking.status')
        .getRawMany();

      const colorMap: { [key: string]: string } = {
        confirmed: '#10b981',
        pending: '#f59e0b',
        completed: '#3b82f6',
        cancelled: '#ef4444',
      };

      const transformedData = distribution.map(item => ({
        status: item.status.charAt(0).toUpperCase() + item.status.slice(1),
        value: parseInt(item.count),
        color: colorMap[item.status] || '#6b7280',
      }));

      res.status(200).json({
        success: true,
        data: transformedData,
      });
    } catch (error) {
      console.error('❌ [StatsController.getBookingDistribution] Error:', error);
      next(error);
    }
  }

  /**
   * Get user growth data
   */
  async getUserGrowth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userRepo = AppDataSource.getRepository(User);
      const timeRange = (req.query.timeRange as string) || '30days';
      const { startDate, days } = this.getDateRange(timeRange);

      const growthData = [];

      for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);

        const userCount = await userRepo
          .createQueryBuilder('user')
          .where('user.created_at <= :date', { date })
          .getCount();

        growthData.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          users: userCount,
        });
      }

      res.status(200).json({
        success: true,
        data: growthData,
      });
    } catch (error) {
      console.error('❌ [StatsController.getUserGrowth] Error:', error);
      next(error);
    }
  }

  // ===== HELPERS =====

  private getDateRange(timeRange: string) {
    const endDate = new Date();
    const startDate = new Date();
    let days = 30;

    if (timeRange === '7days') {
      days = 7;
      startDate.setDate(endDate.getDate() - 7);
    } else if (timeRange === '30days') {
      days = 30;
      startDate.setDate(endDate.getDate() - 30);
    } else if (timeRange === '90days') {
      days = 90;
      startDate.setDate(endDate.getDate() - 90);
    }

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    return { startDate, endDate, days };
  }

  private async calculateConversionRate(bookingRepo: any, startDate: Date, endDate: Date): Promise<string> {
    const totalUsers = await AppDataSource.getRepository(User)
      .createQueryBuilder('user')
      .where('user.created_at >= :startDate', { startDate })
      .getCount();

    const bookingUsers = await bookingRepo
      .createQueryBuilder('booking')
      .select('COUNT(DISTINCT booking.user_id)', 'count')
      .where('booking.created_at >= :startDate', { startDate })
      .getRawOne();

    const bookersCount = parseInt(bookingUsers?.count || 0);

    if (totalUsers === 0) return '0';
    return ((bookersCount / totalUsers) * 100).toFixed(2);
  }

  private calculateGrowth(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  private async getPreviousPeriodRevenue(bookingRepo: any, timeRange: string, startDate: Date): Promise<number> {
    let previousStart = new Date(startDate);
    
    if (timeRange === '7days') {
      previousStart.setDate(previousStart.getDate() - 7);
    } else if (timeRange === '30days') {
      previousStart.setDate(previousStart.getDate() - 30);
    } else if (timeRange === '90days') {
      previousStart.setDate(previousStart.getDate() - 90);
    }

    const result = await bookingRepo
      .createQueryBuilder('booking')
      .select('SUM(booking.total_price)', 'total')
      .where('booking.created_at >= :startDate', { startDate: previousStart })
      .andWhere('booking.created_at < :endDate', { endDate: startDate })
      .andWhere('booking.status IN (:...statuses)', { statuses: ['confirmed', 'completed'] })
      .getRawOne();

    return parseFloat(result?.total || 0);
  }

  private async getPreviousPeriodBookings(bookingRepo: any, timeRange: string, startDate: Date): Promise<number> {
    let previousStart = new Date(startDate);
    
    if (timeRange === '7days') {
      previousStart.setDate(previousStart.getDate() - 7);
    } else if (timeRange === '30days') {
      previousStart.setDate(previousStart.getDate() - 30);
    } else if (timeRange === '90days') {
      previousStart.setDate(previousStart.getDate() - 90);
    }

    const result = await bookingRepo
      .createQueryBuilder('booking')
      .select('COUNT(booking.id)', 'count')
      .where('booking.created_at >= :startDate', { startDate: previousStart })
      .andWhere('booking.created_at < :endDate', { endDate: startDate })
      .getRawOne();

    return parseInt(result?.count || 0);
  }

  private async getPreviousPeriodUsers(userRepo: any, timeRange: string, startDate: Date): Promise<number> {
    let previousStart = new Date(startDate);
    
    if (timeRange === '7days') {
      previousStart.setDate(previousStart.getDate() - 7);
    } else if (timeRange === '30days') {
      previousStart.setDate(previousStart.getDate() - 30);
    } else if (timeRange === '90days') {
      previousStart.setDate(previousStart.getDate() - 90);
    }

    return await userRepo
      .createQueryBuilder('user')
      .where('user.created_at >= :startDate', { startDate: previousStart })
      .andWhere('user.created_at < :endDate', { endDate: startDate })
      .getCount();
  }

  private transformBookingsByStatus(data: any[]) {
    const statusMap: { [key: string]: string } = {
      confirmed: 'Confirmed',
      pending: 'Pending',
      completed: 'Completed',
      cancelled: 'Cancelled',
    };

    return data.map(item => ({
      status: statusMap[item.status] || item.status,
      count: parseInt(item.count),
    }));
  }
}
