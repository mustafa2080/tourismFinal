import { useState, useEffect, useCallback, useMemo } from 'react';
import { convertEGPtoUSD, formatPrice, getPriceInBothCurrencies } from '../services/currencyService';

/**
 * Custom hook for currency conversion
 * Provides EGP to USD conversion with caching
 */
export const useCurrencyConversion = () => {
  const [currency, setCurrency] = useState('USD'); // Default to USD
  const [converting, setConverting] = useState(false);
  const [conversionCache, setConversionCache] = useState({});

  // Load preferred currency from localStorage
  useEffect(() => {
    const preferred = localStorage.getItem('preferredCurrency');
    if (preferred) {
      setCurrency(preferred);
    }
  }, []);

  // Save preferred currency to localStorage
  const setPreferredCurrency = useCallback((curr) => {
    setCurrency(curr);
    localStorage.setItem('preferredCurrency', curr);
    console.log(`💱 Currency changed to: ${curr}`);
  }, []);

  // Convert single price
  const convertPrice = useCallback(async (amountEGP) => {
    if (currency === 'EGP') {
      return amountEGP;
    }

    // Check cache
    if (conversionCache[amountEGP]) {
      return conversionCache[amountEGP];
    }

    try {
      setConverting(true);
      const usdAmount = await convertEGPtoUSD(amountEGP);
      
      // Update cache
      setConversionCache(prev => ({
        ...prev,
        [amountEGP]: usdAmount
      }));

      return usdAmount;
    } catch (error) {
      console.error('Conversion error:', error);
      return amountEGP; // Return original if conversion fails
    } finally {
      setConverting(false);
    }
  }, [currency, conversionCache]);

  // Format price in current currency
  const formatCurrentPrice = useCallback((amountEGP) => {
    return formatPrice(amountEGP, currency);
  }, [currency]);

  // Get price display text based on current currency
  const getPriceDisplay = useCallback(async (amountEGP) => {
    if (currency === 'EGP') {
      return formatPrice(amountEGP, 'EGP');
    }

    const usdAmount = await convertPrice(amountEGP);
    return formatPrice(usdAmount, 'USD');
  }, [currency, convertPrice]);

  // Get both currencies
  const getBothCurrencies = useCallback(async (amountEGP) => {
    return await getPriceInBothCurrencies(amountEGP);
  }, []);

  // Toggle currency
  const toggleCurrency = useCallback(() => {
    const newCurrency = currency === 'USD' ? 'EGP' : 'USD';
    setPreferredCurrency(newCurrency);
  }, [currency, setPreferredCurrency]);

  return {
    currency,
    setPreferredCurrency,
    toggleCurrency,
    convertPrice,
    formatCurrentPrice,
    getPriceDisplay,
    getBothCurrencies,
    converting,
  };
};

export default useCurrencyConversion;
