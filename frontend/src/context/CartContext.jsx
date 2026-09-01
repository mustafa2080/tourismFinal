import { createContext, useState, useCallback } from 'react';

export const CartContext = createContext();

/**
 * Cart Context for multi-package booking
 * Optional: Can be used if customers want to book multiple packages at once
 */
export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Add package to cart
   */
  const addToCart = useCallback((packageData) => {
    setError(null);

    try {
      // Check if already in cart
      const exists = cartItems.some(item => item.packageId === packageData.id);
      if (exists) {
        setError('This package is already in cart');
        return false;
      }

      const cartItem = {
        cartItemId: `${packageData.id}-${Date.now()}`,
        packageId: packageData.id,
        packageName: packageData.name,
        basePrice: packageData.basePrice,
        duration: packageData.duration,
        numberOfPersons: 1,
        roomType: 'double',
        travelDate: null,
        addOns: [],
        specialRequests: '',
        totalPrice: packageData.basePrice,
        addedAt: new Date().toISOString()
      };

      setCartItems(prev => [...prev, cartItem]);
      return true;
    } catch (err) {
      setError(err.message || 'Failed to add to cart');
      return false;
    }
  }, [cartItems]);

  /**
   * Remove package from cart
   */
  const removeFromCart = useCallback((cartItemId) => {
    setError(null);

    try {
      setCartItems(prev => prev.filter(item => item.cartItemId !== cartItemId));
      return true;
    } catch (err) {
      setError(err.message || 'Failed to remove from cart');
      return false;
    }
  }, []);

  /**
   * Update cart item
   */
  const updateCartItem = useCallback((cartItemId, updates) => {
    setError(null);

    try {
      setCartItems(prev =>
        prev.map(item =>
          item.cartItemId === cartItemId
            ? { ...item, ...updates }
            : item
        )
      );
      return true;
    } catch (err) {
      setError(err.message || 'Failed to update cart');
      return false;
    }
  }, []);

  /**
   * Update item quantity/persons
   */
  const updateItemPersons = useCallback((cartItemId, numberOfPersons) => {
    if (numberOfPersons < 1 || numberOfPersons > 20) {
      setError('Number of persons must be between 1 and 20');
      return false;
    }

    return updateCartItem(cartItemId, { numberOfPersons });
  }, [updateCartItem]);

  /**
   * Update item room type
   */
  const updateItemRoomType = useCallback((cartItemId, roomType) => {
    const validTypes = ['single', 'double', 'triple'];
    if (!validTypes.includes(roomType)) {
      setError('Invalid room type');
      return false;
    }

    return updateCartItem(cartItemId, { roomType });
  }, [updateCartItem]);

  /**
   * Update item travel date
   */
  const updateItemTravelDate = useCallback((cartItemId, travelDate) => {
    return updateCartItem(cartItemId, { travelDate });
  }, [updateCartItem]);

  /**
   * Add item add-on
   */
  const addItemAddOn = useCallback((cartItemId, addOnId) => {
    setCartItems(prev =>
      prev.map(item => {
        if (item.cartItemId === cartItemId) {
          if (item.addOns.includes(addOnId)) {
            return item;
          }
          return { ...item, addOns: [...item.addOns, addOnId] };
        }
        return item;
      })
    );
  }, []);

  /**
   * Remove item add-on
   */
  const removeItemAddOn = useCallback((cartItemId, addOnId) => {
    setCartItems(prev =>
      prev.map(item => {
        if (item.cartItemId === cartItemId) {
          return { ...item, addOns: item.addOns.filter(a => a !== addOnId) };
        }
        return item;
      })
    );
  }, []);

  /**
   * Clear entire cart
   */
  const clearCart = useCallback(() => {
    setCartItems([]);
    setError(null);
  }, []);

  /**
   * Calculate total price for all items
   */
  const calculateTotalPrice = useCallback(() => {
    return cartItems.reduce((total, item) => total + (item.totalPrice || 0), 0);
  }, [cartItems]);

  /**
   * Get cart item by ID
   */
  const getCartItem = useCallback((cartItemId) => {
    return cartItems.find(item => item.cartItemId === cartItemId);
  }, [cartItems]);

  /**
   * Check if package is in cart
   */
  const isInCart = useCallback((packageId) => {
    return cartItems.some(item => item.packageId === packageId);
  }, [cartItems]);

  /**
   * Get cart summary
   */
  const getCartSummary = useCallback(() => {
    return {
      itemsCount: cartItems.length,
      totalItems: cartItems.reduce((sum, item) => sum + item.numberOfPersons, 0),
      totalPrice: calculateTotalPrice(),
      items: cartItems
    };
  }, [cartItems, calculateTotalPrice]);

  /**
   * Validate cart (all items have required fields)
   */
  const validateCart = useCallback(() => {
    const errors = [];

    cartItems.forEach((item, index) => {
      if (!item.travelDate) {
        errors.push(`Item ${index + 1}: Travel date is required`);
      }
      if (!item.numberOfPersons || item.numberOfPersons < 1) {
        errors.push(`Item ${index + 1}: Invalid number of persons`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [cartItems]);

  /**
   * Prepare cart for checkout
   */
  const prepareForCheckout = useCallback(() => {
    const validation = validateCart();
    
    if (!validation.isValid) {
      setError(validation.errors.join('; '));
      return null;
    }

    return {
      items: cartItems.map(item => ({
        packageId: item.packageId,
        numberOfPersons: item.numberOfPersons,
        roomType: item.roomType,
        travelDate: item.travelDate,
        addOns: item.addOns,
        specialRequests: item.specialRequests,
        totalPrice: item.totalPrice
      })),
      totalPrice: calculateTotalPrice()
    };
  }, [cartItems, validateCart, calculateTotalPrice]);

  const value = {
    // State
    cartItems,
    loading,
    error,
    isEmpty: cartItems.length === 0,
    itemsCount: cartItems.length,

    // Methods
    addToCart,
    removeFromCart,
    updateCartItem,
    updateItemPersons,
    updateItemRoomType,
    updateItemTravelDate,
    addItemAddOn,
    removeItemAddOn,
    clearCart,
    getCartItem,
    isInCart,

    // Getters
    getCartSummary: getCartSummary(),
    total: calculateTotalPrice(),
    
    // Checkout
    validateCart,
    prepareForCheckout
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}
