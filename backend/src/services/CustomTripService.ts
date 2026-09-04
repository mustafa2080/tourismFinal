/// <reference types="express" />
import { Repository } from 'typeorm';
import { CustomTripRequest } from '../entities/CustomTripRequest.js';
import { CustomTripItem } from '../entities/CustomTripItem.js';
import { CustomTripRequestRepository } from '../repositories/CustomTripRequestRepository.js';
import { ValidationError, NotFoundError } from '../utils/errors.js';
import { AppDataSource } from '../config/connection.js';
import { EmailService } from './EmailService.js';
import { NotificationService } from './NotificationService.js';

interface SubmitItemInput {
  item_type: 'activity' | 'hotel' | 'transport' | 'meal';
  name: string;
  description?: string;
  image?: string;
  quantity?: number;
  unit_price: number;
  day_number?: number;
}

interface SubmitRequestInput {
  user_id?: string;
  contact_name: string;
  contact_email: string;
  contact_phone?: string;
  destination: string;
  date_start: string;
  date_end: string;
  adults: number;
  children?: number;
  budget_tier?: 'budget' | 'mid_range' | 'luxury';
  pace?: 'relaxed' | 'standard' | 'packed';
  interests?: string[];
  special_requests?: string;
  items: SubmitItemInput[];
  display_currency?: 'USD' | 'EGP';
  display_total?: number;
}

export class CustomTripService {
  private repo: CustomTripRequestRepository;
  private emailService: EmailService;
  private notificationService: NotificationService;

  constructor(repository: Repository<CustomTripRequest>) {
    this.repo = new CustomTripRequestRepository(repository);
    this.emailService = new EmailService();
    this.notificationService = new NotificationService();
  }

  private generateRequestNumber(): string {
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `CT-${ts}-${rand}`;
  }

  private calculateNights(start: string, end: string): number {
    const s = new Date(start);
    const e = new Date(end);
    const diff = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(1, diff);
  }

  calculateEstimatedTotal(items: SubmitItemInput[], adults: number, nights: number): number {
    return items.reduce((sum, item) => {
      const qty = item.quantity || 1;
      return sum + item.unit_price * qty;
    }, 0);
  }

  async submitRequest(data: SubmitRequestInput): Promise<CustomTripRequest> {
    if (!data.contact_name || !data.contact_email) {
      throw new ValidationError('Contact name and email are required');
    }
    if (!data.destination) {
      throw new ValidationError('Destination is required');
    }
    if (!data.date_start || !data.date_end) {
      throw new ValidationError('Trip start and end dates are required');
    }
    if (new Date(data.date_end) <= new Date(data.date_start)) {
      throw new ValidationError('End date must be after start date');
    }
    if (!data.adults || data.adults < 1) {
      throw new ValidationError('At least one adult traveler is required');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.contact_email)) {
      throw new ValidationError('Invalid email address');
    }
    if (!data.items || data.items.length === 0) {
      throw new ValidationError('Please add at least one item to your trip');
    }

    const nights = this.calculateNights(data.date_start, data.date_end);
    const estimatedTotal = this.calculateEstimatedTotal(data.items, data.adults, nights);

    const requestRepo = this.repo.repository;
    const itemRepo = AppDataSource.getRepository(CustomTripItem);

    const entity = requestRepo.create({
      request_number: this.generateRequestNumber(),
      user_id: data.user_id,
      contact_name: data.contact_name,
      contact_email: data.contact_email,
      contact_phone: data.contact_phone,
      destination: data.destination,
      date_start: new Date(data.date_start) as any,
      date_end: new Date(data.date_end) as any,
      adults: data.adults,
      children: data.children || 0,
      budget_tier: data.budget_tier || 'mid_range',
      pace: data.pace || 'standard',
      interests: data.interests || [],
      special_requests: data.special_requests,
      estimated_total: estimatedTotal,
      display_currency: data.display_currency || 'USD',
      display_total: data.display_total,
      status: 'submitted',
    });

    const saved = await requestRepo.save(entity);

    const items = data.items.map(item =>
      itemRepo.create({
        request_id: saved.id,
        item_type: item.item_type,
        name: item.name,
        description: item.description,
        image: item.image,
        quantity: item.quantity || 1,
        unit_price: item.unit_price,
        day_number: item.day_number || 0,
      })
    );
    await itemRepo.save(items);

