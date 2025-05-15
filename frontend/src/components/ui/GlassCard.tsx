import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
  variant?: 'default' | 'dark';
  delay?: number;
  onClick?: () => void;
}

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  hoverable = false,
  variant = 'default',
  delay = 0,
  onClick
}) => {
  const baseClasses = variant === 'dark' ? 'glass-card-dark' : 'glass-card';
  const hoverClasses = hoverable || onClick ? 'hover:scale-[1.02] cursor-pointer' : '';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`${baseClasses} rounded-xl p-5 ${hoverClasses} transition-all duration-300 ${className}`}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;
