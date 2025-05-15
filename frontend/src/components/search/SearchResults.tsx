import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, ArrowRight } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import { VisitClaim } from '../../types/claim';
import { Link } from 'react-router-dom';

interface SearchResultsProps {
  results: VisitClaim[];
  isLoading: boolean;
  hasSearched: boolean;
}

const SearchResults: React.FC<SearchResultsProps> = ({ 
  results, 
  isLoading,
  hasSearched
}) => {
  // Format date for display
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Determine status display style based on the status
  const getStatusDisplayStyle = (status: string | undefined) => {
    if (!status) return 'bg-gray-600/30 text-white/70';
    
    switch (status) {
      case 'Insurance Paid':
      case 'Claim not filed':
      case 'Posted':
        return 'bg-success-500/20 text-success-300';
      case 'Prim Denied':
      case 'Sec Denied. Prim Paid more than Allowed amt':
      case 'Patient Deceased':
      case 'Rejected':
        return 'bg-error-500/20 text-error-300';
      case 'Prim Pymt Pending':
      case 'Sec Pymt Pending':
      case 'Claim not received from HBox':
      case 'Pending':
        return 'bg-warning-500/20 text-warning-300';
      default:
        return 'bg-info-500/20 text-info-300';
    }
  };

  if (isLoading) {
    return (
      <GlassCard className="min-h-48 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-accent-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/70">Searching for claims...</p>
        </div>
      </GlassCard>
    );
  }

  if (hasSearched && results.length === 0) {
    return (
      <GlassCard className="min-h-48 flex items-center justify-center">
        <div className="text-center text-white/70">
          <AlertCircle className="h-10 w-10 mx-auto mb-4 text-white/40" />
          <h3 className="text-lg font-medium mb-1">No results found</h3>
          <p>Try adjusting your search parameters</p>
        </div>
      </GlassCard>
    );
  }

  if (!hasSearched) {
    return (
      <GlassCard className="min-h-48 flex items-center justify-center">
        <div className="text-center text-white/70">
          <Search className="h-10 w-10 mx-auto mb-4 text-white/40" />
          <h3 className="text-lg font-medium mb-1">Search for claims</h3>
          <p>Use the form above to find specific claims</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="space-y-4"
      >
        {results.map((claim, index) => (
          <motion.div
            key={claim.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
          >
            <GlassCard className="w-full hover:shadow-lg transition-shadow duration-300">
              <div className="p-5">
                {/* Patient Name Section */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
                  <div>
                    <h3 className="text-xl font-semibold text-white flex items-baseline">
                      <span>{claim.first_name}</span>
                      <span className="font-bold ml-2">{claim.last_name}</span>
                    </h3>
                  </div>
                  
                  {/* Patient and CPT ID/Code Section */}
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-white/50 text-xs uppercase tracking-wider mb-1 font-medium">Patient ID</p>
                      <p className="text-white text-base font-medium">{claim.patient_id}</p>
                    </div>
                    <div>
                      <p className="text-white/50 text-xs uppercase tracking-wider mb-1 font-medium">CPT ID</p>
                      <p className="text-white text-base font-medium">{claim.cpt_id || 'N/A'}</p>
                    </div>
                    <div className="bg-white/10 rounded-lg px-3 py-2">
                      <p className="text-white/50 text-xs uppercase tracking-wider mb-1 font-medium">CPT Code</p>
                      <p className="text-accent-400 text-base font-bold">{claim.cpt_code || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                
                {/* Dates and Status Section */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-white/50 text-xs uppercase tracking-wider mb-1 font-medium">Date of Birth</p>
                    <p className="text-white/90">{formatDate(claim.date_of_birth)}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-white/50 text-xs uppercase tracking-wider mb-1 font-medium">Date of Service</p>
                    <p className="text-white/90">{formatDate(claim.service_end)}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-white/50 text-xs uppercase tracking-wider mb-1 font-medium">Claim Status</p>
                    <span className={`inline-block px-2 py-1 rounded ${getStatusDisplayStyle(claim.claim_status)}`}>
                      {claim.claim_status || 'Not Set'}
                    </span>
                  </div>
                </div>
                
                {/* View Details Button */}
                <div className="mt-4 flex justify-end">
                  <Link to={`/profile/${claim.id}`} className="inline-flex items-center gap-2 text-accent-400 hover:text-accent-300 py-2 px-4 rounded-md bg-white/5 hover:bg-white/10 transition-colors border border-white/10 hover:border-white/20">
                    View Details
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
};

// Search icon component for initial state
const Search: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

export default SearchResults;
