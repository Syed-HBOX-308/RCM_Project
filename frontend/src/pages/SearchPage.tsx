import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Header from '../components/layout/Header';
import SearchForm from '../components/search/SearchForm';
import SearchResults from '../components/search/SearchResults';
import { useClaims } from '../contexts/ClaimContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const SearchPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { searchResults, isLoading } = useClaims();
  const [hasSearched, setHasSearched] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Track when a search happens
  useEffect(() => {
    if (isLoading) {
      setHasSearched(true);
    }
  }, [isLoading]);

  // Set hasSearched when Show All Claims button is clicked
  const handleShowAllClick = () => {
    setHasSearched(true);
  };

  if (!isAuthenticated) return null;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-300 to-dark-400">
      <Header />
      
      <div className="container mx-auto pt-24 pb-12 px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white">Search Claims</h1>
          <p className="text-white/60 mt-2">
            Find billing claims using multiple search parameters
          </p>
        </motion.div>
        
        <SearchForm onShowAllClick={handleShowAllClick} />
        <SearchResults 
          results={searchResults} 
          isLoading={isLoading}
          hasSearched={hasSearched}
        />
      </div>
    </div>
  );
};

export default SearchPage;
