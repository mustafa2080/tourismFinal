/**
 * One-off seed: populates the new regions / region_destinations tables
 * with the same continents that were previously hardcoded in
 * PopularDestinationsSection.jsx, so the homepage looks identical
 * right after the dynamic switch. Safe to re-run - skips regions
 * whose slug already exists.
 */
import { AppDataSource } from '../../config/connection.js';
import { Region } from '../../entities/Region.js';
import { RegionDestination } from '../../entities/RegionDestination.js';

const SEED_REGIONS = [
  {
    slug: 'europe',
    name: 'Europe',
    image: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1200&q=80',
    countries: ['France', 'Italy', 'Spain', 'Greece', 'Portugal', 'Switzerland'],
  },
  {
    slug: 'africa',
    name: 'Africa',
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1200&q=80',
    countries: ['Egypt', 'Morocco', 'Kenya', 'Tanzania', 'South Africa', 'Namibia'],
  },
  {
    slug: 'asia',
    name: 'Asia',
    image: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=1200&q=80',
    countries: ['Japan', 'Thailand', 'Vietnam', 'Indonesia', 'China', 'Jordan'],
  },
  {
    slug: 'latin-america',
    name: 'Latin America',
    image: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=1200&q=80',
    countries: ['Peru', 'Brazil', 'Argentina', 'Chile', 'Colombia', 'Mexico'],
  },
  {
    slug: 'north-america',
    name: 'North America',
    image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1200&q=80',
    countries: ['USA', 'Canada', 'Alaska', 'Grand Canyon'],
  },
  {
    slug: 'oceania',
    name: 'Australia & Oceania',
    image: 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=1200&q=80',
    countries: ['Australia', 'New Zealand', 'Great Barrier Reef'],
  },
];

async function run() {
  await AppDataSource.initialize();
  const regionRepo = AppDataSource.getRepository(Region);
  const destRepo = AppDataSource.getRepository(RegionDestination);

  for (let i = 0; i < SEED_REGIONS.length; i++) {
    const seed = SEED_REGIONS[i];
    const existing = await regionRepo.findOne({ where: { slug: seed.slug } });

    if (existing) {
      console.log(`- skip "${seed.name}" (already exists)`);
      continue;
    }

    const region = await regionRepo.save(
      regionRepo.create({
        name: seed.name,
        slug: seed.slug,
        image: seed.image,
        is_active: true,
        sort_order: i,
      })
    );

    const destinations = seed.countries.map((name, idx) =>
      destRepo.create({ region_id: region.id, name, sort_order: idx })
    );
    await destRepo.save(destinations);

    console.log(`+ created "${seed.name}" with ${destinations.length} destinations`);
  }

  await AppDataSource.destroy();
  console.log('Done.');
}

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
