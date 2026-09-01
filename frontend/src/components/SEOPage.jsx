/**
 * SEOPage Component
 * Wrapper component for SEO-optimized pages
 */

import { useEffect } from 'react';
import { seoService } from '../services/seoService';

export const SEOPage = ({
  title,
  description,
  keywords,
  image,
  url,
  children,
  breadcrumbs,
  type = 'website'
}) => {
  useEffect(() => {
    // Update page meta tags
    seoService.updatePageMeta({
      title,
      description,
      keywords,
      image,
      url: url || window.location.href,
      type
    });

    // Add breadcrumbs if provided
    if (breadcrumbs && breadcrumbs.length > 0) {
      seoService.generateBreadcrumbs(breadcrumbs);
    }

    // Scroll to top on page load
    window.scrollTo(0, 0);

  }, [title, description, keywords, image, url, breadcrumbs, type]);

  return children;
};

export default SEOPage;
