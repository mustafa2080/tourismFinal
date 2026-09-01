/**
 * Integration code for AdminController.createPackage
 * Add this to createPackage method after package creation
 * 
 * Location: src/controllers/AdminController.ts
 * After: const created = await pkgRepo.findOne({ where: { id: pkg.id }, ...
 * Before: res.status(201).json({ success: true, ...
 */

import { PackageTranslation } from '../entities/PackageTranslation.js';
import { PackageTranslationRepository } from '../repositories/PackageTranslationRepository.js';
import { AppDataSource } from '../config/connection.js';
import { Package } from '../entities/Package.js';

// Add this code after creating the package and before sending response

export async function integrateAutoTranslationOnCreate(
  pkg: Package,
  res: any,
  next: any
) {
  try {
    console.log(`\n🌐 [AUTO-TRANSLATION] Starting dynamic translation for package ${pkg.id}...`);

    const pkgTranslationRepo = AppDataSource.getRepository(PackageTranslation);
    const translationRepo = new PackageTranslationRepository(pkgTranslationRepo);

    // Trigger auto-translation in background (don't wait)
    try {
      console.log(`✅ [AUTO-TRANSLATION] Skipping dynamic translations (feature disabled)`);
    } catch (transError) {
      console.error(`⚠️ [AUTO-TRANSLATION] Error during auto-translation:`, transError);
      // Don't fail the request, just log the error
    }

    // Fetch complete package with translations for response
    const created = await AppDataSource.getRepository(Package).findOne({
      where: { id: pkg.id },
      relations: ['images', 'itineraries', 'categories', 'translations'],
    });

    // Transform images to ensure consistent format with base64
    const transformedCreated = {
      ...created,
      images: (created?.images || []).map(img => ({
        ...img,
        image_data: img.image_data ? (
          Buffer.isBuffer(img.image_data)
            ? img.image_data.toString('base64')
            : img.image_data
        ) : ''
      }))
    };

    return transformedCreated;
  } catch (error) {
    console.error(`❌ [AUTO-TRANSLATION] Critical error:`, error);
    throw error;
  }
}

// For updatePackage method - add after update
export async function integrateAutoTranslationOnUpdate(
  pkg: Package
) {
  try {
    console.log(`\n🌐 [AUTO-TRANSLATION] Updating translations for package ${pkg.id}...`);

    const pkgTranslationRepo = AppDataSource.getRepository(PackageTranslation);

    // Update translations
    console.log(`✅ [AUTO-TRANSLATION] Skipping update translations (feature disabled)`);
  } catch (error) {
    console.error(`⚠️ [AUTO-TRANSLATION] Error updating translations:`, error);
    // Don't fail the request
  }
}

// For deletePackage method - add before deletion
export async function integrateAutoTranslationOnDelete(
  packageId: string
) {
  try {
    console.log(`\n🌐 [AUTO-TRANSLATION] Deleting translations for package ${packageId}...`);

    const pkgTranslationRepo = AppDataSource.getRepository(PackageTranslation);

    // Delete translations
    console.log(`✅ [AUTO-TRANSLATION] Skipping delete translations (feature disabled)`);

  } catch (error) {
    console.error(`⚠️ [AUTO-TRANSLATION] Error deleting translations:`, error);
    // Don't fail the request
  }
}
