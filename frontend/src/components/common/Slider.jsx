import React from 'react';

/**
 * Slider Component
 * Range slider for selecting min and max values
 */
const Slider = React.forwardRef(({
  min = 0,
  max = 100,
  value = [min, max],
  onChange,
  step = 1,
  className = '',
  disabled = false,
}, ref) => {
  const handleMinChange = (e) => {
    const newMin = parseInt(e.target.value);
    if (newMin <= value[1]) {
      onChange([newMin, value[1]]);
    }
  };

  const handleMaxChange = (e) => {
    const newMax = parseInt(e.target.value);
    if (newMax >= value[0]) {
      onChange([value[0], newMax]);
    }
  };

  const minPercent = ((value[0] - min) / (max - min)) * 100;
  const maxPercent = ((value[1] - min) / (max - min)) * 100;

  return (
    <div ref={ref} className={`relative w-full ${className}`}>
      {/* Track */}
      <div className="relative h-2 bg-slate-200 dark:bg-slate-700 rounded-full">
        {/* Range Fill */}
        <div
          className="absolute h-2 bg-teal-500 rounded-full"
          style={{
            left: `${minPercent}%`,
            right: `${100 - maxPercent}%`,
          }}
        />
      </div>

      {/* Min Input */}
      <input
        type="range"
        min={min}
        max={max}
        value={value[0]}
        onChange={handleMinChange}
        step={step}
        disabled={disabled}
        className="absolute w-full h-2 top-0 appearance-none bg-transparent rounded-full pointer-events-none accent-teal-500 z-5"
        style={{
          zIndex: value[0] > max - (max - min) / 2 ? 5 : 3,
        }}
      />

      {/* Max Input */}
      <input
        type="range"
        min={min}
        max={max}
        value={value[1]}
        onChange={handleMaxChange}
        step={step}
        disabled={disabled}
        className="absolute w-full h-2 top-0 appearance-none bg-transparent rounded-full pointer-events-none accent-teal-500 z-4"
      />

      <style>{`
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
        }

        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          border: 2px solid white;
        }

        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          border: 2px solid white;
        }

        input[type="range"]:disabled::-webkit-slider-thumb {
          background: #9ca3af;
          cursor: not-allowed;
        }

        input[type="range"]:disabled::-moz-range-thumb {
          background: #9ca3af;
          cursor: not-allowed;
        }

        input[type="range"]:hover::-webkit-slider-thumb {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        input[type="range"]:hover::-moz-range-thumb {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
});

Slider.displayName = 'Slider';

export default Slider;

/**
 * Usage:
 * 
 * <Slider
 *   min={0}
 *   max={100}
 *   value={[20, 80]}
 *   onChange={(values) => console.log(values)}
 *   step={5}
 * />
 */
