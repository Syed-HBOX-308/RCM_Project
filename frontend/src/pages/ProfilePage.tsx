import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, FileText } from 'lucide-react';
import Header from '../components/layout/Header';
import SummaryCard from '../components/profile/SummaryCard';
import ClaimTabs from '../components/profile/ClaimTabs';
import HistorySection from '../components/profile/HistorySection';
import Button from '../components/ui/Button';
import { useClaims } from '../contexts/ClaimContext';
import { useAuth } from '../contexts/AuthContext';

const ProfilePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { id } = useParams<{ id: string }>();
  const { getClaim, currentClaim } = useClaims();
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false); // State to toggle expanded view
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (id) {
      getClaim(id);
    }
  }, [id, getClaim, isAuthenticated, navigate]);

  const handleViewFullProfile = () => {
    navigate(`/full-profile/${id}`);
  };

  // Toggle details view
  const toggleDetails = () => {
    setShowDetails(prev => !prev);
  };

  // Format date safely
  const formatDate = (dateString?: string | null): string => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return 'Invalid Date';
    }
  };

  if (!isAuthenticated || !currentClaim) return null;
  
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
          <div className="flex items-center gap-2 mb-2">
            <Link 
              to="/search" 
              className="text-white/70 hover:text-white flex items-center gap-1 transition-colors"
            >
              <ChevronLeft size={18} />
              <span>Back to Search</span>
            </Link>
          </div>
          
          <h1 className="text-3xl font-bold text-white">
            CPT ID: {currentClaim.cpt_id || 'N/A'}
          </h1>
          <p className="text-white/60 mt-2">
            Patient: {`${currentClaim.first_name} ${currentClaim.last_name}`} | 
            DOS: {formatDate(currentClaim.service_end || currentClaim.dos)}
          </p>
        </motion.div>
        
        <SummaryCard claim={currentClaim} onToggleDetails={toggleDetails} isExpanded={showDetails} />
        
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ClaimTabs claim={currentClaim} />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* History Section */}
        <HistorySection claimId={currentClaim.id} />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-8 flex justify-center"
        >
          <Button 
            variant="accent" 
            className="px-8 py-3 text-lg"
            icon={<FileText size={18} />}
            onClick={handleViewFullProfile}
          >
            View Full Profile
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
