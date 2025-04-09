import { useState } from 'react';
import axios from 'axios';

const PhoneVerification = ({ phoneno, onPhoneChange, }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(false);

  const sendOTP = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/send-otp/', {
        phoneNumber: phoneNumber
      });
      setOtpSent(true);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/verify-otp/', {
        phoneNumber: phoneNumber,
        otp: otp
      });
      setVerified(true);
      setError('');
      onPhoneChange(phoneNumber);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sm:col-span-3 sm:col-start-1">
      <div className="mt-2 relative">
        <input
          type="number"
          style={{height:"35px",padding:"0px 10px"}}
          value={phoneno?phoneno:phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="Enter phone number"
          disabled={otpSent}
          className={`block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6' ${
            verified ? 'border-green-500' : error ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {verified ? (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <svg 
              className="w-6 h-6 text-green-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>
        ) : (
          <button
            onClick={sendOTP}
            disabled={loading || otpSent}
            style={phoneNumber.length===10?{color:"green",zIndex:"100"}:{color:"grey"}}
            className="absolute right-7 top-1/2 -translate-y-1/2 px-4 py-1 "
          >
            {loading ? (
              <svg 
                className="animate-spin h-5 w-5" 
                fill="none" 
                viewBox="0 0 24 24"
              >
                <circle 
                  className="opacity-25" 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="4"
                />
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            ) : otpSent ? (
              'Sent'
            ) : (
              'Verify'
            )}
          </button>
        )}
      </div>

      {otpSent && !verified && (
        <div className="relative">
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter 6-digit OTP"
            maxLength={6}
            className={`w-full pr-24 p-2 border rounded-lg ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          <button
            onClick={verifyOTP}
            disabled={loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded disabled:bg-gray-300"
          >
            {loading ? (
              <svg 
                className="animate-spin h-5 w-5" 
                fill="none" 
                viewBox="0 0 24 24"
              >
                <circle 
                  className="opacity-25" 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="4"
                />
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            ) : (
              'Submit'
            )}
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {verified && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative">
          Phone number verified successfully!
        </div>
      )}
    </div>
  );
};

export default PhoneVerification;