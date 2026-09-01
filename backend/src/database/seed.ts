import { AppDataSource } from '../config/connection.js';
import { passwordUtils } from '../utils/passwordUtils.js';
import { SettingsService } from '../services/SettingsService.js';
import { PackageImage } from '../entities/PackageImage.js';

async function seed() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    // Initialize default settings
    console.log('🔧 Initializing system settings...');
    const settingsService = new SettingsService();
    await settingsService.initializeDefaults();
    console.log('✅ System settings initialized');

    // Get repositories
    const userRepo = AppDataSource.getRepository('User');
    const categoryRepo = AppDataSource.getRepository('Category');
    const packageRepo = AppDataSource.getRepository('Package');
    const imageRepo = AppDataSource.getRepository(PackageImage);
    const itineraryRepo = AppDataSource.getRepository('Itinerary');

    // Hash the password
    const adminPassword = await passwordUtils.hashPassword('admin123456');
    const userPassword = await passwordUtils.hashPassword('user123456');

    // Create admin user
    const adminUser = userRepo.create({
      name: 'Admin User',
      email: 'admin@tour.com',
      phone: '+201000000000',
      password_hash: adminPassword,
      role: 'admin',
      is_verified: true,
    });
    await userRepo.save(adminUser);
    console.log('✅ Admin user created');
    console.log('   Email: admin@tour.com');
    console.log('   Password: admin123456');

    // Create test user
    const testUser = userRepo.create({
      name: 'Test User',
      email: 'user@tour.com',
      phone: '+201234567890',
      password_hash: userPassword,
      role: 'customer',
      is_verified: true,
    });
    await userRepo.save(testUser);
    console.log('✅ Test user created');
    console.log('   Email: user@tour.com');
    console.log('   Password: user123456');

    // Create categories
    const categories = [
      { name: 'Adventure', slug: 'adventure', description: 'Thrilling adventures' },
      { name: 'Family', slug: 'family', description: 'Family-friendly trips' },
      { name: 'Honeymoon', slug: 'honeymoon', description: 'Romantic getaways' },
      { name: 'Beach', slug: 'beach', description: 'Beach destinations' },
      { name: 'Mountain', slug: 'mountain', description: 'Mountain trekking' },
      { name: 'Trips in Cultures', slug: 'trips-in-cultures', description: 'Explore cultural trips around the world' },
    ];

    for (const cat of categories) {
      const category = categoryRepo.create(cat);
      await categoryRepo.save(category);
    }
    console.log('✅ Categories created');

    // Create sample packages
    const packages = [
      {
        title: 'Nile River Cruise',
        destination: 'Egypt',
        duration_days: 7,
        base_price: 1500,
        short_desc: 'Explore the beautiful Nile River',
        long_desc: 'A wonderful 7-day cruise down the Nile River visiting Cairo, Luxor, and Aswan.',
        featured: true,
      },
      {
        title: 'Paris Romance',
        destination: 'France',
        duration_days: 5,
        base_price: 2500,
        short_desc: 'Experience the city of love',
        long_desc: 'Romantic 5-day trip to Paris with visits to Eiffel Tower, Louvre, and Notre Dame.',
        featured: true,
      },
      {
        title: 'Tokyo Adventure',
        destination: 'Japan',
        duration_days: 10,
        base_price: 3000,
        short_desc: 'Discover modern Japan',
        long_desc: '10-day adventure in Tokyo, Kyoto, and Osaka experiencing Japanese culture.',
        featured: false,
      },
    ];

    for (const pkg of packages) {
      const package_obj = packageRepo.create(pkg);
      await packageRepo.save(package_obj);
      
      // أضف صور لكل package
      const imageUrls = [
        'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=600&h=400&fit=crop',
      ];
      
      for (let idx = 0; idx < imageUrls.length; idx++) {
        const image = imageRepo.create({
          package_id: package_obj.id,
          url: imageUrls[idx],
          alt_text: `${pkg.title} - Image ${idx + 1}`,
          order: idx,
        });
        await imageRepo.save(image);
      }

      // 📅 أضف itinerary للـ package
      const itineraries: any[] = [];
      if (pkg.title === 'Nile River Cruise') {
        itineraries.push(
          {
            package_id: package_obj.id,
            day_number: 1,
            title: 'Arrival in Cairo',
            description: 'Welcome to Egypt! You will be received at Cairo International Airport and transferred to your luxury hotel. Evening orientation tour of downtown Cairo.',
            activities: 'Airport transfer, Hotel check-in, Cairo orientation tour, Visit to Khan El-Khalili bazaar',
            meals: 'Dinner',
            image_url: 'https://images.unsplash.com/photo-1537959787776-bdfdb5c3f81f?w=600&h=400&fit=crop',
          },
          {
            package_id: package_obj.id,
            day_number: 2,
            title: 'Pyramids of Giza',
            description: 'Visit the iconic Pyramids of Giza, one of the seven wonders of the world. Explore the Great Pyramid, Khafre Pyramid, and the Sphinx.',
            activities: 'Full day Giza Pyramids tour, Sphinx photo session, Egyptian Museum visit, Camel riding optional',
            meals: 'Breakfast, Lunch, Dinner',
            image_url: 'https://images.unsplash.com/photo-1560093676-04071c5f467b?w=600&h=400&fit=crop',
          },
          {
            package_id: package_obj.id,
            day_number: 3,
            title: 'Nile Cruise Begins',
            description: 'Embark on your Nile cruise. Sail southbound with views of the Nile valley. Relax on deck and enjoy the sunset.',
            activities: 'Boarding the cruise ship, Welcome dinner, Sail on Nile, Sunset observation deck',
            meals: 'Breakfast, Lunch, Dinner',
            image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
          },
          {
            package_id: package_obj.id,
            day_number: 4,
            title: 'Luxor Temples',
            description: 'Visit the magnificent temples of Luxor. Explore the Karnak Temple Complex and Luxor Temple with an expert guide.',
            activities: 'Karnak Temple Complex tour, Luxor Temple visit, Light show, Shopping at Luxor bazaar',
            meals: 'Breakfast, Lunch, Dinner',
            image_url: 'https://images.unsplash.com/photo-1560033565-90e1ca57b975?w=600&h=400&fit=crop',
          },
          {
            package_id: package_obj.id,
            day_number: 5,
            title: 'Valley of the Kings',
            description: 'Discover the ancient tombs in the Valley of the Kings. Visit the tomb of Tutankhamun and other famous pharaohs.',
            activities: 'Valley of the Kings tour, Tomb of Tutankhamun, Mortuary Temple of Hatshepsut, Colossi of Memnon',
            meals: 'Breakfast, Lunch, Dinner',
            image_url: 'https://images.unsplash.com/photo-1562814453-9a11a67c0e6c?w=600&h=400&fit=crop',
          },
          {
            package_id: package_obj.id,
            day_number: 6,
            title: 'Aswan & Philae Temple',
            description: 'Reach Aswan and visit the beautiful Philae Temple. Enjoy a felucca sailboat ride on the Nile.',
            activities: 'Philae Temple boat trip, Felucca sailboat ride, Botanical Gardens, Nubian village visit',
            meals: 'Breakfast, Lunch, Dinner',
            image_url: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=600&h=400&fit=crop',
          },
          {
            package_id: package_obj.id,
            day_number: 7,
            title: 'Departure',
            description: 'Final morning in Aswan. Enjoy breakfast and transfer to the airport for your departure flight.',
            activities: 'Breakfast, Last-minute shopping, Airport transfer',
            meals: 'Breakfast',
            image_url: 'https://images.unsplash.com/photo-1488769235206-11d83b74037f?w=600&h=400&fit=crop',
          }
        );
      } else if (pkg.title === 'Paris Romance') {
        itineraries.push(
          {
            package_id: package_obj.id,
            day_number: 1,
            title: 'Welcome to Paris',
            description: 'Arrive in Paris and settle into your boutique hotel in the heart of the city. Evening stroll along the Seine.',
            activities: 'Airport transfer, Hotel check-in, Seine riverbank walk, Dinner cruise optional',
            meals: 'Dinner',
            image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&h=400&fit=crop',
          },
          {
            package_id: package_obj.id,
            day_number: 2,
            title: 'Eiffel Tower & Trocadero',
            description: 'Visit the iconic Eiffel Tower. Ascend to the top for panoramic views of Paris. Visit Trocadero for perfect photos.',
            activities: 'Eiffel Tower entrance and summit, Trocadero viewpoint, Champ de Mars picnic, Street artist watching',
            meals: 'Breakfast, Lunch, Dinner',
            image_url: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=600&h=400&fit=crop',
          },
          {
            package_id: package_obj.id,
            day_number: 3,
            title: 'Louvre & Art Museums',
            description: 'Explore the world-famous Louvre Museum. See the Mona Lisa, Venus de Milo, and other masterpieces.',
            activities: 'Louvre Museum guided tour, Musée d\'Orsay visit, Art appreciation, Café Marly lunch',
            meals: 'Breakfast, Lunch, Dinner',
            image_url: 'https://images.unsplash.com/photo-1499667886212-04bbad00a773?w=600&h=400&fit=crop',
          },
          {
            package_id: package_obj.id,
            day_number: 4,
            title: 'Notre-Dame & Montmartre',
            description: 'Visit the magnificent Notre-Dame Cathedral and explore the artistic neighborhood of Montmartre.',
            activities: 'Notre-Dame Cathedral tour, Sacré-Cœur Basilica, Montmartre artist district, Moulin Rouge',
            meals: 'Breakfast, Lunch, Dinner',
            image_url: 'https://images.unsplash.com/photo-1516762714134-9ce04f2d7937?w=600&h=400&fit=crop',
          },
          {
            package_id: package_obj.id,
            day_number: 5,
            title: 'Palace of Versailles',
            description: 'Day trip to the stunning Palace of Versailles. Explore the magnificent gardens and opulent rooms.',
            activities: 'Versailles Palace tour, Hall of Mirrors, Garden stroll, Marie Antoinette\'s estate',
            meals: 'Breakfast, Lunch, Dinner',
            image_url: 'https://images.unsplash.com/photo-1516762714134-9ce04f2d7937?w=600&h=400&fit=crop',
          }
        );
      } else if (pkg.title === 'Tokyo Adventure') {
        itineraries.push(
          {
            package_id: package_obj.id,
            day_number: 1,
            title: 'Arrival in Tokyo',
            description: 'Welcome to Tokyo! Transferred to hotel in Shinjuku. Evening exploration of neon-lit streets.',
            activities: 'Airport transfer, Hotel check-in, Shinjuku district exploration, Karaoke experience',
            meals: 'Dinner',
            image_url: 'https://images.unsplash.com/photo-1540959375944-7049f642e9b1?w=600&h=400&fit=crop',
          },
          {
            package_id: package_obj.id,
            day_number: 2,
            title: 'Tokyo Highlights',
            description: 'Explore Tokyo\'s modern attractions. Visit Senso-ji Temple, Akihabara, and Shibuya Crossing.',
            activities: 'Senso-ji Temple, Akihabara electronics district, Shibuya Crossing, Tokyo Skytree optional',
            meals: 'Breakfast, Lunch, Dinner',
            image_url: 'https://images.unsplash.com/photo-1549144611-0a9a1e45f8dc?w=600&h=400&fit=crop',
          },
          {
            package_id: package_obj.id,
            day_number: 3,
            title: 'Mt. Fuji Day Trip',
            description: 'Day trip to Mt. Fuji. Visit Lake Kawaguchi and enjoy views of Japan\'s iconic mountain.',
            activities: 'Mt. Fuji viewpoint, Lake Kawaguchi cruise, Chureito Pagoda, Hot spring bath',
            meals: 'Breakfast, Lunch, Dinner',
            image_url: 'https://images.unsplash.com/photo-1522383507545-d2c3201371e7?w=600&h=400&fit=crop',
          },
          {
            package_id: package_obj.id,
            day_number: 4,
            title: 'Kyoto Traditional',
            description: 'Travel to Kyoto. Experience traditional Japanese culture, temples, and gardens.',
            activities: 'Fushimi Inari Shrine torii gates, Arashiyama Bamboo Grove, Kiyomizu-dera Temple, Geisha district',
            meals: 'Breakfast, Lunch, Dinner',
            image_url: 'https://images.unsplash.com/photo-1537971614881-f37fb016a6ba?w=600&h=400&fit=crop',
          }
        );
      }

      // Save itineraries
      for (const itinerary of itineraries) {
        const itinerary_obj = itineraryRepo.create(itinerary);
        await itineraryRepo.save(itinerary_obj);
      }
    }
    console.log('✅ Sample packages with images and itineraries created');

    console.log('🎉 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();