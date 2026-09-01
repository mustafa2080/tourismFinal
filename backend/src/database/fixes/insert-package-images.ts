import { AppDataSource } from '../../config/connection.js';
import { Package } from '../../entities/Package.js';
import { PackageImage } from '../../entities/PackageImage.js';

async function insertPackageImages() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const packageRepo = AppDataSource.getRepository(Package);
    const imageRepo = AppDataSource.getRepository(PackageImage);

    // جلب جميع الـ packages
    const packages = await packageRepo.find();
    console.log(`📦 Found ${packages.length} packages`);

    if (packages.length === 0) {
      console.log('⚠️ No packages found. Please create packages first.');
      process.exit(1);
    }

    // إضافة صور لكل package
    let imageCount = 0;
    for (const pkg of packages) {
      // تحقق من وجود صور
      const existingImages = await imageRepo.find({
        where: { package_id: pkg.id }
      });

      if (existingImages.length > 0) {
        console.log(`⏭️ Package "${pkg.title}" already has ${existingImages.length} images, skipping...`);
        continue;
      }

      // إضافة 3 صور لكل package
      const imageUrls = [
        `https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=400&fit=crop`, // Travel
        `https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&h=400&fit=crop`, // Beach
        `https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=600&h=400&fit=crop`, // Mountains
      ];

      for (let idx = 0; idx < imageUrls.length; idx++) {
        const image = imageRepo.create({
          package_id: pkg.id,
          url: imageUrls[idx],
          alt_text: `${pkg.title} - Image ${idx + 1}`,
          order: idx,
        });
        await imageRepo.save(image);
        imageCount++;
        console.log(`   ✅ Added image ${idx + 1} for "${pkg.title}"`);
      }
    }

    console.log(`\n🎉 Successfully inserted ${imageCount} package images!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error inserting package images:', error);
    process.exit(1);
  }
}

insertPackageImages();
