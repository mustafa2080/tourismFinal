import { useContext } from 'react';
import { WishlistContext } from '../context/WishlistContext';

export const useWishlistContext = () => {
  const context = useContext(WishlistContext);
  
  if (!context) {
    throw new Error('useWishlistContext must be used within WishlistProvider');
  }
  
  return context;
};
