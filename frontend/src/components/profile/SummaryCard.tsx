import React, { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, CheckCircle, Edit2, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import Button from '../ui/Button';
import ClaimField, { formatters } from '../ui/ClaimField';
import { VisitClaim } from '../../types/claim';
import { useClaims } from '../../contexts/ClaimContext';

interface SummaryCardProps {
  claim: VisitClaim;
  onToggleDetails: () => void;
  isExpanded: boolean;
}

const claimStatusOptions = [
  'Claim not filed',
  'Claim not received from HBox',
  'Deductible Applied',
  'High Copay Writeoff',
  'Inpatient for DOS',
  'Insurance Paid',
  'Multiple Provider enrollment',
  'No Sec Ins',
  'Patient Deceased',
  'Policy Inactive',
  'Prim Denied',
  'Prim Pymt Pending',
  'Program not covered',
  'Sec Denied. Prim Paid more than Allowed amt',
  'Sec not paying',
  'Sec Pymt Pending'
];

// Animation variants for smoother transitions
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.4,
      ease: "easeOut"
    }
  },
  hover: {
    scale: 1.01,
    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
    transition: { duration: 0.2 }
  }
};

const confirmationVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3 }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

const SummaryCard: React.FC<SummaryCardProps> = ({ claim, onToggleDetails, isExpanded }) => {
  const { updateClaim } = useClaims();
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isEditable, setIsEditable] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [hasBeenEdited, setHasBeenEdited] = useState(false);

  // Set initial status from claim with useEffect cleanup
  useEffect(() => {
    setSelectedStatus(claim.claim_status || '');
    
    // If the claim has a status already and hasn't been edited in this session,
    // set it as non-editable by default
    if (claim.claim_status && !hasBeenEdited) {
      setIsEditable(false);
    }
    
    return () => {
      // Cleanup function to avoid memory leaks with any potential timeouts
      if (showConfirmation) {
        setShowConfirmation(false);
      }
    };
  }, [claim.claim_status, hasBeenEdited]);

  const handleStatusChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(e.target.value);
  }, []);

  const handleSaveStatus = useCallback((e: React.MouseEvent) => {
    // Stop propagation to prevent the card click handler from being triggered
    e.stopPropagation();
    
    if (selectedStatus) {
      // Make sure we include all required fields for a status update
      updateClaim({
        id: claim.id,
        claim_status: selectedStatus,
        claim_status_type: claim.claim_status_type, // Ensure we preserve the existing status type
        // Update the legacy status field for compatibility
        status: (selectedStatus === 'Posted' || selectedStatus === 'Pending' || selectedStatus === 'Rejected') 
          ? selectedStatus as 'Posted' | 'Pending' | 'Rejected' 
          : 'Pending',
        updatedAt: new Date().toISOString(),
      });
      
      // After saving, make the status non-editable
      setIsEditable(false);
      setHasBeenEdited(true);
      setShowConfirmation(true);
      
      // Hide confirmation message after 3 seconds
      setTimeout(() => {
        setShowConfirmation(false);
      }, 3000);
    }
  }, [selectedStatus, claim.id, claim.claim_status_type, updateClaim]);
  
  // Function to toggle edit mode (can only be done once)
  const toggleEditMode = useCallback((e: React.MouseEvent) => {
    // Stop propagation to prevent the card click handler from being triggered
    e.stopPropagation();
    
    if (!isEditable) {
      setIsEditable(true);
    }
  }, [isEditable]);

  // Determine status display style based on the selected status
  const getStatusDisplayStyle = useCallback((status: string) => {
    switch (status) {
      case 'Insurance Paid':
      case 'Claim not filed':
        return 'bg-success-500/20 text-success-300';
      case 'Prim Denied':
      case 'Sec Denied. Prim Paid more than Allowed amt':
      case 'Patient Deceased':
        return 'bg-error-500/20 text-error-300';
      case 'Prim Pymt Pending':
      case 'Sec Pymt Pending':
      case 'Claim not received from HBox':
        return 'bg-warning-500/20 text-warning-300';
      default:
        return 'bg-info-500/20 text-info-300';
    }
  }, []);

  // Stop propagation for status controls to prevent card click when interacting with them
  const handleStatusControlClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className="mb-6"
      layout
    >
      <GlassCard 
        className={`overflow-hidden cursor-pointer transition-all duration-300 ${isExpanded ? 'border-accent-400 shadow-lg' : 'hover:bg-white/5'}`}
        onClick={onToggleDetails}
      >
        <div className="flex justify-between items-center mb-6">
          <motion.h2 
            className="text-xl font-semibold flex items-center gap-2"
            initial={{ opacity: 0.9 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              whileHover={{ rotate: [0, -10, 0], scale: 1.1 }}
              transition={{ duration: 0.4 }}
            >
              <FileText className="text-accent-400" size={20} />
            </motion.div>
            Claim Summary
          </motion.h2>
          
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 200, damping: 15 }}
          >
            {isExpanded ? 
              <ChevronUp className="text-accent-400" size={20} /> : 
              <ChevronDown className="text-accent-400" size={20} />
            }
          </motion.div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ClaimField 
            label="CPT Code" 
            value={claim.cpt_code} 
          />
          
          <ClaimField 
            label="Patient ID" 
            value={claim.patient_id} 
          />
          
          <ClaimField 
            label="Date of Service (DOS)" 
            value={claim.service_end} 
            formatter={formatters.date}
          />
          
          <div className="md:col-span-2 mt-4" onClick={handleStatusControlClick}>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-white/70">Claim Status</label>
              {!isEditable && selectedStatus && (
                <motion.button 
                  onClick={toggleEditMode} 
                  className="flex items-center gap-1 text-accent-400 hover:text-accent-300 text-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Edit2 size={14} />
                  <span>Edit</span>
                </motion.button>
              )}
            </div>
            
            {isEditable ? (
              <motion.div 
                className="flex gap-3"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <select
                  className="glass-input flex-grow bg-dark-500 text-white"
                  value={selectedStatus || ''}
                  onChange={handleStatusChange}
                  style={{ background: '#1a1a2e', color: 'white' }}
                  onClick={e => e.stopPropagation()}
                >
                  <option value="" className="bg-dark-500 text-white">Select a status</option>
                  {claimStatusOptions.map(status => (
                    <option key={status} value={status} className="bg-dark-500 text-white">
                      {status}
                    </option>
                  ))}
                </select>
                <Button 
                  variant="primary" 
                  onClick={handleSaveStatus}
                  disabled={!selectedStatus}
                >
                  Save
                </Button>
              </motion.div>
            ) : (
              <motion.div 
                className="flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <motion.span 
                  className={`px-3 py-2 rounded-md ${selectedStatus ? getStatusDisplayStyle(selectedStatus) : 'bg-gray-600/30 text-white/70'}`}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  {selectedStatus || 'No status set'}
                </motion.span>
                <motion.span 
                  className="flex items-center gap-1 text-white/50 text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                >
                  <Lock size={14} />
                  <span>Locked</span>
                </motion.span>
              </motion.div>
            )}
            
            {/* Success confirmation message */}
            <AnimatePresence>
              {showConfirmation && (
                <motion.div 
                  variants={confirmationVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="mt-3 flex items-center gap-2 text-success-400 bg-success-400/10 px-3 py-2 rounded"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      type: "spring",
                      stiffness: 260,
                      damping: 20
                    }}
                  >
                    <CheckCircle size={16} />
                  </motion.div>
                  <span>Status saved successfully!</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        <motion.div 
          className="text-center mt-6 text-accent-400 text-sm"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ 
            repeat: Infinity,
            duration: 2,
            ease: "easeInOut"
          }}
        >
          {isExpanded ? "Click to hide details" : "Click to view details"}
        </motion.div>
      </GlassCard>
    </motion.div>
  );
};

// Use memo to prevent unnecessary re-renders
export default memo(SummaryCard);