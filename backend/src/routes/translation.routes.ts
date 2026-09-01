import express, { Router, Request, Response } from 'express';
import { 
  translateText, 
  translateBatch, 
  translatePackageMultiLang,
  getCacheStats,
  clearCache,
  getSupportedLanguages
} from '../services/TranslationService';

const router = Router();

/**
 * ترجمة نص واحد
 * POST /api/translations/auto-translate
 * Body: { text, sourceLanguage, targetLanguage }
 */
router.post('/auto-translate', async (req: Request, res: Response) => {
  try {
    const { text, sourceLanguage = 'en', targetLanguage } = req.body;

    if (!text || !targetLanguage) {
      return res.status(400).json({
        success: false,
        message: 'Text and targetLanguage are required'
      });
    }

    const translatedText = await translateText(text, targetLanguage, sourceLanguage);

    res.json({
      success: true,
      data: {
        translated: translatedText
      },
      originalText: text,
      sourceLanguage,
      targetLanguage,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Translation endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Translation failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * ترجمة مجموعة نصوص دفعة واحدة
 * POST /api/translations/batch-translate
 * Body: { texts: [], sourceLanguage, targetLanguage }
 */
router.post('/batch-translate', async (req: Request, res: Response) => {
  try {
    const { texts, sourceLanguage = 'en', targetLanguage } = req.body;

    if (!Array.isArray(texts) || texts.length === 0 || !targetLanguage) {
      return res.status(400).json({
        success: false,
        message: 'Texts array and targetLanguage are required'
      });
    }

    if (texts.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 100 texts per batch'
      });
    }

    const translatedTexts = await translateBatch(texts, targetLanguage, sourceLanguage);

    res.json({
      success: true,
      data: {
        translations: translatedTexts.map(text => ({ translated: text }))
      },
      count: translatedTexts.length,
      sourceLanguage,
      targetLanguage,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Batch translation endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Batch translation failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * ترجمة رحلة/حزمة سياحية متعددة اللغات تلقائياً
 * POST /api/translations/translate-package
 * Body: { packageData: {id, name, description, ...}, fieldsToTranslate: [] }
 */
router.post('/translate-package', async (req: Request, res: Response) => {
  try {
    const { 
      packageData,
      fieldsToTranslate = ['name', 'description', 'itinerary', 'highlights', 'includes', 'excludes']
    } = req.body;

    if (!packageData || !packageData.id) {
      return res.status(400).json({
        success: false,
        message: 'Package data with id is required'
      });
    }

    if (fieldsToTranslate.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one field to translate is required'
      });
    }

    const translations = await translatePackageMultiLang(packageData, fieldsToTranslate);

    res.json({
      success: true,
      packageId: packageData.id,
      translations,
      fieldsTranslated: fieldsToTranslate,
      supportedLanguages: ['en', 'ar', 'es', 'de', 'ru'],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Package translation endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Package translation failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * الحصول على اللغات المدعومة
 * GET /api/translations/languages
 */
router.get('/languages', (req: Request, res: Response) => {
  try {
    const supportedLanguages = getSupportedLanguages();

    res.json({
      success: true,
      languages: supportedLanguages,
      count: supportedLanguages.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get languages',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * الحصول على إحصائيات الـ Cache
 * GET /api/translations/cache/stats
 */
router.get('/cache/stats', (req: Request, res: Response) => {
  try {
    const stats = getCacheStats();

    res.json({
      success: true,
      cache: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get cache stats',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * مسح الـ Cache
 * POST /api/translations/cache/clear
 */
router.post('/cache/clear', (req: Request, res: Response) => {
  try {
    clearCache();

    res.json({
      success: true,
      message: 'Translation cache cleared successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to clear cache',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * ترجمة كائن بيانات (Object)
 * POST /api/translations/translate-object
 * Body: { object, targetLanguage, fieldsToTranslate, sourceLanguage }
 */
router.post('/translate-object', async (req: Request, res: Response) => {
  try {
    const { 
      object,
      targetLanguage,
      fieldsToTranslate = [],
      sourceLanguage = 'en'
    } = req.body;

    if (!object || !targetLanguage) {
      return res.status(400).json({
        success: false,
        message: 'Object and targetLanguage are required'
      });
    }

    if (fieldsToTranslate.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one field to translate is required',
        data: { translated: object }
      });
    }

    // Translate specified fields in the object
    const translatedObject = { ...object };
    
    for (const field of fieldsToTranslate) {
      if (translatedObject[field] && typeof translatedObject[field] === 'string') {
        try {
          const translated = await translateText(
            translatedObject[field],
            targetLanguage,
            sourceLanguage
          );
          translatedObject[field] = translated;
        } catch (error) {
          console.error(`Failed to translate field ${field}:`, error);
          // Keep original value if translation fails
        }
      }
    }

    res.json({
      success: true,
      data: {
        translated: translatedObject,
        fieldsTranslated: fieldsToTranslate,
        targetLanguage,
        sourceLanguage
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Object translation endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Object translation failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * اختبار الترجمة
 * GET /api/translations/health
 */
router.get('/health', (req: Request, res: Response) => {
  try {
    const hasApiKey = !!process.env.GOOGLE_TRANSLATE_API_KEY;

    res.json({
      success: true,
      status: hasApiKey ? 'ready' : 'no_api_key',
      message: hasApiKey ? 'Translation service is ready' : 'Google Translate API key not configured',
      supportedLanguages: getSupportedLanguages().map(l => l.code),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
