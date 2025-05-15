import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Save, FileText, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import GlassInput from '../ui/GlassInput';
import Button from '../ui/Button';
import { VisitClaim } from '../../types/claim';
import { useClaims } from '../../contexts/ClaimContext';

interface ClaimTabsProps {
  claim: VisitClaim;
}

type TabType = 'claim' | 'primary' | 'secondary';

interface ClaimDetailsForm {
  oaClaimId: string;
  oaVisitId: string;
  chargeDt: string;
  chargeAmount: string;
}

interface PrimaryInsuranceForm {
  primIns: string;
  primAmt: string;
  primPostDt: string;
  primChkDetails: string;
  primRecDt: string;
  primChkAmt: string;
  primCmnt: string;
  primDenialCode: string;
}

interface SecondaryInsuranceForm {
  secIns: string;
  secAmt: string;
  secPostDt: string;
  secChkDetails: string;
  secRecDt: string;
  secChkAmt: string;
  secCmnt: string;
  patAmt: string;
  patRecDt: string;
  secDenialCode: string;
}

type FeedbackStatus = 'success' | 'error' | null;

interface FeedbackMessage {
  status: FeedbackStatus;
  message: string;
}

// Format display value with N/A for null/undefined values
const formatDisplayValue = (value: any): string => {
  if (value === null || value === undefined || value === '') {
    return 'N/A';
  }
  return String(value);
};

// Format value for input field (avoid "N/A" in actual inputs)
const formatInputValue = (value: any): string => {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value);
};

