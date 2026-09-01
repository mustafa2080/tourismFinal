import { Repository } from 'typeorm';
import { Itinerary } from '../entities/Itinerary.js';
import { ItineraryRepository } from '../repositories/ItineraryRepository.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';

export class ItineraryService {
  private itineraryRepository: ItineraryRepository;

  constructor(itineraryRepo: Repository<Itinerary>) {
    this.itineraryRepository = new ItineraryRepository(itineraryRepo);
  }

  async getItinerariesByPackage(packageId: string): Promise<Itinerary[]> {
    const itineraries = await this.itineraryRepository.findByPackageId(packageId);
    if (!itineraries || itineraries.length === 0) {
      return [];
    }
    return itineraries;
  }

  async getItineraryById(id: string): Promise<Itinerary> {
    const itinerary = await this.itineraryRepository.findById(id);
    if (!itinerary) {
      throw new NotFoundError('Itinerary day not found');
    }
    return itinerary;
  }

  async createItinerary(
    packageId: string,
    dayNumber: number,
    data: {
      title: string;
      description: string;
      image_url?: string;
      activities?: string;
      meals?: string;
    }
  ): Promise<Itinerary> {
    // Validate input
    if (!data.title || !data.description) {
      throw new ValidationError('Title and description are required');
    }

    if (dayNumber < 1) {
      throw new ValidationError('Day number must be at least 1');
    }

    // Check for duplicate day
    const existingDay = await this.itineraryRepository.findByDayNumber(packageId, dayNumber);
    if (existingDay) {
      throw new ValidationError(`Day ${dayNumber} already exists for this package`);
    }

    return this.itineraryRepository.create({
      package_id: packageId,
      day_number: dayNumber,
      ...data,
    });
  }

  async updateItinerary(
    id: string,
    data: Partial<{
      title: string;
      description: string;
      image_url?: string;
      activities?: string;
      meals?: string;
      // English translations
      en_title?: string;
      en_description?: string;
      en_activities?: string;
      en_meals?: string;
      // Arabic translations
      ar_title?: string;
      ar_description?: string;
      ar_activities?: string;
      ar_meals?: string;
      // Spanish translations
      es_title?: string;
      es_description?: string;
      es_activities?: string;
      es_meals?: string;
      // German translations
      de_title?: string;
      de_description?: string;
      de_activities?: string;
      de_meals?: string;
      // Russian translations
      ru_title?: string;
      ru_description?: string;
      ru_activities?: string;
      ru_meals?: string;
    }>
  ): Promise<Itinerary> {
    // Validate
    if (Object.keys(data).length === 0) {
      throw new ValidationError('No update data provided');
    }

    const updated = await this.itineraryRepository.update(id, data);
    if (!updated) {
      throw new NotFoundError('Itinerary day not found');
    }

    return updated;
  }

  async deleteItinerary(id: string): Promise<boolean> {
    const deleted = await this.itineraryRepository.delete(id);
    if (!deleted) {
      throw new NotFoundError('Itinerary day not found');
    }
    return true;
  }

  async upsertItinerary(
    packageId: string,
    dayNumber: number,
    data: Partial<Itinerary>
  ): Promise<Itinerary> {
    if (dayNumber < 1) {
      throw new ValidationError('Day number must be at least 1');
    }

    return this.itineraryRepository.updateOrCreate(packageId, dayNumber, data);
  }

  async deletePackageItineraries(packageId: string): Promise<boolean> {
    return this.itineraryRepository.deleteByPackageId(packageId);
  }
}
