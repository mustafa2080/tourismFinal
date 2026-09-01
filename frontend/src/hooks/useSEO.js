/**
 * useSEO Hook - Easy SEO management in React components
 */

import { useEffect } from 'react';
import { seoService } from '../services/seoService';

export const useSEO = (config) => {
  useEffect(() => {
    const {
      title,
      description,
      keywords,
      image,
      url,
      type = 'website',
      breadcrumbs,
      packageData,
      faqs,
      language = 'en',
      articleData
    } = config;

    // Update page meta information
    if (title || description) {
      seoService.updatePageMeta({
        title,
        description,
        keywords,
        image,
        url,
        type
      });
    }

    // Set language
    if (language) {
      seoService.setLanguage(language);
    }

    // Add breadcrumbs if provided
    if (breadcrumbs && breadcrumbs.length > 0) {
      seoService.generateBreadcrumbs(breadcrumbs);
    }

    // Add package structured data if provided
    if (packageData) {
      seoService.generatePackageSchema(packageData);
    }

    // Add FAQ structured data if provided
    if (faqs && faqs.length > 0) {
      seoService.generateFAQSchema(faqs);
    }

    // Add article structured data if provided
    if (articleData) {
      seoService.generateArticleSchema(articleData);
    }

    // Track performance metrics
    window.addEventListener('load', () => {
      seoService.trackPerformanceMetrics();
    });

    return () => {
      window.removeEventListener('load', () => {
        seoService.trackPerformanceMetrics();
      });
    };
  }, [config]);
};

export default useSEO;
