import React, { ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  className = '',
  isLoading = false,
  icon,
  ...props
}) => {
  const baseClass = `btn-${variant}`;
  
  return (
    <motion.button
      className={`${baseClass} flex items-center justify-center gap-2 shadow-lg ${className}`}
      disabled={isLoading || props.disabled}
      whileHover={{ 
        scale: 1.03,
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -4px rgba(0, 0, 0, 0.2)" 
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : icon ? (
        <span className="flex items-center">{icon}</span>
      ) : null}
      
      {children}
    </motion.button>
  );
};

export default Button;
