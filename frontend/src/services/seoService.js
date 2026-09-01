/**
 * SEO Service - Comprehensive SEO Management
 * Handles meta tags, structured data, canonical URLs, and more
 */

class SEOService {
  constructor() {
    this.defaultMeta = {
      title: 'Travel Packages & Tours Booking Platform | Book Your Next Adventure',
      description: 'Discover Amazing Travel Packages & Tours | Book Your Dream Vacation Today',
      keywords: 'tours, travel packages, vacation booking, travel deals',
      image: 'https://yourdomain.com/og-image.jpg',
      url: 'https://yourdomain.com',
      type: 'website'
    };
    this.domain = 'yourdomain.com'; // Change to your domain
  }

  /**
   * Update page title and meta description
   */
  updatePageMeta(data) {
    const {
      title = this.defaultMeta.title,
      description = this.defaultMeta.description,
      keywords,
      image = this.defaultMeta.image,
      url,
      type = 'website'
    } = data;

    // Update title
    document.title = title;

    // Update meta tags
    this.updateMetaTag('og:title', title);
    this.updateMetaTag('twitter:title', title);
    
    this.updateMetaTag('description', description);
    this.updateMetaTag('og:description', description);
    this.updateMetaTag('twitter:description', description);

    if (keywords) {
      this.updateMetaTag('keywords', keywords);
    }

    this.updateMetaTag('og:image', image);
    this.updateMetaTag('twitter:image', image);
    this.updateMetaTag('og:type', type);

    // Update canonical URL
    if (url) {
      this.updateCanonicalURL(url);
    }

    // Update Open Graph URL
    if (url) {
      this.updateMetaTag('og:url', url);
      this.updateMetaTag('twitter:url', url);
    }
  }

  /**
   * Update meta tag or create if doesn't exist
   */
  updateMetaTag(name, content) {
    let meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
    
    if (!meta) {
      meta = document.createElement('meta');
      const isProperty = name.startsWith('og:') || name.startsWith('twitter:');
      
      if (isProperty) {
        meta.setAttribute('property', name);
      } else {
        meta.setAttribute('name', name);
      }
      document.head.appendChild(meta);
    }
    
    meta.content = content;
  }

  /**
   * Update canonical URL
   */
  updateCanonicalURL(url) {
    let canonical = document.getElementById('canonical-link') || 
                   document.querySelector('link[rel="canonical"]');
    
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      canonical.id = 'canonical-link';
      document.head.appendChild(canonical);
    }
    
    canonical.href = url;
  }

  /**
   * Add structured data (JSON-LD)
   */
  addStructuredData(data, id = 'structured-data') {
    let script = document.getElementById(id);
    
    if (!script) {
      script = document.createElement('script');
      script.id = id;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    
    script.textContent = JSON.stringify(data);
  }

  /**
   * Generate breadcrumb structured data
   */
  generateBreadcrumbs(breadcrumbs) {
    const items = breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `https://${this.domain}${item.url}`
    }));

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": items
    };

    this.addStructuredData(breadcrumbSchema, 'breadcrumb-schema');
  }

  /**
   * Generate product/package structured data
   */
  generatePackageSchema(packageData) {
    const {
      name,
      description,
      price,
      currency = 'USD',
      rating,
      ratingCount,
      image,
      url,
      availability = 'InStock'
    } = packageData;

    const schema = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": name,
      "description": description,
      "image": image,
      "url": url,
      "price": price,
      "priceCurrency": currency,
      "availability": `https://schema.org/${availability}`,
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": rating || "4.5",
        "ratingCount": ratingCount || "100"
      }
    };

    this.addStructuredData(schema, `package-schema-${packageData.id}`);
  }

  /**
   * Generate FAQ structured data
   */
  generateFAQSchema(faqs) {
    const mainEntity = faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }));

    const schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": mainEntity
    };

    this.addStructuredData(schema, 'faq-schema');
  }

  /**
   * Update HTML lang attribute
   */
  setLanguage(lang) {
    document.documentElement.lang = lang;
  }

  /**
   * Generate SEO-friendly URLs
   */
  generateSEOFriendlyURL(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ''); // Remove hyphens from start and end
  }

  /**
   * Generate meta description
   */
  truncateDescription(text, maxLength = 160) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  /**
   * Add preload/prefetch hints
   */
  addResourceHints(urls, type = 'prefetch') {
    urls.forEach(url => {
      if (!document.querySelector(`link[href="${url}"][rel="${type}"]`)) {
        const link = document.createElement('link');
        link.rel = type;
        link.href = url;
        document.head.appendChild(link);
      }
    });
  }

  /**
   * Update keywords for current page
   */
  updateKeywords(keywords) {
    this.updateMetaTag('keywords', keywords.join(', '));
  }

  /**
   * Add alternate language links
   */
  addAlternateLanguageLinks(languages) {
    // Remove existing alternate links
    document.querySelectorAll('link[rel="alternate"]').forEach(link => link.remove());

    languages.forEach(lang => {
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.hrefLang = lang.code;
      link.href = `https://${this.domain}${lang.url}`;
      document.head.appendChild(link);
    });
  }

  /**
   * Generate article structured data
   */
  generateArticleSchema(articleData) {
    const {
      headline,
      description,
      image,
      datePublished,
      dateModified,
      author,
      url
    } = articleData;

    const schema = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": headline,
      "description": description,
      "image": image,
      "datePublished": datePublished,
      "dateModified": dateModified,
      "author": {
        "@type": "Person",
        "name": author
      },
      "url": url
    };

    this.addStructuredData(schema, `article-schema-${Date.now()}`);
  }

  /**
   * Track page performance metrics
   */
  trackPerformanceMetrics() {
    if (typeof window !== 'undefined' && window.performance) {
      const metrics = {
        pageLoadTime: window.performance.timing.loadEventEnd - window.performance.timing.navigationStart,
        domContentLoaded: window.performance.timing.domContentLoadedEventEnd - window.performance.timing.navigationStart,
        timeToFirstByte: window.performance.timing.responseStart - window.performance.timing.navigationStart
      };
      console.log('📊 Performance Metrics:', metrics);
      return metrics;
    }
  }

  /**
   * Generate robots meta for page
   */
  setRobotsConfig(config = {}) {
    const {
      index = true,
      follow = true,
      nosnippet = false,
      noarchive = false,
      noimageindex = false
    } = config;

    let robotsContent = [];
    if (index) robotsContent.push('index');
    else robotsContent.push('noindex');

    if (follow) robotsContent.push('follow');
    else robotsContent.push('nofollow');

    if (nosnippet) robotsContent.push('nosnippet');
    if (noarchive) robotsContent.push('noarchive');
    if (noimageindex) robotsContent.push('noimageindex');

    this.updateMetaTag('robots', robotsContent.join(', '));
  }
}

export const seoService = new SEOService();
