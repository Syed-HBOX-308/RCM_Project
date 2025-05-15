import axios from 'axios';
import { SearchFilters } from '../types/claim';

// Make sure this URL matches your backend server address and port
const API_BASE_URL = 'http://localhost:5000/api';

// Configure axios defaults for better reliability
axios.defaults.timeout = 10000; // 10 second timeout
axios.defaults.headers.common['Content-Type'] = 'application/json';

/**
 * Fetch claims from the API with optional filters
 */
export const fetchClaims = async (filters?: SearchFilters) => {
  try {
    // Build query parameters based on filters
    const params: Record<string, string> = {};
    
    if (filters) {
      if (filters.patientId) {
        params.patient_id = filters.patientId;
      }
      if (filters.cptId) {
        params.cpt_id = filters.cptId;
      }
      if (filters.dos) {
        params.service_end = filters.dos; // Changed from service_start to service_end
      }
    }
    
    console.log('Fetching claims with params:', params);
    const response = await axios.get(`${API_BASE_URL}/claims`, { params });
    console.log('Claims API response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching claims:', error);
    return { 
      success: false, 
      error: 'Failed to fetch claims', 
      message: error.message || 'Network error',
      data: []
    };
  }
};

/**
 * Get a single claim by ID
 */
export const fetchClaimById = async (id: string) => {
  try {
    console.log(`Fetching claim with ID: ${id}`);
    const response = await axios.get(`${API_BASE_URL}/claims/${id}`);
    console.log(`Claim ${id} response:`, response.data);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching claim with ID ${id}:`, error);
    return { 
      success: false, 
      error: `Failed to fetch claim with ID ${id}`, 
      message: error.message || 'Network error',
      data: null
    };
  }
};

/**
 * Format date values to YYYY-MM-DD format required by the backend
 */
const formatDateValue = (value: any): any => {
  if (!value) return value;
  
  // Check if it's already a string in ISO format
  if (typeof value === 'string') {
    if (value.match(/^\d{4}-\d{2}-\d{2}$/)) {
      // Already in YYYY-MM-DD format
      return value;
    }
    
    try {
      // Try to parse as date and format
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    } catch (e) {
      console.warn('Failed to format date value:', value);
    }
  }
  
  return value;
};

/**
 * Update a claim with retry mechanism
 */
export const updateClaim = async (id: string, data: any, retries = 1) => {
  try {
    console.log(`Updating claim with ID: ${id}`, data);
    
    // Ensure the data has the correct format expected by the API
    const sanitizedData = { ...data };
    
    // Convert any numeric strings to actual numbers for fields that should be numbers
    const numericFields = [
      'charge_amt', 'allowed_amt', 'allowed_add_amt', 'allowed_exp_amt', 
      'total_amt', 'charges_adj_amt', 'write_off_amt', 'bal_amt', 'reimb_pct',
      'prim_amt', 'prim_chk_amt', 'sec_amt', 'sec_chk_amt', 'pat_amt'
    ];
    
    // Format numeric fields
    numericFields.forEach(field => {
      if (sanitizedData[field] !== undefined && sanitizedData[field] !== null) {
        // Ensure empty strings are converted to null rather than 0
        if (sanitizedData[field] === '') {
          sanitizedData[field] = null;
        } else {
          const numVal = parseFloat(sanitizedData[field]);
          if (!isNaN(numVal)) {
            sanitizedData[field] = numVal;
          }
        }
      }
    });

    // Format date fields to YYYY-MM-DD
    const dateFields = [
      'charge_dt', 'prim_post_dt', 'prim_recv_dt',
      'sec_post_dt', 'sec_recv_dt', 'pat_recv_dt'
    ];

    dateFields.forEach(field => {
      if (sanitizedData[field] !== undefined) {
        if (sanitizedData[field] === null || sanitizedData[field] === '') {
          sanitizedData[field] = null;
        } else {
          sanitizedData[field] = formatDateValue(sanitizedData[field]);
        }
      }
    });
    
    // Remove any undefined or legacy fields that the API doesn't expect
    const legacyFields = ['checkNumber', 'amount', 'status', 'updatedAt', 'createdAt'];
    legacyFields.forEach(field => {
      if (field in sanitizedData) {
        delete sanitizedData[field];
      }
    });
    
    // Log the exact URL and data being sent
    console.log(`Making PUT request to: ${API_BASE_URL}/claims/${id}`);
    console.log('Request payload:', JSON.stringify(sanitizedData));
    
    // Add a timestamp to avoid caching issues
    const timestamp = new Date().getTime();
    const url = `${API_BASE_URL}/claims/${id}?_t=${timestamp}`;
    
    // Set specific headers to ensure proper processing
    const headers = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    };
    
    // Make the request with enhanced configuration
    const response = await axios.put(url, sanitizedData, { 
      headers,
      timeout: 15000 // Increase timeout to 15 seconds
    });
    
    console.log(`Claim ${id} update response:`, response.data);
    return response.data;
  } catch (error: any) {
    console.error(`Error updating claim with ID ${id}:`, error);
    console.error(`Error details: ${error.message}`);
    
    // Check for network connectivity issues
    if (error.code === 'ECONNREFUSED' || error.code === 'ECONNABORTED') {
      console.error('Connection refused or aborted. Is the backend server running?');
    }
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(`Server responded with status: ${error.response.status}`);
      console.error(`Response headers:`, error.response.headers);
      console.error(`Response data:`, error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from server. Is the backend running?');
      console.error('Request details:', error.request);
    }
    
    // Implement retry logic
    if (retries > 0) {
      console.log(`Retrying update for claim ${id}. Attempts remaining: ${retries}`);
      // Wait for 1.5 seconds before retrying (increased from 1 second)
      await new Promise(resolve => setTimeout(resolve, 1500));
      return updateClaim(id, data, retries - 1);
    }
    
    return { 
      success: false, 
      error: `Failed to update claim with ID ${id}`, 
      message: error.message || 'Network error',
      data: null
    };
  }
};

/**
 * Fetch history for a specific claim
 */
export const fetchClaimHistory = async (id: string) => {
  try {
    console.log(`Fetching history for claim with ID: ${id}`);
    const response = await axios.get(`${API_BASE_URL}/claims/${id}/history`);
    console.log(`History for claim ${id} response:`, response.data);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching history for claim with ID ${id}:`, error);
    return { 
      success: false, 
      error: `Failed to fetch history for claim with ID ${id}`, 
      message: error.message || 'Network error',
      data: []
    };
  }
};

/**
 * Fetch all change history with optional filters
 */
export const fetchAllHistory = async (filters?: {
  user_id?: number;
  cpt_id?: number;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}) => {
  try {
    const params: Record<string, string | number> = {};
    
    if (filters) {
      if (filters.user_id) {
        params.user_id = filters.user_id;
      }
      if (filters.cpt_id) {
        params.cpt_id = filters.cpt_id;
      }
      if (filters.start_date) {
        params.start_date = filters.start_date;
      }
      if (filters.end_date) {
        params.end_date = filters.end_date;
      }
      if (filters.page) {
        params.page = filters.page;
      }
      if (filters.limit) {
        params.limit = filters.limit;
      }
    }
    
    console.log('Fetching change history with params:', params);
    const response = await axios.get(`${API_BASE_URL}/claims/history/all`, { params });
    console.log('History response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching change history:', error);
    return { 
      success: false, 
      error: 'Failed to fetch change history', 
      message: error.message || 'Network error',
      data: []
    };
  }
};