import { useContext } from 'react';
import { CartContext } from '../context/CartContext';

/**
 * Custom hook to use CartContext
 */
export const useCart = () => {
  const context = useContext(CartContext);
  
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  
  return context;
};

// Alias
export const useCartContext = useCart;
