import React, { useState, useEffect } from 'react';
import { addonsService } from '../services';
import { formatCurrency } from '../utils/formatters';
import '../styles/components/addons-selector.css';

/**
 * AddonsSelector Component
 * Displays and manages package add-ons selection
 */
const AddonsSelector = ({ packageId, selectedAddons, onAddonsChange, loading: parentLoading }) => {
  const [addons, setAddons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load addons
  useEffect(() => {
    if (!packageId) return;

    const loadAddons = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('📥 [AddonsSelector] Loading addons for package:', packageId);
        const response = await addonsService.getPackageAddons(packageId);
        console.log('🟢 [AddonsSelector] Addons response:', {
          success: response.success,
          dataCount: response.data?.length,
          count: response.count,
        });
        
        // response.data has the addons array
        const addonsData = response.data || response || [];
        console.log('✅ [AddonsSelector] Setting addons:', addonsData.length);
        setAddons(addonsData);
      } catch (err) {
        console.error('❌ [AddonsSelector] Error loading addons:', err);
        setError('Failed to load add-ons');
        setAddons([]);
      } finally {
        setLoading(false);
      }
    };

    loadAddons();
  }, [packageId]);

  // Handle addon toggle
  const handleToggleAddon = (addon) => {
    const isSelected = selectedAddons.some(a => a.id === addon.id);
    
    let updatedAddons;
    if (isSelected) {
      updatedAddons = selectedAddons.filter(a => a.id !== addon.id);
    } else {
      updatedAddons = [...selectedAddons, { ...addon, quantity: addon.min_quantity || 1 }];
    }
    
    onAddonsChange(updatedAddons);
  };

  // Handle quantity change
  const handleQuantityChange = (addonId, newQuantity) => {
    const updatedAddons = selectedAddons.map(addon => 
      addon.id === addonId 
        ? { ...addon, quantity: Math.max(addon.min_quantity || 1, Math.min(newQuantity, addon.max_quantity || 1)) }
        : addon
    );
    onAddonsChange(updatedAddons);
  };

  if (loading || parentLoading) {
    return <div className="addons-loading">Loading add-ons...</div>;
  }

  if (error) {
    return <div className="addons-error">{error}</div>;
  }

  if (!addons || addons.length === 0) {
    return <p className="no-addons">No add-ons available for this package</p>;
  }

  // Group addons by category
  const addonsByCategory = addons.reduce((acc, addon) => {
    const category = addon.category || 'addon';
    if (!acc[category]) acc[category] = [];
    acc[category].push(addon);
    return acc;
  }, {});

  const categoryLabels = {
    addon: '✨ Optional Add-ons',
    room_upgrade: '🏨 Room Upgrades',
    meal_plan: '🍽️ Meal Plans',
    activity: '🎭 Activities',
    transfer: '🚗 Transfers',
  };

  return (
    <div className="addons-selector">
      {Object.entries(addonsByCategory).map(([category, categoryAddons]) => (
        <div key={category} className="addons-category">
          <h3 className="category-title">{categoryLabels[category] || category}</h3>
          <div className="addons-grid">
            {categoryAddons.map(addon => {
              const isSelected = selectedAddons.some(a => a.id === addon.id);
              const selectedAddon = selectedAddons.find(a => a.id === addon.id);

              return (
                <div
                  key={addon.id}
                  className={`addon-card ${isSelected ? 'selected' : ''} ${!addon.is_available ? 'disabled' : ''}`}
                >
                  <div className="addon-checkbox-wrapper">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleAddon(addon)}
                      disabled={!addon.is_available}
                      className="addon-checkbox"
                      id={`addon-${addon.id}`}
                    />
                    <label htmlFor={`addon-${addon.id}`}></label>
                  </div>

                  <div className="addon-content">
                    <h4 className="addon-name">{addon.name}</h4>
                    
                    {addon.description && (
                      <p className="addon-description">{addon.description}</p>
                    )}

                    <div className="addon-footer">
                      <span className="addon-price">{formatCurrency(addon.price)}</span>
                      
                      {isSelected && (addon.max_quantity > 1 || addon.max_quantity === -1) && (
                        <div className="addon-quantity">
                          <button
                            onClick={() => handleQuantityChange(addon.id, selectedAddon.quantity - 1)}
                            disabled={selectedAddon.quantity <= (addon.min_quantity || 1)}
                            className="qty-btn"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            value={selectedAddon.quantity}
                            onChange={(e) => handleQuantityChange(addon.id, parseInt(e.target.value) || 1)}
                            min={addon.min_quantity || 1}
                            max={addon.max_quantity || 1}
                            className="qty-input"
                          />
                          <button
                            onClick={() => handleQuantityChange(addon.id, selectedAddon.quantity + 1)}
                            disabled={selectedAddon.quantity >= (addon.max_quantity || 1)}
                            className="qty-btn"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>

                    {!addon.is_available && (
                      <span className="unavailable-badge">Unavailable</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Selected Addons Summary */}
      {selectedAddons.length > 0 && (
        <div className="addons-summary">
          <h4>Selected Add-ons Summary</h4>
          <div className="summary-list">
            {selectedAddons.map(addon => (
              <div key={addon.id} className="summary-item">
                <span className="summary-name">
                  {addon.name} {addon.quantity > 1 ? `(x${addon.quantity})` : ''}
                </span>
                <span className="summary-price">
                  {formatCurrency(addon.price * (addon.quantity || 1))}
                </span>
              </div>
            ))}
          </div>
          <div className="summary-total">
            <span>Total Add-ons:</span>
            <span className="total-price">
              {formatCurrency(selectedAddons.reduce((sum, a) => sum + (a.price * (a.quantity || 1)), 0))}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddonsSelector;
