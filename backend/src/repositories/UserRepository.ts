import { Repository } from 'typeorm';
import { User } from '../entities/User.js';
import { BaseRepository } from './BaseRepository.js';

export class UserRepository extends BaseRepository<User> {
  constructor(repository: Repository<User>) {
    super(repository);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.repository.findOne({ where: { email } });
  }

  async findByPhone(phone: string): Promise<User | null> {
    return await this.repository.findOne({ where: { phone } });
  }

  async findAdmins(): Promise<User[]> {
    return await this.repository.find({ where: { role: 'admin' } });
  }

  async findVerifiedUsers(): Promise<User[]> {
    return await this.repository.find({ where: { is_verified: true } });
  }

  async updatePassword(userId: string, passwordHash: string): Promise<User | null> {
    await this.repository.update(userId, { password_hash: passwordHash });
    return await this.findById(userId);
  }

  async verifyUser(userId: string): Promise<User | null> {
    await this.repository.update(userId, {
      is_verified: true,
      verification_token: undefined as any,
    });
    return await this.findById(userId);
  }
}
