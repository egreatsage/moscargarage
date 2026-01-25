// src/lib/mpesa.js
import axios from 'axios';

const MPESA_BASE_URL = process.env.MPESA_ENV === 'production' 
  ? 'https://api.safaricom.co.ke' 
  : 'https://sandbox.safaricom.co.ke';

// Development mode flag
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

/**
 * Get M-Pesa OAuth token
 */
async function getAccessToken() {
  try {
    const auth = Buffer.from(
      `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
    ).toString('base64');

    const response = await axios.get(
      `${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error('Error getting M-Pesa access token:', error.response?.data || error.message);
    throw new Error('Failed to get M-Pesa access token');
  }
}

/**
 * Generate M-Pesa password
 */
function generatePassword() {
  const timestamp = new Date()
    .toISOString()
    .replace(/[^0-9]/g, '')
    .slice(0, 14);
  
  const password = Buffer.from(
    `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
  ).toString('base64');

  return { password, timestamp };
}

/**
 * Validate callback URL configuration
 */
function validateCallbackUrl() {
  const callbackUrl = process.env.NEXT_PUBLIC_APP_URL;
  
  // In development, allow both HTTP and HTTPS
  if (IS_DEVELOPMENT) {
    if (!callbackUrl) {
      console.warn('⚠️  NEXT_PUBLIC_APP_URL is not set. Using fallback for development.');
      return {
        valid: true,
        url: 'http://localhost:3000',
        warning: 'Using localhost - M-Pesa callbacks will not work without ngrok/tunneling'
      };
    }
    
    // Allow both http and https in development
    if (callbackUrl.startsWith('http://') || callbackUrl.startsWith('https://')) {
      return { valid: true, url: callbackUrl };
    }
  }
  
  // In production, require HTTPS
  if (!callbackUrl || !callbackUrl.startsWith('https://')) {
    return {
      valid: false,
      error: 'Invalid CallBackURL configuration. The NEXT_PUBLIC_APP_URL environment variable must be set to a valid public HTTPS URL. For local development, use a tool like ngrok to expose your localhost.'
    };
  }
  
  return { valid: true, url: callbackUrl };
}

/**
 * Initiate STK Push
 * @param {string} phoneNumber - Phone number in format 254XXXXXXXXX
 * @param {number} amount - Amount to charge
 * @param {string} accountReference - Reference for the transaction (e.g., booking number)
 * @param {string} transactionDesc - Description of the transaction
 */
export async function initiateSTKPush(phoneNumber, amount, accountReference, transactionDesc) {
  try {
    // Validate callback URL
    const urlValidation = validateCallbackUrl();
    
    if (!urlValidation.valid) {
      console.error('STK Push Error:', urlValidation.error);
      return {
        success: false,
        error: urlValidation.error,
      };
    }
    
    if (urlValidation.warning) {
      console.warn('STK Push Warning:', urlValidation.warning);
    }
    
    const accessToken = await getAccessToken();
    const { password, timestamp } = generatePassword();

    const payload = {
      BusinessShortCode: process.env.MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(amount), // Ensure amount is an integer
      PartyA: phoneNumber,
      PartyB: process.env.MPESA_SHORTCODE,
      PhoneNumber: phoneNumber,
      CallBackURL: `${urlValidation.url}/api/mpesa/callback`,
      AccountReference: accountReference,
      TransactionDesc: transactionDesc,
    };

    console.log('📱 Initiating STK Push:', {
      phone: phoneNumber,
      amount: payload.Amount,
      reference: accountReference,
      callbackUrl: payload.CallBackURL,
      environment: MPESA_BASE_URL
    });

    const response = await axios.post(
      `${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ STK Push initiated successfully:', response.data);

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('❌ Error initiating STK push:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.errorMessage || 'Failed to initiate payment',
    };
  }
}

/**
 * Query STK Push transaction status
 * @param {string} checkoutRequestID - The checkout request ID from STK push
 */
export async function querySTKPushStatus(checkoutRequestID) {
  try {
    const accessToken = await getAccessToken();
    const { password, timestamp } = generatePassword();

    const payload = {
      BusinessShortCode: process.env.MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestID,
    };

    const response = await axios.post(
      `${MPESA_BASE_URL}/mpesa/stkpushquery/v1/query`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('Error querying STK push status:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.errorMessage || 'Failed to query payment status',
    };
  }
}

/**
 * Process M-Pesa callback data
 * @param {object} callbackData - The callback data from M-Pesa
 */
export function processCallback(callbackData) {
  try {
    const { Body } = callbackData;
    const { stkCallback } = Body;

    const result = {
      merchantRequestID: stkCallback.MerchantRequestID,
      checkoutRequestID: stkCallback.CheckoutRequestID,
      resultCode: stkCallback.ResultCode,
      resultDesc: stkCallback.ResultDesc,
    };

    // If payment was successful, extract additional details
    if (stkCallback.ResultCode === 0) {
      const callbackMetadata = stkCallback.CallbackMetadata?.Item || [];
      
      result.amount = callbackMetadata.find(item => item.Name === 'Amount')?.Value;
      result.mpesaReceiptNumber = callbackMetadata.find(item => item.Name === 'MpesaReceiptNumber')?.Value;
      result.transactionDate = callbackMetadata.find(item => item.Name === 'TransactionDate')?.Value;
      result.phoneNumber = callbackMetadata.find(item => item.Name === 'PhoneNumber')?.Value;
    }

    return result;
  } catch (error) {
    console.error('Error processing M-Pesa callback:', error);
    throw new Error('Failed to process callback data');
  }
}

/**
 * Validate phone number format
 * @param {string} phoneNumber - Phone number to validate
 */
export function validatePhoneNumber(phoneNumber) {
  // Remove any spaces or special characters
  const cleaned = phoneNumber.replace(/[\s\-\(\)]/g, '');
  
  // Check if it matches the required format (254XXXXXXXXX)
  const regex = /^254[0-9]{9}$/;
  
  if (regex.test(cleaned)) {
    return { valid: true, formatted: cleaned };
  }
  
  // Try to convert from other formats
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    return { valid: true, formatted: `254${cleaned.slice(1)}` };
  }
  
  if (cleaned.startsWith('+254') && cleaned.length === 13) {
    return { valid: true, formatted: cleaned.slice(1) };
  }
  
  return { valid: false, formatted: null };
}