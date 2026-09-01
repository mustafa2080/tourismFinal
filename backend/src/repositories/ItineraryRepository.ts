import { Repository } from 'typeorm';
import { Itinerary } from '../entities/Itinerary.js';

export class ItineraryRepository {
  constructor(private repository: Repository<Itinerary>) {}

  async findByPackageId(packageId: string): Promise<Itinerary[]> {
    // Use query builder with explicit ALL columns to ensure translations are included
    const itineraries = await this.repository
      .createQueryBuilder('itinerary')
      .addSelect('*')  // Select all columns
      .where('itinerary.package_id = :packageId', { packageId })
      .orderBy('itinerary.day_number', 'ASC')
      .getRawMany();
    
    // Map raw data back to Itinerary entities
    return itineraries.map(raw => this.mapRawToItinerary(raw));
  }

  async findById(id: string): Promise<Itinerary | null> {
    const itinerary = await this.repository
      .createQueryBuilder('itinerary')
      .addSelect('*')  // Select all columns
      .where('itinerary.id = :id', { id })
      .getRawOne();
    
    if (!itinerary) return null;
    return this.mapRawToItinerary(itinerary);
  }

  async create(itinerary: Partial<Itinerary>): Promise<Itinerary> {
    const newItinerary = this.repository.create(itinerary);
    return this.repository.save(newItinerary);
  }

  async update(id: string, itinerary: Partial<Itinerary>): Promise<Itinerary | null> {
    await this.repository.update(id, itinerary);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async findByDayNumber(packageId: string, dayNumber: number): Promise<Itinerary | null> {
    const itinerary = await this.repository
      .createQueryBuilder('itinerary')
      .addSelect('*')  // Select all columns
      .where('itinerary.package_id = :packageId', { packageId })
      .andWhere('itinerary.day_number = :dayNumber', { dayNumber })
      .getRawOne();
    
    if (!itinerary) return null;
    return this.mapRawToItinerary(itinerary);
  }

  async findAllByPackageIdWithDetails(packageId: string): Promise<Itinerary[]> {
    const itineraries = await this.repository
      .createQueryBuilder('itinerary')
      .addSelect('*')  // Select all columns
      .where('itinerary.package_id = :packageId', { packageId })
      .orderBy('itinerary.day_number', 'ASC')
      .getRawMany();
    
    return itineraries.map(raw => this.mapRawToItinerary(raw));
  }

  async updateOrCreate(packageId: string, dayNumber: number, data: Partial<Itinerary>): Promise<Itinerary> {
    const existing = await this.findByDayNumber(packageId, dayNumber);
    
    if (existing) {
      return this.update(existing.id, data) as Promise<Itinerary>;
    }

    return this.create({
      ...data,
      package_id: packageId,
      day_number: dayNumber,
    });
  }

  async deleteByPackageId(packageId: string): Promise<boolean> {
    const result = await this.repository.delete({ package_id: packageId });
    return (result.affected ?? 0) > 0;
  }

  /**
   * Map raw database row to Itinerary entity
   * Ensures all translation columns are properly mapped
   */
  private mapRawToItinerary(raw: any): Itinerary {
    const itinerary = new Itinerary();
    
    // Base fields
    itinerary.id = raw.itinerary_id || raw.id;
    itinerary.package_id = raw.itinerary_package_id || raw.package_id;
    itinerary.day_number = raw.itinerary_day_number || raw.day_number;
    itinerary.title = raw.itinerary_title || raw.title;
    itinerary.description = raw.itinerary_description || raw.description;
    itinerary.image_url = raw.itinerary_image_url || raw.image_url;
    itinerary.activities = raw.itinerary_activities || raw.activities;
    itinerary.meals = raw.itinerary_meals || raw.meals;
    itinerary.created_at = raw.itinerary_created_at || raw.created_at;
    
    // English translations
    itinerary.en_title = raw.itinerary_en_title || raw.en_title;
    itinerary.en_description = raw.itinerary_en_description || raw.en_description;
    itinerary.en_activities = raw.itinerary_en_activities || raw.en_activities;
    itinerary.en_meals = raw.itinerary_en_meals || raw.en_meals;
    
    // Arabic translations
    itinerary.ar_title = raw.itinerary_ar_title || raw.ar_title;
    itinerary.ar_description = raw.itinerary_ar_description || raw.ar_description;
    itinerary.ar_activities = raw.itinerary_ar_activities || raw.ar_activities;
    itinerary.ar_meals = raw.itinerary_ar_meals || raw.ar_meals;
    
    // Spanish translations
    itinerary.es_title = raw.itinerary_es_title || raw.es_title;
    itinerary.es_description = raw.itinerary_es_description || raw.es_description;
    itinerary.es_activities = raw.itinerary_es_activities || raw.es_activities;
    itinerary.es_meals = raw.itinerary_es_meals || raw.es_meals;
    
    // German translations
    itinerary.de_title = raw.itinerary_de_title || raw.de_title;
    itinerary.de_description = raw.itinerary_de_description || raw.de_description;
    itinerary.de_activities = raw.itinerary_de_activities || raw.de_activities;
    itinerary.de_meals = raw.itinerary_de_meals || raw.de_meals;
    
    // Russian translations
    itinerary.ru_title = raw.itinerary_ru_title || raw.ru_title;
    itinerary.ru_description = raw.itinerary_ru_description || raw.ru_description;
    itinerary.ru_activities = raw.itinerary_ru_activities || raw.ru_activities;
    itinerary.ru_meals = raw.itinerary_ru_meals || raw.ru_meals;
    
    return itinerary;
  }
}
