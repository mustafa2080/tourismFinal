import { Router, Request, Response } from 'express';
import * as libreTranslateService from '../services/libreTranslateService';

const router = Router();

/**
 * POST /api/translations/translate
 * ترجمة نص واحد
 */
router.post('/translate', async (req: Request, res: Response) => {
  try {
    const { text, targetLanguage, sourceLanguage = 'auto' } = req.body;

    if (!text || !targetLanguage) {
      return res.status(400).json({
        success: false,
        error: 'Text and targetLanguage are required'
      });
    }

    const translation = await libreTranslateService.translateText(
      text,
      targetLanguage,
      sourceLanguage
    );

    res.json({
      success: true,
      data: {
        original: text,
        translated: translation,
        sourceLanguage,
        targetLanguage
      }
    });
  } catch (error: any) {
    console.warn('Translation warning:', error);
    // Don't return error - just return original text
    const { text } = req.body;
    res.json({
      success: true,
      data: {
        original: text,
        translated: text,
        sourceLanguage: req.body.sourceLanguage || 'auto',
        targetLanguage: req.body.targetLanguage
      }
    });
  }
});

/**
 * POST /api/translations/batch-translate
 * ترجمة دفعية
 */
router.post('/batch-translate', async (req: Request, res: Response) => {
  try {
    const { texts, targetLanguage, sourceLanguage = 'auto', maxBatchSize = 100 } = req.body;

    if (!Array.isArray(texts) || texts.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Texts array is required and must not be empty'
      });
    }

    if (!targetLanguage) {
      return res.status(400).json({
        success: false,
        error: 'TargetLanguage is required'
      });
    }

    const translations = await libreTranslateService.translateBatch(
      texts,
      targetLanguage,
      sourceLanguage,
      maxBatchSize
    );

    res.json({
      success: true,
      data: {
        count: translations.length,
        sourceLanguage,
        targetLanguage,
        translations: texts.map((text, idx) => ({
          original: text,
          translated: translations[idx]
        }))
      }
    });
  } catch (error: any) {
    console.warn('Batch translation warning:', error);
    // Return original texts on error
    const { texts, targetLanguage, sourceLanguage = 'auto' } = req.body;
    res.json({
      success: true,
      data: {
        count: texts.length,
        sourceLanguage,
        targetLanguage,
        translations: texts.map((text: string) => ({
          original: text,
          translated: text
        }))
      }
    });
  }
});

/**
 * POST /api/translations/translate-object
 * ترجمة كائن بيانات
 */
router.post('/translate-object', async (req: Request, res: Response) => {
  try {
    const { object, targetLanguage, fieldsToTranslate, sourceLanguage = 'auto' } = req.body;

    if (!object || !Array.isArray(fieldsToTranslate)) {
      return res.status(400).json({
        success: false,
        error: 'Object and fieldsToTranslate array are required'
      });
    }

    if (!targetLanguage) {
      return res.status(400).json({
        success: false,
        error: 'TargetLanguage is required'
      });
    }

    const translated = await libreTranslateService.translateObject(
      object,
      targetLanguage,
      fieldsToTranslate,
      sourceLanguage
    );

    res.json({
      success: true,
      data: {
        original: object,
        translated,
        fieldsTranslated: fieldsToTranslate,
        targetLanguage
      }
    });
  } catch (error: any) {
    console.warn('Object translation warning:', error);
    // Return original object on error
    res.json({
      success: true,
      data: {
        original: req.body.object,
        translated: req.body.object,
        fieldsTranslated: req.body.fieldsToTranslate,
        targetLanguage: req.body.targetLanguage
      }
    });
  }
});

/**
 * POST /api/translations/detect-language
 * اكتشاف اللغة
 */
router.post('/detect-language', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required'
      });
    }

    const detectedLanguage = await libreTranslateService.detectLanguage(text);

    res.json({
      success: true,
      data: {
        text: text.substring(0, 100),
        detectedLanguage
      }
    });
  } catch (error: any) {
    console.warn('Language detection warning:', error);
    // Default to 'en' on error
    res.json({
      success: true,
      data: {
        text: req.body.text.substring(0, 100),
        detectedLanguage: 'en'
      }
    });
  }
});

/**
 * GET /api/translations/cache/stats
 * الحصول على إحصائيات الـ Cache
 */
router.get('/cache/stats', (req: Request, res: Response) => {
  try {
    const stats = libreTranslateService.getCacheStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    console.error('Cache stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get cache stats'
    });
  }
});

/**
 * DELETE /api/translations/cache/clear
 * مسح الـ Cache بالكامل
 */
router.delete('/cache/clear', (req: Request, res: Response) => {
  try {
    const result = libreTranslateService.clearCache();

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Cache clear error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to clear cache'
    });
  }
});

/**
 * POST /api/translations/cache/clear-key
 * مسح مفتاح معين من الـ Cache
 */
router.post('/cache/clear-key', (req: Request, res: Response) => {
  try {
    const { text, sourceLang, targetLang } = req.body;

    if (!text || !sourceLang || !targetLang) {
      return res.status(400).json({
        success: false,
        error: 'Text, sourceLang, and targetLang are required'
      });
    }

    const result = libreTranslateService.clearCacheKey(text, sourceLang, targetLang);

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Cache key clear error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to clear cache key'
    });
  }
});

/**
 * GET /api/translations/languages
 * الحصول على قائمة اللغات المدعومة
 */
router.get('/languages', (req: Request, res: Response) => {
  try {
    const supportedLanguages = [
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
      { code: 'es', name: 'Spanish', nativeName: 'Español' },
      { code: 'de', name: 'German', nativeName: 'Deutsch' },
      { code: 'ru', name: 'Russian', nativeName: 'Русский' }
    ];

    res.json({
      success: true,
      data: supportedLanguages
    });
  } catch (error: any) {
    console.error('Languages fetch error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch languages'
    });
  }
});

export default router;
