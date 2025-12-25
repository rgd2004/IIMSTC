import React, { useState, useEffect } from 'react';
import { adminAPI } from '../utils/api';
import './ClientPayment.css';
import toast from 'react-hot-toast';

const ClientPayment = ({ contract, onPaymentSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  const [razorpayConfigured, setRazorpayConfigured] = useState(null);

  // Load Razorpay script on component mount
  useEffect(() => {
    // Check if Razorpay is configured on backend
    (async () => {
      try {
        const response = await adminAPI.getPaymentRequests?.() || { data: {} };
        // Try to fetch test endpoint
        const testResponse = await fetch('/api/payments/test');
        if (testResponse.ok) {
          const data = await testResponse.json();
          console.log('✅ Razorpay configuration:', data);
          setRazorpayConfigured(data.razorpayConfigured);
          if (!data.razorpayConfigured) {
            console.warn('⚠️ Razorpay not configured on backend');
          }
        }
      } catch (err) {
        console.log('ℹ️ Could not check Razorpay configuration');
      }
    })();

    console.log('📌 Loading Razorpay script...');
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      console.log('✅ Razorpay script loaded successfully');
      setRazorpayLoaded(true);
    };
    script.onerror = () => {
      console.error('❌ Failed to load Razorpay script');
      setError('Failed to load Razorpay. Please refresh the page.');
      toast.error('Failed to load Razorpay');
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleRazorpayPayment = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!razorpayLoaded) {
      const msg = 'Payment gateway is still loading. Please wait a moment and try again.';
      setError(msg);
      toast.error(msg);
      return;
    }

    if (!window.Razorpay) {
      const msg = 'Razorpay is not loaded. Please refresh the page.';
      setError(msg);
      toast.error(msg);
      return;
    }

    // Validate contract
    if (!contract || !contract._id) {
      const msg = 'Contract information is missing. Please reload the page.';
      setError(msg);
      toast.error(msg);
      console.error('❌ Invalid contract:', contract);
      return;
    }

    if (!contract.totalAmount) {
      const msg = 'Contract amount is missing. Please reload the page.';
      setError(msg);
      toast.error(msg);
      console.error('❌ Invalid contract amount:', contract);
      return;
    }

    setLoading(true);

    try {
      console.log('🔄 Creating payment order for contract:', contract._id);
      console.log('💰 Amount:', contract.totalAmount);
      console.log('📡 API URL:', adminAPI.createPaymentOrder.toString());
      
      // Create payment order
      const orderResponse = await adminAPI.createPaymentOrder(contract._id, {
        amount: contract.totalAmount,
        currency: 'INR',
        contractId: contract._id,
      });

      console.log('✅ Full order response:', orderResponse);
      console.log('✅ Order response data:', orderResponse.data);
      console.log('✅ Response keys:', Object.keys(orderResponse));
      
      // Handle both direct response and nested response.data
      const orderData = orderResponse.data || orderResponse;
      console.log('📋 Order data:', orderData);
      
      const orderId = orderData.orderId || orderData?.data?.orderId;
      const razorpayKeyId = process.env.REACT_APP_RAZORPAY_KEY_ID;

      console.log('🔑 Razorpay Key ID:', razorpayKeyId ? '✅ Set' : '❌ NOT SET');
      console.log('🔑 Raw Key:', razorpayKeyId);
      
      if (!orderId) {
        console.error('❌ No orderId in response:', orderData);
        throw new Error('Failed to create payment order - no order ID received. Response: ' + JSON.stringify(orderData));
      }

      if (!razorpayKeyId) {
        console.error('❌ REACT_APP_RAZORPAY_KEY_ID not set');
        throw new Error('Razorpay Key ID not configured. Please check .env.local file.');
      }

      console.log('✅ Order ID:', orderId);
      console.log('✅ Using Razorpay Key ID:', razorpayKeyId);

      // Razorpay payment options
      const options = {
        key: razorpayKeyId,
        amount: contract.totalAmount * 100, // Amount in paise
        currency: 'INR',
        name: 'PKC CAG',
        description: `Payment for freelance contract - ${contract.jobId?.title || 'Project'}`,
        order_id: orderId,
        handler: async (response) => {
          try {
            console.log('✅ Payment successful, response:', response);
            console.log('🔄 Verifying payment with backend...');

            // Verify payment on backend
            const verifyResponse = await adminAPI.verifyRazorpayPayment(contract._id, {
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });

            console.log('✅ Payment verified:', verifyResponse.data);
            const successMsg = '✅ Payment successful! You can now submit your work details.';
            setSuccess(successMsg);
            toast.success('Payment verified! Submit your work details next.');
            
            if (onPaymentSuccess) {
              onPaymentSuccess(verifyResponse.data);
            }

            // Reset form
            setTimeout(() => {
              setSuccess('');
              setLoading(false);
            }, 2000);
          } catch (verifyErr) {
            console.error('❌ Payment verification failed:', verifyErr);
            const errorMsg = verifyErr.response?.data?.message || 'Payment verification failed. Please contact support.';
            setError(errorMsg);
            toast.error(errorMsg);
            setLoading(false);
          }
        },
        prefill: {
          email: contract.clientId?.email || '',
          contact: contract.clientId?.phone || '',
        },
        theme: {
          color: '#667eea',
        },
        modal: {
          ondismiss: () => {
            console.log('⚠️ User dismissed payment modal');
            setError('Payment cancelled. Please try again.');
            setLoading(false);
          },
        },
      };

      console.log('🎯 Opening Razorpay with options:', {
        key: razorpayKeyId,
        amount: contract.totalAmount * 100,
        orderId: orderId,
      });

      // Open Razorpay checkout
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error('❌ Error initializing payment:', err);
      console.error('Error response status:', err.response?.status);
      console.error('Error response data:', err.response?.data);
      console.error('Error message:', err.message);
      console.error('Full error:', err);
      
      let errorMsg = 'Error processing payment. Please try again.';
      
      if (err.response?.status === 401) {
        errorMsg = 'Unauthorized: Please log in again.';
      } else if (err.response?.status === 404) {
        errorMsg = 'Contract not found. Please refresh the page.';
      } else if (err.response?.status === 403) {
        errorMsg = 'Not authorized to make this payment.';
      } else if (err.response?.status === 500) {
        errorMsg = `Server error: ${err.response?.data?.message || 'Razorpay may not be configured'}`;
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.message === 'Network Error') {
        errorMsg = 'Network error. Please check your internet connection and try again.';
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      console.error('Final error message:', errorMsg);
      setError(errorMsg);
      toast.error(errorMsg);
      setLoading(false);
    }
  };

  if (contract.paymentWorkflow?.clientPaymentStatus === 'paid_to_admin') {
    return (
      <div className="payment-status paid">
        <div className="status-icon">✅</div>
        <h3>Payment Complete</h3>
        <p>Amount: ₹{contract.totalAmount}</p>
        <p>Admin is holding your funds securely.</p>
        <p className="status-text">Next step: Release funds after work is completed</p>
      </div>
    );
  }

  return (
    <div className="client-payment-container">
      <div className="payment-card">
        <h2>💳 Make Payment via Razorpay</h2>
        
        {/* Diagnostic info */}
        <div className="diagnostic-box" style={{ 
          background: '#f0f0f0', 
          padding: '10px', 
          borderRadius: '4px', 
          marginBottom: '15px',
          fontSize: '12px',
          color: '#333'
        }}>
          <p><strong>Status:</strong> Razorpay {razorpayLoaded ? '✅ Loaded' : '⏳ Loading...'}</p>
          <p><strong>Backend Config:</strong> {razorpayConfigured === null ? '⏳ Checking...' : razorpayConfigured ? '✅ Configured' : '❌ NOT Configured'}</p>
          <p><strong>Contract ID:</strong> {contract?._id || '❌ Missing'}</p>
          <p><strong>Amount:</strong> {contract?.totalAmount ? `₹${contract.totalAmount}` : '❌ Missing'}</p>
          <p><strong>Client:</strong> {contract?.clientId?.name || contract?.clientId?.email || '❌ Missing'}</p>
        </div>
        
        <div className="payment-info">
          <div className="info-box">
            <span className="label">Amount to Pay:</span>
            <span className="amount">₹{contract.totalAmount}</span>
          </div>
          <div className="info-box">
            <span className="label">Payment Gateway:</span>
            <span className="value" style={{ color: '#3395FF', fontWeight: 'bold' }}>Razorpay</span>
          </div>
        </div>

        <div className="payment-flow-info">
          <h4>💡 How it works:</h4>
          <ul>
            <li>1. Click "Pay with Razorpay" button</li>
            <li>2. Complete payment securely (UPI, Card, Net Banking, Wallet)</li>
            <li>3. Receive payment verification email</li>
            <li>4. Freelancer completes the work</li>
            <li>5. You release the funds after verification</li>
            <li>6. Admin approves and pays the freelancer</li>
          </ul>
        </div>

        {razorpayConfigured === false && (
          <div style={{
            background: '#ffe6e6',
            border: '2px solid #ff4444',
            color: '#cc0000',
            padding: '15px',
            borderRadius: '4px',
            marginBottom: '15px',
            fontSize: '13px'
          }}>
            <strong>⚠️ Razorpay Not Configured</strong>
            <p>The payment gateway hasn't been set up on the server. Please:</p>
            <ol>
              <li>Add RAZORPAY_KEY_ID to server/.env</li>
              <li>Add RAZORPAY_SECRET to server/.env</li>
              <li>Restart the server</li>
              <li>Refresh this page</li>
            </ol>
          </div>
        )}

        <form onSubmit={handleRazorpayPayment}>
          {error && <div className="error-message">❌ {error}</div>}
          {success && <div className="success-message">{success}</div>}

          {!razorpayLoaded && (
            <div className="loading-message">⏳ Loading payment gateway... Please wait...</div>
          )}

          <button 
            type="submit" 
            disabled={loading || !razorpayLoaded}
            className="btn-razorpay"
          >
            {!razorpayLoaded ? '⏳ Loading Payment...' : loading ? '⏳ Processing...' : `💳 Pay ₹${contract.totalAmount} with Razorpay`}
          </button>
        </form>

        <div className="security-note">
          <strong>🔒 Security:</strong> Your payment details are secure. Payment processed via Razorpay (PCI-DSS compliant). We accept UPI, Card, Net Banking, and Wallets.
        </div>

        <div className="razorpay-badge">
          <img src="https://rzp.io/i/w2CEwYO" alt="Razorpay" style={{ height: '40px' }} />
        </div>
      </div>
    </div>
  );
};

export default ClientPayment;