    // Notify admins (best-effort, never block the request)
    try {
      const adminUsers = await AppDataSource.getRepository('User').find({ where: { role: 'admin' } });
      for (const admin of adminUsers) {
        await this.notificationService.notifyAdmin(admin.id, {
          type: 'New Custom Trip Request',
          message: `${data.contact_name} requested a custom trip to ${data.destination} (${saved.request_number})`,
          actionUrl: `/admin/custom-trips/${saved.id}`,
          data: { requestId: saved.id, requestNumber: saved.request_number },
        });
      }
    } catch (error) {
      console.error('Failed to notify admins of new custom trip request:', error);
    }

    try {
      await this.emailService.sendGenericNotification(
        data.contact_email,
        'Your Custom Trip Request Was Received',
        `Hi ${data.contact_name}, we received your custom trip request (${saved.request_number}) to ${data.destination}. Our team will review it and get back to you with a tailored quote soon.`
      );
    } catch (error) {
      console.error('Failed to send custom trip confirmation email:', error);
    }

    return (await this.repo.findByIdWithItems(saved.id))!;
  }

  async getById(id: string): Promise<CustomTripRequest> {
    const request = await this.repo.findByIdWithItems(id);
    if (!request) throw new NotFoundError('Custom trip request not found');
    return request;
  }

  async getByUser(userId: string, limit = 20, offset = 0) {
    return await this.repo.findByUser(userId, limit, offset);
  }

  async getAll(limit = 20, offset = 0, status?: string) {
    return await this.repo.findAllPaginated(limit, offset, status);
  }

  async getStats() {
    return await this.repo.getStats();
  }

  async updateStatus(
    id: string,
    status: CustomTripRequest['status'],
    adminUserId?: string,
    adminNotes?: string
  ): Promise<CustomTripRequest> {
    const request = await this.repo.findByIdWithItems(id);
    if (!request) throw new NotFoundError('Custom trip request not found');

    const validStatuses = ['draft', 'submitted', 'reviewing', 'quoted', 'accepted', 'rejected', 'converted', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new ValidationError('Invalid status');
    }

    await this.repo.repository.update(id, {
      status,
      handled_by: adminUserId,
      admin_notes: adminNotes !== undefined ? adminNotes : request.admin_notes,
      responded_at: new Date(),
    });

    return await this.getById(id);
  }

  async sendQuote(
    id: string,
    quotedPrice: number,
    quoteMessage: string,
    adminUserId: string
  ): Promise<CustomTripRequest> {
    const request = await this.repo.findByIdWithItems(id);
    if (!request) throw new NotFoundError('Custom trip request not found');

    if (!quotedPrice || quotedPrice <= 0) {
      throw new ValidationError('A valid quoted price is required');
    }

    await this.repo.repository.update(id, {
      status: 'quoted',
      quoted_price: quotedPrice,
      quote_message: quoteMessage,
      handled_by: adminUserId,
      responded_at: new Date(),
    });

    try {
      await this.emailService.sendGenericNotification(
        request.contact_email,
        `Your Custom Trip Quote Is Ready - ${request.request_number}`,
        `Hi ${request.contact_name}, we've prepared a quote for your trip to ${request.destination}: $${quotedPrice.toFixed(2)}. ${quoteMessage || ''}`
      );
    } catch (error) {
      console.error('Failed to send quote email:', error);
    }

    if (request.user_id) {
      try {
        await this.notificationService.createNotification(
          request.user_id,
          'general',
          'Your Custom Trip Quote Is Ready 💰',
          `We prepared a quote of $${quotedPrice.toFixed(2)} for your trip to ${request.destination}.`,
          { requestId: id, requestNumber: request.request_number }
        );
      } catch (error) {
        console.error('Failed to notify user of quote:', error);
      }
    }

    return await this.getById(id);
  }

  async deleteRequest(id: string): Promise<void> {
    const request = await this.repo.findByIdWithItems(id);
    if (!request) throw new NotFoundError('Custom trip request not found');
    await this.repo.repository.delete(id);
  }
}
