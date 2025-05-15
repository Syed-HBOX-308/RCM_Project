import React, { InputHTMLAttributes, useState } from 'react';

interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  clearIcon?: React.ReactNode; // New prop for the clear icon layer
  error?: string;
}

const GlassInput: React.FC<GlassInputProps> = ({ 
  label, 
  icon,
  clearIcon, // New prop for the clear icon
  error, 
  className = '', 
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-white/80 mb-2 font-medium">
          {label}
        </label>
      )}
      
      <div className="relative">
        {/* Original icon layer */}
        {icon && (
          <div 
            className="absolute left-3 top-1/2" 
            style={{
              transform: 'translateY(-50%)',
              textRendering: 'geometricPrecision',
              WebkitFontSmoothing: 'subpixel-antialiased',
              MozOsxFontSmoothing: 'grayscale'
            }}
          >
            {icon}
          </div>
        )}
        
        {/* Clear icon layer with better positioning */}
        {clearIcon && (
          <div 
            className="absolute left-3 top-1/2 z-10" 
            style={{
              transform: 'translateY(-50%)',
              filter: 'none',
              WebkitFontSmoothing: 'auto'
            }}
          >
            {clearIcon}
          </div>
        )}
        
        <input
          className={`glass-input w-full ${(icon || clearIcon) ? 'pl-12' : ''} ${
            error ? 'border-error-500' : ''
          } ${isFocused ? 'ring-2 ring-primary-500/60 shadow-[0_0_10px_2px_rgba(59,130,246,0.3)]' : ''} ${className}`}
          onFocus={(e) => {
            setIsFocused(true);
            if (props.onFocus) props.onFocus(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            if (props.onBlur) props.onBlur(e);
          }}
          {...props}
        />
      </div>
      
      {error && (
        <p className="mt-1 text-error-400 text-sm">{error}</p>
      )}
    </div>
  );
};

export default GlassInput;
