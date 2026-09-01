/**
 * SEO Routes for Backend
 * Handles sitemap, robots.txt, and other SEO endpoints
 */

import express, { Router, Request, Response } from 'express';

const router = Router();

/**
 * Sitemap.xml - Main sitemap
 */
router.get('/sitemap.xml', (_req: Request, res: Response) => {
  const baseUrl = process.env.FRONTEND_URL || 'https://yourdomain.com';
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/search</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/packages</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/tours</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/contact</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/faq</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/blog</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/privacy-policy</loc>
    <changefreq>yearly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${baseUrl}/terms-of-service</loc>
    <changefreq>yearly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>`;

  res.header('Content-Type', 'application/xml; charset=utf-8');
  res.header('Cache-Control', 'public, max-age=3600');
  res.send(sitemap);
});

/**
 * Packages Sitemap
 */
router.get('/sitemap-packages.xml', async (_req: Request, res: Response) => {
  try {
    const baseUrl = process.env.FRONTEND_URL || 'https://yourdomain.com';
    
    // This would fetch from database in real implementation
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Example packages structure - replace with actual database query
    const packages = [];
    // const packages = await packageRepository.find();

    packages.forEach((pkg: any) => {
      const slug = pkg.name.toLowerCase().replace(/\s+/g, '-');
      sitemap += `
  <url>
    <loc>${baseUrl}/package/${slug}/${pkg.id}</loc>
    <lastmod>${new Date(pkg.updatedAt).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    sitemap += `
</urlset>`;

    res.header('Content-Type', 'application/xml; charset=utf-8');
    res.header('Cache-Control', 'public, max-age=3600');
    res.send(sitemap);
  } catch (error) {
    console.error('Error generating packages sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
});

/**
 * Robots.txt
 */
router.get('/robots.txt', (_req: Request, res: Response) => {
  const baseUrl = process.env.FRONTEND_URL || 'https://yourdomain.com';
  
  const robots = `User-agent: *
Allow: /

Disallow: /admin
Disallow: /dashboard
Disallow: /private
Disallow: /*.json$
Disallow: /*.pdf$

Allow: /packages
Allow: /tours
Allow: /search
Allow: /booking

# Crawl delay
Crawl-delay: 1

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml
Sitemap: ${baseUrl}/sitemap-packages.xml
Sitemap: ${baseUrl}/sitemap-tours.xml`;

  res.header('Content-Type', 'text/plain; charset=utf-8');
  res.header('Cache-Control', 'public, max-age=86400');
  res.send(robots);
});

/**
 * Ads.txt (for ad networks)
 */
router.get('/ads.txt', (_req: Request, res: Response) => {
  const ads = `# ads.txt - Authorized Digital Sellers
# Format: https://iabtechlab.com/ads-txt/

google.com, pub-xxxxxxxxxxxxxxxx, DIRECT, f08c47fec0942fa0`;

  res.header('Content-Type', 'text/plain; charset=utf-8');
  res.header('Cache-Control', 'public, max-age=86400');
  res.send(ads);
});

/**
 * Well-known security.txt
 */
router.get('/.well-known/security.txt', (_req: Request, res: Response) => {
  const security = `Contact: security@yourdomain.com
Expires: ${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()}
Preferred-Languages: en`;

  res.header('Content-Type', 'text/plain; charset=utf-8');
  res.send(security);
});

export default router;
