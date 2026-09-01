import { useState, useEffect } from 'react';
import { useCurrencyConversion } from '../hooks/useCurrencyConversion';
import { convertEGPtoUSD, formatPrice } from '../services/currencyService';
import { Button } from '../components/common';
import toast from 'react-hot-toast';

/**
 * Booking Panel with Currency Conversion - FIXED
 * السعر المحفوظ في الـ Database هو بالدولار بالفعل
 * لا نحتاج لأي حسبة معقدة
 */

// Helper function to safely convert price to number
const safeParsePrice = (price) => {
  if (typeof price === 'string') {
    return parseFloat(price) || 0;
  }
  return parseFloat(price) || 0;
};

const BookingPanel = ({
  pkg,
  persons,
  onPersonsChange,
  selectedRoomType,
  onSelectRoomType,
  selectedExtras,
  onToggleExtra,
  priceBreakdown,
  onBookNow,
  isBookingLoading,
}) => {
  const { currency, toggleCurrency } = useCurrencyConversion();
  const [isConverting, setIsConverting] = useState(false);

  // لا نحتاج لحسبة معقدة - السعر موجود بالدولار بالفعل
  useEffect(() => {
    setIsConverting(false);
  }, [priceBreakdown, currency]);

  // Safe price parsing
  const basePrice = safeParsePrice(pkg?.base_price);
  const breakdownBase = safeParsePrice(priceBreakdown?.base);
  const breakdownRoom = safeParsePrice(priceBreakdown?.room);
  const breakdownExtras = safeParsePrice(priceBreakdown?.extras);
  const breakdownTotal = safeParsePrice(priceBreakdown?.total);

  return (
    <div className="h-fit sticky top-20 lg:top-20 space-y-4">
      {/* Currency Toggle */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border-2 border-slate-200 dark:border-slate-700 shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            💱 Display in:
          </span>
          <button
            onClick={toggleCurrency}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              currency === 'USD'
                ? 'bg-blue-600 text-white'
                : 'bg-green-600 text-white'
            }`}
          >
            {currency === 'USD' ? '$ USD' : '£ EGP'}
          </button>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
          {currency === 'USD' 
            ? 'Prices displayed in US Dollars'
            : 'Prices displayed in US Dollars (from database)'
          }
        </p>
      </div>

      {/* Price Card */}
      <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30 rounded-xl p-6 border-2 border-cyan-300 dark:border-cyan-600 shadow-lg">
        <div className="space-y-6">
          {/* Price Display - FIXED: السعر بالدولار مباشرة */}
          <div className="text-center pb-4 border-b-2 border-cyan-200 dark:border-cyan-700">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Price Per Person</p>
            <p className="text-4xl font-bold text-cyan-600 dark:text-cyan-400">
              {isConverting ? (
                <span className="animate-pulse">...</span>
              ) : (
                <>
                  ${basePrice.toFixed(2)}
                  <span className="text-lg"> USD</span>
                </>
              )}
            </p>
          </div>

          {/* Persons */}
          <div>
            <label className="block text-sm font-bold text-slate-900 dark:text-white mb-3">
              👥 Number of Persons
            </label>
            <div className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-lg p-2 border-2 border-slate-200 dark:border-slate-700">
              <button
                onClick={() => onPersonsChange(Math.max(1, persons - 1))}
                className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 font-bold text-lg"
              >
                −
              </button>
              <input
                type="number"
                value={persons}
                onChange={(e) => onPersonsChange(Math.max(1, parseInt(e.target.value) || 1))}
                className="flex-1 text-center text-2xl font-bold bg-transparent text-slate-900 dark:text-white"
                min="1"
              />
              <button
                onClick={() => onPersonsChange(persons + 1)}
                className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 font-bold text-lg"
              >
                +
              </button>
            </div>
          </div>

          {/* Room Selection */}
          {pkg?.room_types && pkg.room_types.length > 0 && (
            <div>
              <label className="block text-sm font-bold text-slate-900 dark:text-white mb-3">
                🏨 Select Hotel
              </label>
              <div className="space-y-2">
                {pkg.room_types.map(room => (
                  <button
                    key={room.id}
                    onClick={() => onSelectRoomType(room)}
                    className={`w-full p-3 rounded-lg text-left transition-all border-2 ${
                      selectedRoomType?.id === room.id
                        ? 'bg-cyan-100 dark:bg-cyan-900 border-cyan-600 dark:border-cyan-400'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-cyan-400'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-900 dark:text-white">{room.name}</span>
                      <span className="text-cyan-600 dark:text-cyan-400 font-bold">
                        +${safeParsePrice(room.price).toFixed(2)} USD
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Extras */}
          {pkg?.extras && pkg.extras.length > 0 && (
            <div>
              <label className="block text-sm font-bold text-slate-900 dark:text-white mb-3">
                ✨ Add Extras (Optional)
              </label>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {pkg.extras.map(extra => (
                  <label
                    key={extra.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-cyan-400 cursor-pointer transition-all"
                  >
                    <input
                      type="checkbox"
                      checked={selectedExtras.some(e => e.id === extra.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          onToggleExtra(extra);
                        } else {
                          onToggleExtra(extra);
                        }
                      }}
                      className="w-5 h-5 rounded"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 dark:text-white text-sm">{extra.name}</p>
                      <p className="text-xs text-slate-500">
                        +${safeParsePrice(extra.price).toFixed(2)} USD per person
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Price Breakdown - FIXED: عرض الأسعار بشكل صحيح */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 space-y-2 border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
              <span>Base Price ({persons}x)</span>
              <span>
                ${breakdownBase.toFixed(2)} USD
              </span>
            </div>
            {selectedRoomType && (
              <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                <span>Hotel ({persons}x)</span>
                <span>
                  ${breakdownRoom.toFixed(2)} USD
                </span>
              </div>
            )}
            {selectedExtras.length > 0 && (
              <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                <span>Extras ({selectedExtras.length})</span>
                <span>
                  ${breakdownExtras.toFixed(2)} USD
                </span>
              </div>
            )}
            <div className="border-t border-slate-300 dark:border-slate-600 pt-2 mt-2">
              <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                <span>Total</span>
                <span className="text-lg text-cyan-600 dark:text-cyan-400">
                  {isConverting ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    `$${breakdownTotal.toFixed(2)} USD`
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Book Now Button */}
          <Button
            onClick={onBookNow}
            loading={isBookingLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-3 rounded-lg"
          >
            Book Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookingPanel;