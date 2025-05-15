import React, { useState } from 'react';
import { motion } from 'framer-motion';
import GlassInput from '../ui/GlassInput';
import Button from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { LoginCredentials } from '../../types/auth';

// Custom Mail and Lock icon components that match the website style
const MailIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="18" 
    height="18" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2"
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className="text-white/80"
  >
    <rect width="20" height="16" x="2" y="4" rx="2"></rect>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
  </svg>
);

const LockIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="18" 
    height="18" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className="text-white/80"
  >
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

// Clearer versions of the icons
const ClearMailIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="18" 
    height="18" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="white" 
    strokeWidth="2"
    strokeLinecap="round" 
    strokeLinejoin="round" 
  >
    <rect width="20" height="16" x="2" y="4" rx="2"></rect>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
  </svg>
);

const ClearLockIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="18" 
    height="18" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="white" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

const LoginForm: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!credentials.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!credentials.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    // Hardcoded user validation
    const validUsers = [
      { email: 'HBilling_RCM@HBOX.AI', password: 'Admin@2025', role: 'Admin', name: 'Admin User' },
      { email: 'syed.a@hbox.ai', password: '123456789', role: 'User', name: 'Syed A' }
    ];
    
    const matchedUser = validUsers.find(
      user => user.email.toLowerCase() === credentials.email.toLowerCase() && 
              user.password === credentials.password
    );
    
    if (matchedUser) {
      try {
        await login({
          email: credentials.email,
          password: credentials.password,
          userData: matchedUser
        });
      } catch (error) {
        console.error('Login failed:', error);
        setErrors({ form: 'Login failed. Please try again.' });
      }
    } else {
      setErrors({ form: 'Invalid email or password.' });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="w-full max-w-md"
    >
      <div className="mb-8 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut", delay: 0.2 }}
          className="text-3xl font-bold text-white mb-2"
        >
          Welcome to RCM
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeInOut", delay: 0.3 }}
          className="text-white/60"
        >
          Sign in to access HBox's internal billing portal.
        </motion.p>
      </div>
      
      <motion.form 
        onSubmit={handleSubmit} 
        className="space-y-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeInOut", delay: 0.4 }}
      >
        <GlassInput
          label="Email"
          type="email"
          name="email"
          placeholder="your@email.com"
          value={credentials.email}
          onChange={handleChange}
          icon={<MailIcon />}
          clearIcon={<ClearMailIcon />}
          error={errors.email}
          autoComplete="email"
        />
        
        <GlassInput
          label="Password"
          type="password"
          name="password"
          placeholder="••••••••"
          value={credentials.password}
          onChange={handleChange}
          icon={<LockIcon />}
          clearIcon={<ClearLockIcon />}
          error={errors.password}
          autoComplete="current-password"
        />
        
        {errors.form && (
          <motion.p 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-error-400 text-sm"
          >
            {errors.form}
          </motion.p>
        )}
        
        <div className="pt-2">
          <Button 
            type="submit" 
            className="w-full" 
            isLoading={isLoading}
          >
            Sign In
          </Button>
        </div>
      </motion.form>
    </motion.div>
  );
};

export default LoginForm;
