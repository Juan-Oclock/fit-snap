'use client';

import React from 'react';

interface SliderProps {
  id?: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  disabled?: boolean;
  label?: string;
  description?: string;
  formatValue?: (value: number) => string;
}

export default function Slider({ 
  id, 
  value, 
  onChange, 
  min, 
  max, 
  step = 1, 
  disabled = false, 
  label, 
  description,
  formatValue
}: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    onChange(newValue);
  };

  const displayValue = formatValue ? formatValue(value) : value.toString();

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <label htmlFor={id} className="block text-sm font-medium text-gray-200">
            {label}
          </label>
          <span className="text-sm text-primary font-medium">{displayValue}</span>
        </div>
      )}
      
      {description && (
        <p className="text-sm text-gray-400">{description}</p>
      )}
      
      <div className="relative">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className={`
            w-full h-2 bg-dark-600 rounded-lg appearance-none cursor-pointer
            focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-dark-800
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            slider
          `}
          style={{
            background: `linear-gradient(to right, #F59E0B 0%, #F59E0B ${percentage}%, #374151 ${percentage}%, #374151 100%)`
          }}
        />
        
        {/* Custom thumb styling */}
        <style jsx>{`
          .slider::-webkit-slider-thumb {
            appearance: none;
            height: 20px;
            width: 20px;
            border-radius: 50%;
            background: #F59E0B;
            cursor: pointer;
            border: 2px solid #1F2937;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }
          
          .slider::-moz-range-thumb {
            height: 20px;
            width: 20px;
            border-radius: 50%;
            background: #F59E0B;
            cursor: pointer;
            border: 2px solid #1F2937;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }
        `}</style>
      </div>
      
      <div className="flex justify-between text-xs text-gray-500">
        <span>{formatValue ? formatValue(min) : min}</span>
        <span>{formatValue ? formatValue(max) : max}</span>
      </div>
    </div>
  );
}
