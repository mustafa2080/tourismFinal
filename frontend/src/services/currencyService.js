/**
 * Currency Conversion Service
 * Handles EGP to USD conversion with caching
 * 
 * IMPORTANT: السعر المحفوظ في الـ Database هو سعر بالدولار بالفعل!
 * لا نحتاج لأي حسبة، نرجع السعر كما هو
 */

const EXCHANGE_RATE_KEY = 'currency_exchange_rates';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Default exchange rate (fallback)
const DEFAULT_RATES = {
  'EGP': 1,
  'USD': 0.032, // Approximate rate: 1 EGP = 0.032 USD
};

/**
 * Get current exchange rates
 * @returns {Promise<Object>} - Exchange rates object
 */
export const getExchangeRates = async () => {
  try {
    // Check cache first
    const cached = localStorage.getItem(EXCHANGE_RATE_KEY);
    if (cached) {
      const { rates, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        console.log('✅ Using cached exchange rates');
        return rates;
      }
    }

    // Try to fetch fresh rates from API
    try {
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/EGP');
      const data = await response.json();
      
      if (data && data.rates) {
        const rates = {
          EGP: 1,
          USD: data.rates.USD || DEFAULT_RATES.USD,
        };
        
        // Cache the rates
        localStorage.setItem(EXCHANGE_RATE_KEY, JSON.stringify({
          rates,
          timestamp: Date.now()
        }));
        
        console.log('✅ Fetched fresh exchange rates:', rates);
        return rates;
      }
    } catch (apiError) {
      console.warn('⚠️ Failed to fetch live rates, using default:', apiError.message);
    }

    // Fallback to default rates
    return DEFAULT_RATES;
  } catch (error) {
    console.warn('⚠️ Error getting exchange rates:', error);
    return DEFAULT_RATES;
  }
};

/**
 * Convert EGP to USD
 * FIXED: السعر المحفوظ في الـ Database هو سعر بالدولار بالفعل!
 * لذلك نرجعه كما هو بدون أي حسبة إضافية
 * @param {number} amount - Amount in USD (stored in database)
 * @returns {Promise<number>} - Amount in USD
 */
export const convertEGPtoUSD = async (amount) => {
  if (!amount || amount <= 0) return 0;
  
  // السعر المحفوظ هو بالدولار بالفعل، نرجعه كما هو
  return parseFloat(amount.toFixed(2));
};

/**
 * Convert multiple EGP amounts to USD
 * @param {Array<number>} amounts - Amounts in USD (already in database as USD)
 * @returns {Promise<Array<number>>} - Amounts in USD
 */
export const convertMultipleEGPtoUSD = async (amounts) => {
  if (!Array.isArray(amounts)) return [];
  
  // الأسعار موجودة بالدولار بالفعل
  return amounts.map(amount => {
    return parseFloat(amount.toFixed(2));
  });
};

/**
 * Format price for display
 * @param {number} amount - Amount in currency
 * @param {string} currency - Currency code (USD or EGP)
 * @returns {string} - Formatted price string
 */
export const formatPrice = (amount, currency = 'EGP') => {
  if (!amount && amount !== 0) return `${currency === 'USD' ? '$' : ''}0.00`;
  
  const num = parseFloat(amount);
  if (isNaN(num)) return `${currency === 'USD' ? '$' : ''}0.00`;
  
  if (currency === 'USD') {
    return `$${num.toFixed(2)}`;
  } else {
    return `${num.toFixed(2)} ${currency}`;
  }
};

/**
 * Format and convert price
 * @param {number} amountUSD - Amount in USD
 * @param {string} targetCurrency - Target currency (USD or EGP)
 * @returns {Promise<string>} - Formatted price string
 */
export const formatConvertedPrice = async (amountUSD, targetCurrency = 'USD') => {
  if (targetCurrency === 'EGP') {
    // TODO: إذا أردت تحويل من USD إلى EGP، أضف الحسبة هنا
    return formatPrice(amountUSD, 'USD');
  }
  
  // السعر موجود بالدولار بالفعل
  return formatPrice(amountUSD, 'USD');
};

/**
 * Get both EGP and USD prices
 * @param {number} amountUSD - Amount in USD
 * @returns {Promise<Object>} - Object with both prices
 */
export const getPriceInBothCurrencies = async (amountUSD) => {
  // السعر موجود بالدولار بالفعل
  return {
    egp: {
      raw: amountUSD,
      formatted: formatPrice(amountUSD, 'USD')
    },
    usd: {
      raw: amountUSD,
      formatted: formatPrice(amountUSD, 'USD')
    }
  };
};

/**
 * Clear cached exchange rates
 */
export const clearExchangeRateCache = () => {
  localStorage.removeItem(EXCHANGE_RATE_KEY);
  console.log('✅ Exchange rate cache cleared');
};

export default {
  getExchangeRates,
  convertEGPtoUSD,
  convertMultipleEGPtoUSD,
  formatPrice,
  formatConvertedPrice,
  getPriceInBothCurrencies,
  clearExchangeRateCache,
};