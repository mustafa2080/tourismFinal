/**
 * Safe Socket Event Handler Utility
 * Prevents "message channel closed" errors by properly handling async operations
 */

/**
 * Create a safe event listener that won't return promises
 * @param {Function} callback - The callback to wrap
 * @returns {Function} - Wrapped callback that's safe for socket events
 */
export const createSafeEventListener = (callback) => {
  return (...args) => {
    // Execute synchronously without returning anything
    try {
      const result = callback(...args);
      
      // If callback returns a promise, don't wait for it
      // This prevents "message channel closed" errors
      if (result && typeof result.catch === 'function') {
        result.catch(err => {
          console.warn('Async error in socket listener (silently handled):', err.message);
        });
      }
    } catch (error) {
      console.error('Error in socket event listener:', error);
      // Silently fail - don't throw to prevent message channel issues
    }
  };
};

/**
 * Register a safe listener on a socket
 * @param {Socket} socket - Socket.IO socket instance
 * @param {string} eventName - Name of the event
 * @param {Function} callback - Callback function to call
 */
export const registerSafeListener = (socket, eventName, callback) => {
  if (!socket) {
    console.warn('Socket not available for event:', eventName);
    return;
  }

  socket.on(eventName, createSafeEventListener(callback));
};

/**
 * Register multiple safe listeners at once
 * @param {Socket} socket - Socket.IO socket instance
 * @param {Object} listeners - Object with { eventName: callback } pairs
 */
export const registerSafeListeners = (socket, listeners) => {
  if (!socket) {
    console.warn('Socket not available for registering listeners');
    return;
  }

  Object.entries(listeners).forEach(([eventName, callback]) => {
    if (typeof callback === 'function') {
      registerSafeListener(socket, eventName, callback);
    }
  });
};

/**
 * Remove a listener safely
 * @param {Socket} socket - Socket.IO socket instance
 * @param {string} eventName - Name of the event
 */
export const removeSafeListener = (socket, eventName) => {
  if (socket) {
    try {
      socket.off(eventName);
    } catch (err) {
      console.warn('Error removing listener:', eventName, err.message);
    }
  }
};

/**
 * Remove multiple listeners safely
 * @param {Socket} socket - Socket.IO socket instance
 * @param {Array<string>} eventNames - Names of events to remove
 */
export const removeSafeListeners = (socket, eventNames = []) => {
  if (!socket) return;

  eventNames.forEach(eventName => {
    try {
      socket.off(eventName);
    } catch (err) {
      console.warn('Error removing listener:', eventName, err.message);
    }
  });
};

/**
 * Emit event safely without expecting a response
 * @param {Socket} socket - Socket.IO socket instance
 * @param {string} eventName - Name of the event
 * @param {Object} data - Data to emit
 */
export const emitSafeEvent = (socket, eventName, data = {}) => {
  if (!socket) {
    console.warn('Socket not available for emitting event:', eventName);
    return;
  }

  try {
    socket.emit(eventName, data);
  } catch (error) {
    console.error('Error emitting event:', eventName, error);
  }
};

/**
 * Emit event with acknowledgment safely
 * DO NOT USE THIS - causes message channel closed errors
 * @deprecated Use emitSafeEvent instead
 */
export const emitSafeEventWithAck = (socket, eventName, data = {}, callback = null) => {
  console.warn('⚠️ emitSafeEventWithAck is deprecated and may cause "message channel closed" errors. Use emitSafeEvent instead.');
  
  if (!socket) {
    console.warn('Socket not available for emitting event:', eventName);
    return;
  }

  try {
    // Emit without expecting acknowledgment to prevent channel closure
    socket.emit(eventName, data);
  } catch (error) {
    console.error('Error emitting event:', eventName, error);
  }
};

export default {
  createSafeEventListener,
  registerSafeListener,
  registerSafeListeners,
  removeSafeListener,
  removeSafeListeners,
  emitSafeEvent,
  emitSafeEventWithAck,
};
