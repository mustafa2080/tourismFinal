import { Repository, ObjectLiteral } from 'typeorm';

export class BaseRepository<T extends ObjectLiteral> {
  public repository: Repository<T>;

  constructor(repository: Repository<T>) {
    this.repository = repository;
  }

  async create(data: Partial<T>): Promise<T> {
    const entity = this.repository.create(data as any);
    return await this.repository.save(entity as any);
  }

  async findById(id: string): Promise<T | null> {
    return await this.repository.findOne({ where: { id } as any });
  }

  async findAll(): Promise<T[]> {
    return await this.repository.find();
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    await this.repository.update(id, data);
    return await this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected ? result.affected > 0 : false;
  }

  async findByIds(ids: string[]): Promise<T[]> {
    return await this.repository.find({
      where: { id: ids[0] } as any // TypeORM limitation - finds by id array
    } as any);
  }
}