const ClaimTabs: React.FC<ClaimTabsProps> = ({ claim }) => {
  const { updateClaim, isLoading } = useClaims();
  const [activeTab, setActiveTab] = useState<TabType>('claim');
  const [showTooltip, setShowTooltip] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackMessage>({ status: null, message: '' });
  const [localIsLoading, setLocalIsLoading] = useState(false);
  
  // Reference to track whether forms have been initialized
  const initializedRef = useRef(false);
  const previousClaimRef = useRef(claim);
  
  // State for claim details form
  const [claimDetailsForm, setClaimDetailsForm] = useState<ClaimDetailsForm>({
    oaClaimId: formatInputValue(claim.oa_claim_id),
    oaVisitId: formatInputValue(claim.oa_visit_id),
    chargeDt: formatInputValue(claim.charge_dt),
    chargeAmount: claim.charge_amt !== null ? claim.charge_amt.toString() : '',
  });

  // State for primary insurance form
  const [primaryForm, setPrimaryForm] = useState<PrimaryInsuranceForm>({
    primIns: formatInputValue(claim.prim_ins),
    primAmt: claim.prim_amt !== null ? claim.prim_amt.toString() : '',
    primPostDt: formatInputValue(claim.prim_post_dt),
    primChkDetails: formatInputValue(claim.prim_chk_det),
    primRecDt: formatInputValue(claim.prim_recv_dt),
    primChkAmt: claim.prim_chk_amt !== null ? claim.prim_chk_amt.toString() : '',
    primCmnt: formatInputValue(claim.prim_cmt),
    primDenialCode: formatInputValue(claim.claim_status_type),
  });

  // State for secondary insurance form
  const [secondaryForm, setSecondaryForm] = useState<SecondaryInsuranceForm>({
    secIns: formatInputValue(claim.sec_ins),
    secAmt: claim.sec_amt !== null ? claim.sec_amt.toString() : '',
    secPostDt: formatInputValue(claim.sec_post_dt),
    secChkDetails: formatInputValue(claim.sec_chk_det),
    secRecDt: formatInputValue(claim.sec_recv_dt),
    secChkAmt: claim.sec_chk_amt !== null ? claim.sec_chk_amt.toString() : '',
    secCmnt: formatInputValue(claim.sec_cmt),
    patAmt: claim.pat_amt !== null ? claim.pat_amt.toString() : '',
    patRecDt: formatInputValue(claim.pat_recv_dt),
    secDenialCode: formatInputValue(claim.sec_denial_code),
  });

  // Initialize forms only once when component mounts or when claim ID changes
  useEffect(() => {
    const isNewClaim = claim.id !== previousClaimRef.current.id;
    
    if (!initializedRef.current || isNewClaim) {
      setClaimDetailsForm({
        oaClaimId: formatInputValue(claim.oa_claim_id),
        oaVisitId: formatInputValue(claim.oa_visit_id),
        chargeDt: formatInputValue(claim.charge_dt),
        chargeAmount: claim.charge_amt !== null ? claim.charge_amt.toString() : '',
      });
      
      setPrimaryForm({
        primIns: formatInputValue(claim.prim_ins),
        primAmt: claim.prim_amt !== null ? claim.prim_amt.toString() : '',
        primPostDt: formatInputValue(claim.prim_post_dt),
        primChkDetails: formatInputValue(claim.prim_chk_det),
        primRecDt: formatInputValue(claim.prim_recv_dt),
        primChkAmt: claim.prim_chk_amt !== null ? claim.prim_chk_amt.toString() : '',
        primCmnt: formatInputValue(claim.prim_cmt),
        primDenialCode: formatInputValue(claim.claim_status_type),
      });
      
      setSecondaryForm({
        secIns: formatInputValue(claim.sec_ins),
        secAmt: claim.sec_amt !== null ? claim.sec_amt.toString() : '',
        secPostDt: formatInputValue(claim.sec_post_dt),
        secChkDetails: formatInputValue(claim.sec_chk_det),
        secRecDt: formatInputValue(claim.sec_recv_dt),
        secChkAmt: claim.sec_chk_amt !== null ? claim.sec_chk_amt.toString() : '',
        secCmnt: formatInputValue(claim.sec_cmt),
        patAmt: claim.pat_amt !== null ? claim.pat_amt.toString() : '',
        patRecDt: formatInputValue(claim.pat_recv_dt),
        secDenialCode: formatInputValue(claim.sec_denial_code),
      });
      
      initializedRef.current = true;
      previousClaimRef.current = claim;
    }
  }, [claim]);
  
  // Clear feedback after 5 seconds
  useEffect(() => {
    if (feedback.status) {
      const timer = setTimeout(() => {
        setFeedback({ status: null, message: '' });
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const isClaimDetailsComplete = () => {
    return (
      claimDetailsForm.oaClaimId.trim() !== '' &&
      claimDetailsForm.oaVisitId.trim() !== '' &&
      claimDetailsForm.chargeDt.trim() !== '' &&
      claimDetailsForm.chargeAmount.trim() !== ''
    );
  };

  const handleTabClick = (tab: TabType) => {
    if (tab !== 'claim' && !isClaimDetailsComplete()) {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 3000);
      return;
    }
    setActiveTab(tab);
  };

  const handleClaimDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setClaimDetailsForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    // No auto-save, only update local state
  };

  const handlePrimaryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPrimaryForm(prev => ({
      ...prev,
      [name]: value,
    }));
    // No auto-save, only update local state
  };

  const handleSecondaryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSecondaryForm(prev => ({
      ...prev,
      [name]: value,
    }));
    // No auto-save, only update local state
  };

  const handleSaveClaimDetails = async () => {
    // Validate required fields
    if (!isClaimDetailsComplete()) {
      setFeedback({
        status: 'error',
        message: 'Please fill in all required fields in the Claim Details tab.'
      });
      return;
    }
    
    try {
      setLocalIsLoading(true);
      
      // Create the update object with only the fields being updated
      const updateData = {
        id: claim.id,
        oa_claim_id: claimDetailsForm.oaClaimId,
        oa_visit_id: claimDetailsForm.oaVisitId,
        charge_dt: claimDetailsForm.chargeDt,
        charge_amt: parseFloat(claimDetailsForm.chargeAmount) || 0
      };
      
      await updateClaim(updateData);
      
      setFeedback({
        status: 'success',
        message: 'Claim details saved successfully!'
      });
    } catch (err) {
      setFeedback({
        status: 'error',
        message: 'An error occurred while saving claim details.'
      });
      console.error('Error saving claim details:', err);
    } finally {
      setLocalIsLoading(false);
    }
  };

  const handleSavePrimary = async () => {
    try {
      setLocalIsLoading(true);
      
      // Create the update object with only the fields being updated
      const updateData = {
        id: claim.id,
        prim_ins: primaryForm.primIns.trim() || null,
        prim_amt: primaryForm.primAmt ? parseFloat(primaryForm.primAmt) : null,
        prim_post_dt: primaryForm.primPostDt.trim() || null,
        prim_chk_det: primaryForm.primChkDetails.trim() || null,
        prim_recv_dt: primaryForm.primRecDt.trim() || null,
        prim_chk_amt: primaryForm.primChkAmt ? parseFloat(primaryForm.primChkAmt) : null,
        prim_cmt: primaryForm.primCmnt.trim() || null,
        claim_status_type: primaryForm.primDenialCode.trim() || null
      };
      
      try {
        const result = await updateClaim(updateData);
        
        // Always show success if the function completes without throwing an error
        // Even if result.success is undefined, assume it worked if we got here
        setFeedback({
          status: 'success',
          message: 'Primary insurance details saved successfully!'
        });
      } catch (updateError) {
        console.error('Error in updateClaim operation:', updateError);
        throw updateError; // Re-throw to be caught by the outer catch
      }
    } catch (err) {
      setFeedback({
        status: 'error',
        message: 'An error occurred while saving primary insurance details.'
      });
      console.error('Error saving primary insurance details:', err);
    } finally {
      setLocalIsLoading(false);
    }
  };

  const handleSaveSecondary = async () => {
    try {
      setLocalIsLoading(true);
      
      // Create the update object with only the fields being updated
      const updateData = {
        id: claim.id,
        // Properly handle each field with appropriate type conversion
        sec_ins: secondaryForm.secIns.trim() || null,
        sec_amt: secondaryForm.secAmt && secondaryForm.secAmt.trim() !== '' ? parseFloat(secondaryForm.secAmt) : null,
        sec_post_dt: secondaryForm.secPostDt.trim() || null,
        sec_chk_det: secondaryForm.secChkDetails.trim() || null,
        sec_recv_dt: secondaryForm.secRecDt.trim() || null,
        sec_chk_amt: secondaryForm.secChkAmt && secondaryForm.secChkAmt.trim() !== '' ? parseFloat(secondaryForm.secChkAmt) : null,
        sec_cmt: secondaryForm.secCmnt.trim() || null,
        // Removed sec_denial_code as it doesn't exist in the database schema
        pat_amt: secondaryForm.patAmt && secondaryForm.patAmt.trim() !== '' ? parseFloat(secondaryForm.patAmt) : null,
        pat_recv_dt: secondaryForm.patRecDt.trim() || null
      };
      
      console.log('Saving secondary insurance with data:', updateData);
      
      // Call updateClaim and wait for the result
      const result = await updateClaim(updateData);
      
      // If we get here without an exception, the update was successful
      setFeedback({
        status: 'success',
        message: 'Secondary insurance details saved successfully!'
      });
    } catch (err) {
      console.error('Error saving secondary insurance details:', err);
      setFeedback({
        status: 'error',
        message: 'An error occurred while saving secondary insurance details.'
      });
    } finally {
      setLocalIsLoading(false);
    }
  };

  const claimDetailsComplete = isClaimDetailsComplete();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Feedback message */}
      {feedback.status && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-4 p-4 rounded-md flex items-center gap-2 ${
            feedback.status === 'success' ? 'bg-success-900/30 text-success-400' : 'bg-error-900/30 text-error-400'
          }`}
        >
          {feedback.status === 'success' ? (
            <CheckCircle size={18} className="text-success-400" />
          ) : (
            <XCircle size={18} className="text-error-400" />
          )}
          <span>{feedback.message}</span>
        </motion.div>
      )}
      
      <GlassCard className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex border-b border-white/10 flex-1">
            <button
              onClick={() => handleTabClick('claim')}
              className={`px-4 py-3 font-medium transition-colors relative ${
                activeTab === 'claim'
                  ? 'text-accent-400 border-b-2 border-accent-400'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Claim Details
            </button>
            <button
              onClick={() => handleTabClick('primary')}
              className={`px-4 py-3 font-medium transition-colors relative ${
                activeTab === 'primary'
                  ? 'text-accent-400 border-b-2 border-accent-400'
                  : 'text-white/70 hover:text-white'
              } ${!claimDetailsComplete ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!claimDetailsComplete}
            >
              Primary Insurance
              {activeTab !== 'claim' && showTooltip && !claimDetailsComplete && (
                <div className="absolute top-full left-0 mt-2 w-64 p-2 bg-dark-500 text-white text-sm rounded shadow-lg z-10">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={16} className="text-error-400" />
                    <span>Please complete Claim Details first</span>
                  </div>
                </div>
              )}
            </button>
            <button
              onClick={() => handleTabClick('secondary')}
              className={`px-4 py-3 font-medium transition-colors relative ${
                activeTab === 'secondary'
                  ? 'text-accent-400 border-b-2 border-accent-400'
                  : 'text-white/70 hover:text-white'
              } ${!claimDetailsComplete ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!claimDetailsComplete}
            >
              Secondary Insurance
            </button>
          </div>
          
          {/* Save button in tab header */}
          <Button
            onClick={
              activeTab === 'claim' 
                ? handleSaveClaimDetails 
                : activeTab === 'primary' 
                  ? handleSavePrimary 
                  : handleSaveSecondary
            }
            icon={<Save size={16} />}
            disabled={localIsLoading || (activeTab !== 'claim' && !claimDetailsComplete)}
            className="ml-4"
          >
            {localIsLoading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </GlassCard>

      {/* Claim Details Form */}
      {activeTab === 'claim' && (
        <GlassCard>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FileText className="text-accent-400" size={20} />
              Claim Details
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="mb-4">
              <label className="block text-white/80 mb-2 font-medium">
                OA Claim ID <span className="text-error-400">*</span>
              </label>
              <input
                name="oaClaimId"
                value={claimDetailsForm.oaClaimId}
                onChange={handleClaimDetailsChange}
                className="glass-input w-full"
                type="text"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-white/80 mb-2 font-medium">
                OA Visit ID <span className="text-error-400">*</span>
              </label>
              <input
                name="oaVisitId"
                value={claimDetailsForm.oaVisitId}
                onChange={handleClaimDetailsChange}
                className="glass-input w-full"
                type="text"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-white/80 mb-2 font-medium">
                Charge Date <span className="text-error-400">*</span>
              </label>
              <div className="flex flex-col">
                <input
                  name="chargeDt"
                  type="date"
                  value={claimDetailsForm.chargeDt}
                  onChange={handleClaimDetailsChange}
                  className="glass-input w-full"
                  required
                />
                <span className="text-xs text-white/50 mt-1">
                  {claim.charge_dt ? `DB value: ${new Date(claim.charge_dt).toLocaleDateString()}` : 'No date in database'}
                </span>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-white/80 mb-2 font-medium">
                Charge Amount <span className="text-error-400">*</span>
              </label>
              <input
                name="chargeAmount"
                type="number"
                step="0.01"
                value={claimDetailsForm.chargeAmount}
                onChange={handleClaimDetailsChange}
                className="glass-input w-full"
                required
              />
            </div>
          </div>
        </GlassCard>
      )}

      {/* Primary Insurance Form */}
      {activeTab === 'primary' && claimDetailsComplete && (
        <GlassCard>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FileText className="text-accent-400" size={20} />
              Primary Insurance
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassInput
              label="Primary Insurance"
              name="primIns"
              value={primaryForm.primIns}
              onChange={handlePrimaryChange}
            />
            <GlassInput
              label="Primary Amount"
              name="primAmt"
              type="number"
              step="0.01"
              value={primaryForm.primAmt}
              onChange={handlePrimaryChange}
            />
            <GlassInput
              label="Primary Post Date"
              name="primPostDt"
              type="date"
              value={primaryForm.primPostDt}
              onChange={handlePrimaryChange}
            />
            <GlassInput
              label="Primary Check Details"
              name="primChkDetails"
              value={primaryForm.primChkDetails}
              onChange={handlePrimaryChange}
            />
            <GlassInput
              label="Primary Received Date"
              name="primRecDt"
              type="date"
              value={primaryForm.primRecDt}
              onChange={handlePrimaryChange}
            />
            <GlassInput
              label="Primary Check Amount"
              name="primChkAmt"
              type="number"
              step="0.01"
              value={primaryForm.primChkAmt}
              onChange={handlePrimaryChange}
            />
            <div className="md:col-span-2">
              <label className="block text-white/80 mb-2 font-medium">
                Primary Comment
              </label>
              <textarea
                name="primCmnt"
                value={primaryForm.primCmnt}
                onChange={handlePrimaryChange}
                className="glass-input w-full min-h-[120px]"
              ></textarea>
            </div>
            <GlassInput
              label="Primary Denial Code"
              name="primDenialCode"
              value={primaryForm.primDenialCode}
              onChange={handlePrimaryChange}
            />
          </div>
        </GlassCard>
      )}

      {/* Secondary Insurance Form */}
      {activeTab === 'secondary' && claimDetailsComplete && (
        <GlassCard>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FileText className="text-accent-400" size={20} />
              Secondary Insurance
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassInput
              label="Secondary Insurance"
              name="secIns"
              value={secondaryForm.secIns}
              onChange={handleSecondaryChange}
            />
            <GlassInput
              label="Secondary Amount"
              name="secAmt"
              type="number"
              step="0.01"
              value={secondaryForm.secAmt}
              onChange={handleSecondaryChange}
            />
            <GlassInput
              label="Secondary Post Date"
              name="secPostDt"
              type="date"
              value={secondaryForm.secPostDt}
              onChange={handleSecondaryChange}
            />
            <GlassInput
              label="Secondary Check Details"
              name="secChkDetails"
              value={secondaryForm.secChkDetails}
              onChange={handleSecondaryChange}
            />
            <GlassInput
              label="Secondary Received Date"
              name="secRecDt"
              type="date"
              value={secondaryForm.secRecDt}
              onChange={handleSecondaryChange}
            />
            <GlassInput
              label="Secondary Check Amount"
              name="secChkAmt"
              type="number"
              step="0.01"
              value={secondaryForm.secChkAmt}
              onChange={handleSecondaryChange}
            />
            <div className="md:col-span-2">
              <label className="block text-white/80 mb-2 font-medium">
                Secondary Comment
              </label>
              <textarea
                name="secCmnt"
                value={secondaryForm.secCmnt}
                onChange={handleSecondaryChange}
                className="glass-input w-full min-h-[120px]"
              ></textarea>
            </div>
            <GlassInput
              label="Patient Amount"
              name="patAmt"
              type="number"
              step="0.01"
              value={secondaryForm.patAmt}
              onChange={handleSecondaryChange}
            />
            <GlassInput
              label="Patient Received Date"
              name="patRecDt"
              type="date"
              value={secondaryForm.patRecDt}
              onChange={handleSecondaryChange}
            />
            <GlassInput
              label="Secondary Denial Code"
              name="secDenialCode"
              value={secondaryForm.secDenialCode}
              onChange={handleSecondaryChange}
            />
          </div>
        </GlassCard>
      )}

      {/* Placeholder for incomplete claim details */}
      {(activeTab === 'primary' || activeTab === 'secondary') && !claimDetailsComplete && (
        <GlassCard className="bg-dark-400/50">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle size={48} className="text-warning-400 mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">Complete Claim Details First</h3>
            <p className="text-white/60 max-w-md">
              Please fill in and save all required fields in the Claim Details tab before accessing this section.
            </p>
            <Button
              variant="secondary"
              className="mt-6"
              onClick={() => setActiveTab('claim')}
            >
              Go to Claim Details
            </Button>
          </div>
        </GlassCard>
      )}
    </motion.div>
  );
};

export default ClaimTabs;