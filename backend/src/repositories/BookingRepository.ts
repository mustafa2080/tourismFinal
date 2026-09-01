import { Repository } from 'typeorm';
import { Booking } from '../entities/Booking.js';
import { BaseRepository } from './BaseRepository.js';

export class BookingRepository extends BaseRepository<Booking> {
  constructor(repository: Repository<Booking>) {
    super(repository);
  }

  async findByBookingNumber(bookingNumber: string): Promise<Booking | null> {
    return await this.repository.findOne({
      where: { booking_number: bookingNumber },
      relations: ['user', 'package', 'extras'],
    });
  }

  async findUserBookings(userId: string): Promise<Booking[]> {
    return await this.repository.find({
      where: { user_id: userId },
      relations: ['package', 'extras'],
      order: { created_at: 'DESC' },
    });
  }

  async findUpcomingBookings(daysAhead: number): Promise<Booking[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return await this.repository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.user', 'user')
      .leftJoinAndSelect('booking.package', 'package')
      .where('booking.date_start <= :futureDate', { futureDate })
      .andWhere('booking.date_start >= :today', { today: new Date() })
      .andWhere('booking.status = :status', { status: 'confirmed' })
      .orderBy('booking.date_start', 'ASC')
      .getMany();
  }

  async findByStatus(status: string): Promise<Booking[]> {
    return await this.repository.find({
      where: { status: status as 'confirmed' | 'completed' | 'cancelled' },
      relations: ['user', 'package'],
      order: { created_at: 'DESC' },
    });
  }

  async countByPackage(packageId: string): Promise<number> {
    return await this.repository.count({
      where: { package_id: packageId },
    });
  }

  async findPackageBookingsInDateRange(
    packageId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Booking[]> {
    return await this.repository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.user', 'user')
      .where('booking.package_id = :packageId', { packageId })
      .andWhere('booking.date_start BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .andWhere('booking.status != :status', { status: 'cancelled' })
      .orderBy('booking.date_start', 'ASC')
      .getMany();
  }
}
