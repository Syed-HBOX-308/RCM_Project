import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';
import { SearchFilters } from '../../types/claim';
import { useClaims } from '../../contexts/ClaimContext';
import GlassInput from '../ui/GlassInput';

// Clean, black SVG icons as components
const PatientIdIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="black"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M22 12h-6"></path>
  </svg>
);

const CptIdIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="black"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"></path>
    <rect x="9" y="3" width="6" height="4" rx="2"></rect>
    <path d="M9 14h.01"></path>
    <path d="M13 14h.01"></path>
    <path d="M9 18h.01"></path>
    <path d="M13 18h.01"></path>
  </svg>
);

const CalendarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="black"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const SearchIcon = () => (
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
  >
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

interface SearchFormProps {
  onShowAllClick?: () => void;
}

const SearchForm: React.FC<SearchFormProps> = ({ onShowAllClick }) => {
  const { searchClaims, isLoading } = useClaims();
  const [filters, setFilters] = useState<SearchFilters>({
    patientId: '',
    cptId: '',
    dos: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchClaims(filters);
  };

  const handleClear = () => {
    setFilters({
      patientId: '',
      cptId: '',
      dos: '',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-8"
    >
      <form onSubmit={handleSubmit} className="glass-card-dark p-6 rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <GlassInput
            label="Patient ID"
            name="patientId"
            placeholder="Enter patient ID"
            value={filters.patientId}
            onChange={handleChange}
            clearIcon={<PatientIdIcon />}
          />
          
          <GlassInput
            label="CPT ID"
            name="cptId"
            placeholder="Enter CPT code"
            value={filters.cptId}
            onChange={handleChange}
            clearIcon={<CptIdIcon />}
          />
          
          <GlassInput
            label="Date of Service (DOS)"
            name="dos"
            type="date"
            placeholder="MM/DD/YYYY"
            value={filters.dos}
            onChange={handleChange}
            clearIcon={<CalendarIcon />}
          />
        </div>
        
        <div className="flex flex-wrap justify-end gap-4 mt-6">
          <Button 
            type="button" 
            variant="secondary" 
            onClick={handleClear}
          >
            Clear
          </Button>
          
          <Button 
            type="submit"
            variant="accent"
            isLoading={isLoading}
            icon={<SearchIcon />}
          >
            Search
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default SearchForm;
