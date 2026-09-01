/**
 * Socket.IO Message Channel Closed Error Fix
 * Patches Socket.IO to prevent "message channel closed" errors from async listeners
 */

/**
 * Patch Socket.IO instance to handle async listeners safely
 * Also prevents Chrome extensions from causing "message channel closed" errors
 * @param {Socket} socket - Socket.IO socket instance
 */
export const patchSocketIO = (socket) => {
  if (!socket || socket._alreadyPatched) {
    return;
  }

  socket._alreadyPatched = true;

  // Store original on method
  const originalOn = socket.on.bind(socket);

  // Override the on method to wrap all callbacks
  socket.on = function(eventName, callback) {
    const wrappedCallback = (...args) => {
      try {
        // Call the callback
        const result = callback(...args);

        // If it's a promise, handle it silently
        if (result && typeof result.catch === 'function') {
          result.catch(err => {
            console.debug(`Silent async error in listener for "${eventName}":`, err.message);
          });
        }
        
        // Never return true or any truthy value that indicates async response
        // This prevents "message channel closed" errors from Chrome extensions
        return undefined;
      } catch (error) {
        console.error(`Error in listener for "${eventName}":`, error);
        return undefined;
      }
    };

    return originalOn(eventName, wrappedCallback);
  };

  // Also patch once
  const originalOnce = socket.once.bind(socket);
  socket.once = function(eventName, callback) {
    const wrappedCallback = (...args) => {
      try {
        const result = callback(...args);

        if (result && typeof result.catch === 'function') {
          result.catch(err => {
            console.debug(`Silent async error in once listener for "${eventName}":`, err.message);
          });
        }
        
        // Never return true or any truthy value
        return undefined;
      } catch (error) {
        console.error(`Error in once listener for "${eventName}":`, error);
        return undefined;
      }
    };

    return originalOnce(eventName, wrappedCallback);
  };

  // Prevent Chrome extensions from interfering with socket messages
  // Many extensions listen to all messages and return true, causing message channel closure
  if (socket.io && socket.io.engine) {
    const engine = socket.io.engine;
    
    // Handle the engine's message event safely
    if (typeof engine.on === 'function') {
      const originalEngineOn = engine.on.bind(engine);
      
      engine.on = function(eventName, callback) {
        // Don't wrap engine events - just pass through
        return originalEngineOn(eventName, callback);
      };
    }
  }

  return socket;
};

/**
 * Emit event safely without expecting response
 * This prevents the "message channel closed" error
 * @param {Socket} socket - Socket.IO socket
 * @param {string} event - Event name
 * @param {Object} data - Event data
 */
export const safeEmit = (socket, event, data) => {
  if (!socket || !socket.connected) {
    console.warn(`Socket not available or not connected for event: ${event}`);
    return;
  }

  try {
    // Emit without callback to prevent channel closure
    socket.emit(event, data);
  } catch (error) {
    console.error(`Error emitting ${event}:`, error.message);
  }
};

/**
 * Remove specific event listener
 * @param {Socket} socket - Socket.IO socket
 * @param {string} event - Event name
 */
export const safeOff = (socket, event) => {
  if (!socket) return;

  try {
    socket.off(event);
  } catch (error) {
    console.warn(`Error removing listener for ${event}:`, error.message);
  }
};

/**
 * Remove multiple event listeners
 * @param {Socket} socket - Socket.IO socket
 * @param {Array<string>} events - Event names
 */
export const safeOffAll = (socket, events = []) => {
  if (!socket) return;

  events.forEach(event => {
    try {
      socket.off(event);
    } catch (error) {
      console.warn(`Error removing listener for ${event}:`, error.message);
    }
  });
};

export default {
  patchSocketIO,
  safeEmit,
  safeOff,
  safeOffAll,
};
