/// <reference types="express" />
import { Repository } from 'typeorm';
import { ContactSubmission } from '../entities/ContactSubmission.js';
import { BaseRepository } from './BaseRepository.js';

export class ContactSubmissionRepository extends BaseRepository<ContactSubmission> {
  constructor(repository: Repository<ContactSubmission>) {
    super(repository);
  }

  /**
   * جلب جميع الرسائل (للـ admin)
   */
  async findAllPaginated(limit: number = 20, offset: number = 0): Promise<{ submissions: ContactSubmission[]; total: number }> {
    const [submissions, total] = await this.repository.findAndCount({
      order: { created_at: 'DESC' },
      take: limit,
      skip: offset,
    });
    return { submissions, total };
  }

  /**
   * جلب الرسائل حسب الـ status
   */
  async findByStatus(status: string, limit: number = 20, offset: number = 0): Promise<ContactSubmission[]> {
    return await this.repository.find({
      where: { status: status as any },
      order: { created_at: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * جلب رسالة بـ ID
   */
  async findById(id: string): Promise<ContactSubmission | null> {
    return await this.repository.findOne({
      where: { id },
    });
  }

  /**
   * إضافة رسالة تواصل جديدة
   */
  async create(data: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
  }): Promise<ContactSubmission> {
    const submission = this.repository.create({
      ...data,
      status: 'pending',
    });
    return await this.repository.save(submission);
  }

  /**
   * تحديث حالة الرسالة
   */
  async updateStatus(id: string, status: string, adminNotes?: string): Promise<ContactSubmission> {
    await this.repository.update(id, {
      status: status as any,
      admin_notes: adminNotes,
      responded_at: new Date(),
    });
    const submission = await this.findById(id);
    return submission!;
  }

  /**
   * عد الرسائل المعلقة
   */
  async countPending(): Promise<number> {
    return await this.repository.count({
      where: { status: 'pending' },
    });
  }

  /**
   * حذف رسالة
   */
  async deleteById(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
