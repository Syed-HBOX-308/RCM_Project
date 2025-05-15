import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { History, ChevronDown, ChevronUp, User, Clock, RefreshCw } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import { ChangeLog } from '../../types/claim';
import { fetchClaimHistory } from '../../services/claimService';

interface HistorySectionProps {
  claimId: string | number;
}

// Cache to store history data by claimId
const historyCache: Record<string, {
  data: ChangeLog[];
  timestamp: number;
}> = {};

// Cache expiration time (5 minutes)
const CACHE_EXPIRY = 5 * 60 * 1000;

const HistorySection: React.FC<HistorySectionProps> = ({ claimId }) => {
  const [history, setHistory] = useState<ChangeLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  
  // Use a ref to track if the component is mounted
  const isMounted = useRef(true);
  
  // Track if we've loaded data for this claimId
  const dataLoadedRef = useRef(false);

  // Memoized load history function to prevent unnecessary re-creation
  const loadHistory = useCallback(async (forceRefresh = false) => {
    const cacheKey = claimId.toString();
    const now = Date.now();
    
    // Check if we have fresh cached data and not forcing refresh
    if (!forceRefresh && 
        historyCache[cacheKey] && 
        now - historyCache[cacheKey].timestamp < CACHE_EXPIRY) {
      console.log(`Using cached history data for claim ${cacheKey}`);
      setHistory(historyCache[cacheKey].data);
      return;
    }
    
    // Don't fetch if we've fetched recently (within last 10 seconds) unless forced
    if (!forceRefresh && now - lastFetchTime < 10000) {
      console.log('Skipping history fetch - throttled');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setLastFetchTime(now);
    
    try {
      const response = await fetchClaimHistory(cacheKey);
      
      // Make sure component is still mounted before updating state
      if (!isMounted.current) return;
      
      if (response.success) {
        setHistory(response.data);
        
        // Cache the result
        historyCache[cacheKey] = {
          data: response.data,
          timestamp: now
        };
        
        dataLoadedRef.current = true;
      } else {
        // Only set error for real API errors, not for empty datasets
        if (response.message?.includes('status code 500')) {
          setError('Unable to load history right now. Please try again later.');
        } else if (response.message?.includes('Network Error')) {
          setError('Network error. Please check your connection and try again.');
        } else {
          // Don't show error for empty datasets
          console.log('API response indicates no history data available');
        }
        setHistory([]);
      }
    } catch (err) {
      // Make sure component is still mounted before updating state
      if (!isMounted.current) return;
      
      console.error('Error loading history:', err);
      setError('An error occurred while loading history. Please try again later.');
      setHistory([]);
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [claimId]);

  // Load data on mount and when claimId changes
  useEffect(() => {
    // Reset the loaded flag when claim ID changes
    dataLoadedRef.current = false;
    
    // Only load if we haven't loaded data for this claim yet
    if (!dataLoadedRef.current) {
      loadHistory(false);
    }
    
    // Cleanup function to set isMounted to false when component unmounts
    return () => {
      isMounted.current = false;
    };
  }, [claimId, loadHistory]);
  
  // Set isMounted to true when the component mounts
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Helper function to format field names for display
  const formatFieldName = (fieldName: string): string => {
    return fieldName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Helper function to format date/time
  const formatDateTime = (dateTime: string): string => {
    try {
      const date = new Date(dateTime);
      return date.toLocaleString();
    } catch (err) {
      return dateTime;
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Handle manual refresh
  const handleRefresh = () => {
    loadHistory(true); // Force refresh
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mt-6"
    >
      <GlassCard>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <History className="text-accent-400" size={20} />
            Change History
          </h2>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleRefresh} 
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              disabled={isLoading}
              title="Refresh history"
            >
              <RefreshCw size={18} className={`text-white/70 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={toggleExpand} 
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              title={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? <ChevronUp size={18} className="text-white/70" /> : <ChevronDown size={18} className="text-white/70" />}
            </button>
          </div>
        </div>
        
        {isExpanded && (
          <div className="mt-4">
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="ml-3 text-white/70">Loading history...</p>
              </div>
            ) : error ? (
              <div className="bg-error-900/30 text-error-400 p-4 rounded-md">
                <p>{error}</p>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-6 text-white/60">
                <History size={32} className="mx-auto mb-3 opacity-40" />
                <p className="text-lg font-medium mb-1">No History Available</p>
                <p>No changes have been recorded for this claim yet.</p>
                <button 
                  onClick={handleRefresh}
                  className="mt-4 text-accent-400 hover:text-accent-300 flex items-center gap-2 mx-auto"
                >
                  <RefreshCw size={14} />
                  <span>Refresh</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((log) => (
                  <div key={log.id} className="bg-white/5 rounded-md p-4">
                    <div className="flex flex-wrap gap-4 justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-accent-400" />
                        <span className="font-medium text-white/90">{log.username}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-white/70" />
                        <span className="text-white/70">{formatDateTime(log.timestamp)}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 mt-3">
                      <div className="flex flex-wrap">
                        <div className="w-full md:w-1/3 mb-1 text-white/60">
                          Field Name:
                        </div>
                        <div className="w-full md:w-2/3 font-medium">
                          {formatFieldName(log.field_name)}
                        </div>
                      </div>

                      <div className="flex flex-wrap">
                        <div className="w-full md:w-1/3 mb-1 text-white/60">
                          Old Value:
                        </div>
                        <div className="w-full md:w-2/3 bg-error-900/20 text-error-300 px-2 py-1 rounded">
                          {log.old_value || 'N/A'}
                        </div>
                      </div>

                      <div className="flex flex-wrap">
                        <div className="w-full md:w-1/3 mb-1 text-white/60">
                          New Value:
                        </div>
                        <div className="w-full md:w-2/3 bg-success-900/20 text-success-300 px-2 py-1 rounded">
                          {log.new_value || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
};

export default HistorySection;