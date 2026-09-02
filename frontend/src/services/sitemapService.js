/**
 * Sitemap Generation Service
 * يولد ملفات sitemap للـ SEO
 */

class SitemapService {
  constructor(domain = 'travluyo.com', baseUrl = `https://${domain}`) {
    this.domain = domain;
    this.baseUrl = baseUrl;
  }

  /**
   * Generate sitemap for packages
   */
  generatePackageSitemap(packages) {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    packages.forEach(pkg => {
      const slug = this.generateSlug(pkg.name);
      const url = `${this.baseUrl}/package/${slug}/${pkg.id}`;
      const date = new Date(pkg.updatedAt || pkg.createdAt).toISOString().split('T')[0];

      xml += '  <url>\n';
      xml += `    <loc>${this.escapeXml(url)}</loc>\n`;
      xml += `    <lastmod>${date}</lastmod>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.8</priority>\n';
      xml += '  </url>\n';
    });

    xml += '</urlset>';
    return xml;
  }

  /**
   * Generate main sitemap index
   */
  generateMainSitemap() {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    const mainPages = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/search', priority: '0.9', changefreq: 'weekly' },
      { url: '/packages', priority: '0.9', changefreq: 'weekly' },
      { url: '/tours', priority: '0.9', changefreq: 'weekly' },
      { url: '/about', priority: '0.7', changefreq: 'monthly' },
      { url: '/contact', priority: '0.7', changefreq: 'monthly' },
      { url: '/faq', priority: '0.7', changefreq: 'monthly' },
      { url: '/blog', priority: '0.8', changefreq: 'weekly' },
      { url: '/terms-of-service', priority: '0.5', changefreq: 'yearly' },
      { url: '/privacy-policy', priority: '0.5', changefreq: 'yearly' },
      { url: '/careers', priority: '0.6', changefreq: 'monthly' }
    ];

    mainPages.forEach(page => {
      xml += '  <url>\n';
      xml += `    <loc>${this.baseUrl}${page.url}</loc>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += '  </url>\n';
    });

    xml += '</urlset>';
    return xml;
  }

  /**
   * Generate sitemap index (for multiple sitemaps)
   */
  generateSitemapIndex() {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    const sitemaps = [
      '/sitemap-main.xml',
      '/sitemap-packages.xml',
      '/sitemap-tours.xml',
      '/sitemap-blog.xml'
    ];

    sitemaps.forEach(sitemap => {
      xml += '  <sitemap>\n';
      xml += `    <loc>${this.baseUrl}${sitemap}</loc>\n`;
      xml += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
      xml += '  </sitemap>\n';
    });

    xml += '</sitemapindex>';
    return xml;
  }

  /**
   * Generate slug from text
   */
  generateSlug(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Escape XML special characters
   */
  escapeXml(unsafe) {
    return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
      }
    });
  }

  /**
   * Download sitemap
   */
  downloadSitemap(content, filename = 'sitemap.xml') {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/xml;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
}

export const sitemapService = new SitemapService();
