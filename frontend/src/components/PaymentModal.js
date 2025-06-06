import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  amount, 
  type = 'purchase', // 'purchase', 'withdraw', 'transfer'
  recipientId = null,
  taskId = null,
  description = '',
  onSuccess
}) => {
  const { currentUser, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [formData, setFormData] = useState({
    // Card details
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    // Bank details
    accountNumber: '',
    routingNumber: '',
    accountName: '',
    // Crypto details
    walletAddress: '',
    // PayPal
    paypalEmail: ''
  });
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [agreementAccepted, setAgreementAccepted] = useState(false);

  const paymentMethods = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: '💳',
      description: 'Visa, Mastercard, American Express',
      fee: 2.9,
      processing: 'Instant'
    },
    {
      id: 'bank',
      name: 'Bank Transfer',
      icon: '🏦',
      description: 'Direct bank transfer (ACH)',
      fee: 0,
      processing: '1-3 business days'
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: '🟦',
      description: 'Pay with your PayPal account',
      fee: 3.5,
      processing: 'Instant'
    },
    {
      id: 'crypto',
      name: 'Cryptocurrency',
      icon: '₿',
      description: 'Bitcoin, Ethereum, USDC',
      fee: 1,
      processing: '10-30 minutes'
    }
  ];

  const creditPackages = [
    {
      credits: 100,
      price: 50,
      bonus: 0,
      popular: false,
      description: 'Perfect for small projects'
    },
    {
      credits: 250,
      price: 120,
      bonus: 5,
      popular: false,
      description: 'Great for multiple tasks'
    },
    {
      credits: 500,
      price: 225,
      bonus: 25,
      popular: true,
      description: 'Best value for professionals'
    },
    {
      credits: 1000,
      price: 400,
      bonus: 100,
      popular: false,
      description: 'For power users and teams'
    }
  ];

  useEffect(() => {
    if (!isOpen) {
      resetModal();
    }
  }, [isOpen]);

  const resetModal = () => {
    setStep(1);
    setLoading(false);
    setError('');
    setPaymentMethod('card');
    setFormData({
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardName: '',
      accountNumber: '',
      routingNumber: '',
      accountName: '',
      walletAddress: '',
      paypalEmail: ''
    });
    setPromoCode('');
    setDiscount(0);
    setAgreementAccepted(false);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
    const matches = cleaned.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiryDate = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
    }
    return cleaned;
  };

  const validateForm = () => {
    if (!agreementAccepted) {
      setError('Please accept the terms and conditions');
      return false;
    }

    switch (paymentMethod) {
      case 'card':
        if (!formData.cardNumber || !formData.expiryDate || !formData.cvv || !formData.cardName) {
          setError('Please fill in all card details');
          return false;
        }
        if (formData.cardNumber.replace(/\s/g, '').length < 15) {
          setError('Please enter a valid card number');
          return false;
        }
        if (formData.cvv.length < 3) {
          setError('Please enter a valid CVV');
          return false;
        }
        break;
      case 'bank':
        if (!formData.accountNumber || !formData.routingNumber || !formData.accountName) {
          setError('Please fill in all bank details');
          return false;
        }
        break;
      case 'paypal':
        if (!formData.paypalEmail) {
          setError('Please enter your PayPal email');
          return false;
        }
        break;
      case 'crypto':
        if (!formData.walletAddress) {
          setError('Please enter your wallet address');
          return false;
        }
        break;
    }
    return true;
  };

  const applyPromoCode = async () => {
    if (!promoCode.trim()) return;
    
    try {
      const response = await api.post('/payments/promo-code', { code: promoCode });
      setDiscount(response.data.discount);
      setError('');
    } catch (error) {
      setError('Invalid promo code');
      setDiscount(0);
    }
  };

  const calculateTotal = () => {
    const selectedMethod = paymentMethods.find(m => m.id === paymentMethod);
    const baseAmount = amount - discount;
    const fee = (baseAmount * selectedMethod.fee) / 100;
    return baseAmount + fee;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const paymentData = {
        amount: calculateTotal(),
        type,
        paymentMethod,
        formData: paymentMethod === 'card' ? {
          cardNumber: formData.cardNumber.replace(/\s/g, ''),
          expiryDate: formData.expiryDate,
          cvv: formData.cvv,
          cardName: formData.cardName
        } : formData,
        promoCode,
        recipientId,
        taskId,
        description
      };

      const response = await api.post('/payments/process', paymentData);
      
      if (response.data.success) {
        setStep(3); // Success step
        if (onSuccess) {
          onSuccess(response.data);
        }
        
        // Update user credits if it's a purchase
        if (type === 'purchase') {
          const updatedUser = { ...currentUser };
          updatedUser.credits = (updatedUser.credits || 0) + Math.floor(amount / 0.5); // $0.50 per credit
          updateUser(updatedUser);
        }
      } else {
        setError(response.data.message || 'Payment failed. Please try again.');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getCardBrand = (number) => {
    const cleaned = number.replace(/\s/g, '');
    if (/^4/.test(cleaned)) return '💳 Visa';
    if (/^5[1-5]/.test(cleaned)) return '💳 Mastercard';
    if (/^3[47]/.test(cleaned)) return '💳 Amex';
    if (/^6/.test(cleaned)) return '💳 Discover';
    return '💳 Card';
  };

  const renderStep1 = () => (
    <div className="payment-step">
      <div className="step-header">
        <h3>
          {type === 'purchase' && '💰 Purchase Credits'}
          {type === 'withdraw' && '💸 Withdraw Funds'}
          {type === 'transfer' && '🔄 Transfer Credits'}
        </h3>
        <p>Choose your preferred payment method</p>
      </div>

      {type === 'purchase' && (
        <div className="credit-packages">
          <h4>💎 Credit Packages</h4>
          <div className="packages-grid">
            {creditPackages.map(pkg => (
              <div 
                key={pkg.credits}
                className={`package-card ${pkg.popular ? 'popular' : ''}`}
                onClick={() => {
                  // Update amount based on selected package
                }}
              >
                {pkg.popular && <div className="popular-badge">🔥 Most Popular</div>}
                <div className="package-credits">{pkg.credits} Credits</div>
                {pkg.bonus > 0 && (
                  <div className="package-bonus">+{pkg.bonus} Bonus</div>
                )}
                <div className="package-price">${pkg.price}</div>
                <div className="package-description">{pkg.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="payment-methods">
        <h4>💳 Payment Methods</h4>
        <div className="methods-grid">
          {paymentMethods.map(method => (
            <div
              key={method.id}
              onClick={() => setPaymentMethod(method.id)}
              className={`method-card ${paymentMethod === method.id ? 'selected' : ''}`}
            >
              <div className="method-header">
                <span className="method-icon">{method.icon}</span>
                <span className="method-name">{method.name}</span>
              </div>
              <div className="method-description">{method.description}</div>
              <div className="method-details">
                <span className="method-fee">
                  {method.fee === 0 ? 'No fees' : `${method.fee}% fee`}
                </span>
                <span className="method-processing">{method.processing}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="promo-section">
        <h4>🎟️ Promo Code</h4>
        <div className="promo-input-group">
          <input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            placeholder="Enter promo code"
            className="promo-input"
          />
          <button
            onClick={applyPromoCode}
            className="apply-promo-btn"
          >
            Apply
          </button>
        </div>
        {discount > 0 && (
          <div className="discount-applied">
            ✅ Discount applied: -${discount}
          </div>
        )}
      </div>

      <div className="amount-summary">
        <div className="summary-row">
          <span>Amount:</span>
          <span>${amount}</span>
        </div>
        {discount > 0 && (
          <div className="summary-row discount">
            <span>Discount:</span>
            <span>-${discount}</span>
          </div>
        )}
        <div className="summary-row">
          <span>Processing fee:</span>
          <span>${((amount - discount) * paymentMethods.find(m => m.id === paymentMethod).fee / 100).toFixed(2)}</span>
        </div>
        <div className="summary-row total">
          <span>Total:</span>
          <span>${calculateTotal().toFixed(2)}</span>
        </div>
      </div>

      <button
        onClick={() => setStep(2)}
        className="btn btn-primary"
      >
        Continue to Payment 🚀
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="payment-step">
      <div className="step-header">
        <h3>💳 Payment Details</h3>
        <p>Enter your {paymentMethods.find(m => m.id === paymentMethod)?.name} information</p>
      </div>

      <div className="payment-form">
        {paymentMethod === 'card' && (
          <div className="card-form">
            <div className="form-group">
              <label>Card Number</label>
              <input
                type="text"
                value={formData.cardNumber}
                onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
                placeholder="1234 5678 9012 3456"
                maxLength="19"
                className="form-input"
              />
              <div className="card-brand">{getCardBrand(formData.cardNumber)}</div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Expiry Date</label>
                <input
                  type="text"
                  value={formData.expiryDate}
                  onChange={(e) => handleInputChange('expiryDate', formatExpiryDate(e.target.value))}
                  placeholder="MM/YY"
                  maxLength="5"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>CVV</label>
                <input
                  type="text"
                  value={formData.cvv}
                  onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, ''))}
                  placeholder="123"
                  maxLength="4"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Cardholder Name</label>
              <input
                type="text"
                value={formData.cardName}
                onChange={(e) => handleInputChange('cardName', e.target.value)}
                placeholder="John Doe"
                className="form-input"
              />
            </div>
          </div>
        )}

        {paymentMethod === 'bank' && (
          <div className="bank-form">
            <div className="form-group">
              <label>Account Number</label>
              <input
                type="text"
                value={formData.accountNumber}
                onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                placeholder="1234567890"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Routing Number</label>
              <input
                type="text"
                value={formData.routingNumber}
                onChange={(e) => handleInputChange('routingNumber', e.target.value)}
                placeholder="021000021"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Account Holder Name</label>
              <input
                type="text"
                value={formData.accountName}
                onChange={(e) => handleInputChange('accountName', e.target.value)}
                placeholder="John Doe"
                className="form-input"
              />
            </div>
          </div>
        )}

        {paymentMethod === 'paypal' && (
          <div className="paypal-form">
            <div className="form-group">
              <label>PayPal Email</label>
              <input
                type="email"
                value={formData.paypalEmail}
                onChange={(e) => handleInputChange('paypalEmail', e.target.value)}
                placeholder="your@email.com"
                className="form-input"
              />
            </div>
            <div className="paypal-redirect">
              <p>🔄 You'll be redirected to PayPal to complete your payment</p>
            </div>
          </div>
        )}

        {paymentMethod === 'crypto' && (
          <div className="crypto-form">
            <div className="form-group">
              <label>Wallet Address</label>
              <input
                type="text"
                value={formData.walletAddress}
                onChange={(e) => handleInputChange('walletAddress', e.target.value)}
                placeholder="1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
                className="form-input"
              />
            </div>
            <div className="crypto-info">
              <p>₿ Send exactly <strong>${calculateTotal().toFixed(2)}</strong> worth of cryptocurrency</p>
              <p>⏱️ Payment will be confirmed within 10-30 minutes</p>
            </div>
          </div>
        )}

        <div className="security-info">
          <div className="security-badges">
            <span className="security-badge">🔒 SSL Encrypted</span>
            <span className="security-badge">🛡️ Bank-level Security</span>
            <span className="security-badge">✅ PCI Compliant</span>
          </div>
          <p>Your payment information is encrypted and secure</p>
        </div>

        <div className="agreement-section">
          <label className="agreement-checkbox">
            <input
              type="checkbox"
              checked={agreementAccepted}
              onChange={(e) => setAgreementAccepted(e.target.checked)}
            />
            <span className="checkmark"></span>
            <span className="agreement-text">
              I agree to the <a href="/terms" target="_blank">Terms of Service</a> and <a href="/privacy" target="_blank">Privacy Policy</a>
            </span>
          </label>
        </div>

        <div className="final-summary">
          <div className="summary-row total">
            <span>Total Amount:</span>
            <span>${calculateTotal().toFixed(2)}</span>
          </div>
        </div>

        <div className="form-actions">
          <button
            onClick={() => setStep(1)}
            className="btn btn-secondary"
          >
            ← Back
          </button>
          <button
            onClick={handlePayment}
            disabled={loading || !agreementAccepted}
            className="btn btn-primary"
          >
            {loading ? (
              <>
                <div className="loading-spinner"></div>
                Processing...
              </>
            ) : (
              <>
                🔒 Pay ${calculateTotal().toFixed(2)}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="payment-step success-step">
      <div className="success-icon">✅</div>
      <h3>Payment Successful!</h3>
      <p>Your transaction has been processed successfully.</p>
      
      <div className="success-details">
        <div className="detail-row">
          <span>Amount:</span>
          <span>${calculateTotal().toFixed(2)}</span>
        </div>
        <div className="detail-row">
          <span>Payment Method:</span>
          <span>{paymentMethods.find(m => m.id === paymentMethod)?.name}</span>
        </div>
        <div className="detail-row">
          <span>Transaction ID:</span>
          <span>#TXN-{Date.now()}</span>
        </div>
      </div>

      {type === 'purchase' && (
        <div className="credits-added">
          <h4>🎉 Credits Added to Your Account</h4>
          <div className="credits-amount">+{Math.floor(amount / 0.5)} Credits</div>
        </div>
      )}

      <button
        onClick={onClose}
        className="btn btn-primary"
      >
        🎉 Continue
      </button>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="payment-modal-overlay" onClick={onClose}>
      <div className="payment-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="step-indicator">
            <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
              {step > 1 ? '✓' : '1'}
            </div>
            <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
              {step > 2 ? '✓' : '2'}
            </div>
            <div className={`step ${step >= 3 ? 'active' : ''}`}>
              {step >= 3 ? '✓' : '3'}
            </div>
          </div>
          
          <button onClick={onClose} className="close-btn">✕</button>
        </div>

        <div className="modal-content">
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>

        <style jsx>{`
          .payment-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            backdrop-filter: blur(4px);
          }

          .payment-modal {
            background: var(--bg-card);
            border-radius: 1rem;
            max-width: 600px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            border: 1px solid var(--border-primary);
            box-shadow: var(--shadow-xl);
          }

          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 2rem 2rem 1rem;
            border-bottom: 1px solid var(--border-primary);
          }

          .step-indicator {
            display: flex;
            gap: 1rem;
          }

          .step {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 1rem;
            background: var(--bg-tertiary);
            color: var(--text-muted);
            border: 2px solid var(--border-primary);
            transition: all 0.3s ease;
          }

          .step.active {
            background: var(--primary-cyan);
            color: white;
            border-color: var(--primary-cyan);
          }

          .step.completed {
            background: var(--success);
            color: white;
            border-color: var(--success);
          }

          .close-btn {
            background: none;
            border: none;
            color: var(--text-muted);
            cursor: pointer;
            font-size: 1.5rem;
            padding: 0.5rem;
            border-radius: 0.5rem;
            transition: all 0.3s ease;
          }

          .close-btn:hover {
            background: var(--bg-tertiary);
          }

          .modal-content {
            padding: 2rem;
          }

          .error-message {
            background: rgba(239, 68, 68, 0.15);
            color: var(--error);
            padding: 1rem;
            border-radius: 0.75rem;
            border: 1px solid rgba(239, 68, 68, 0.3);
            margin-bottom: 2rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .payment-step {
            display: flex;
            flex-direction: column;
            gap: 2rem;
          }

          .step-header h3 {
            color: var(--text-primary);
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
          }

          .step-header p {
            color: var(--text-secondary);
            margin: 0;
          }

          .credit-packages {
            background: var(--bg-secondary);
            padding: 2rem;
            border-radius: 1rem;
            border: 1px solid var(--border-primary);
          }

          .credit-packages h4 {
            color: var(--text-primary);
            font-size: 1.2rem;
            font-weight: 700;
            margin-bottom: 1.5rem;
          }

          .packages-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
            gap: 1rem;
          }

          .package-card {
            background: var(--bg-card);
            border: 2px solid var(--border-primary);
            border-radius: 1rem;
            padding: 1.5rem;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
          }

          .package-card:hover {
            border-color: var(--border-accent);
            transform: translateY(-2px);
          }

          .package-card.popular {
            border-color: var(--primary-cyan);
            background: rgba(0, 212, 255, 0.05);
          }

          .popular-badge {
            position: absolute;
            top: -8px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--primary-cyan);
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: 1rem;
            font-size: 0.7rem;
            font-weight: 700;
          }

          .package-credits {
            font-size: 1.5rem;
            font-weight: 800;
            color: var(--primary-cyan);
            margin-bottom: 0.5rem;
          }

          .package-bonus {
            color: var(--success);
            font-weight: 600;
            font-size: 0.9rem;
            margin-bottom: 0.5rem;
          }

          .package-price {
            font-size: 1.2rem;
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: 0.5rem;
          }

          .package-description {
            color: var(--text-muted);
            font-size: 0.8rem;
          }

          .payment-methods h4 {
            color: var(--text-primary);
            font-size: 1.2rem;
            font-weight: 700;
            margin-bottom: 1.5rem;
          }

          .methods-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
          }

          .method-card {
            background: var(--bg-secondary);
            border: 2px solid var(--border-primary);
            border-radius: 1rem;
            padding: 1.5rem;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .method-card:hover {
            border-color: var(--border-accent);
          }

          .method-card.selected {
            border-color: var(--primary-cyan);
            background: rgba(0, 212, 255, 0.1);
          }

          .method-header {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 0.75rem;
          }

          .method-icon {
            font-size: 1.5rem;
          }

          .method-name {
            font-weight: 700;
            color: var(--text-primary);
          }

          .method-description {
            color: var(--text-secondary);
            font-size: 0.9rem;
            margin-bottom: 1rem;
          }

          .method-details {
            display: flex;
            justify-content: space-between;
            font-size: 0.8rem;
          }

          .method-fee {
            color: var(--primary-cyan);
            font-weight: 600;
          }

          .method-processing {
            color: var(--text-muted);
          }

          .promo-section h4 {
            color: var(--text-primary);
            font-size: 1.2rem;
            font-weight: 700;
            margin-bottom: 1rem;
          }

          .promo-input-group {
            display: flex;
            gap: 1rem;
          }

          .promo-input {
            flex: 1;
            padding: 1rem;
            background: var(--bg-input);
            border: 2px solid var(--border-primary);
            border-radius: 0.75rem;
            color: var(--text-primary);
            font-size: 1rem;
            text-transform: uppercase;
          }

          .promo-input:focus {
            outline: none;
            border-color: var(--border-accent);
          }

          .apply-promo-btn {
            padding: 1rem 2rem;
            background: var(--primary-gradient);
            color: white;
            border: none;
            border-radius: 0.75rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .apply-promo-btn:hover {
            transform: translateY(-2px);
          }

          .discount-applied {
            margin-top: 1rem;
            color: var(--success);
            font-weight: 600;
            background: rgba(16, 185, 129, 0.1);
            padding: 0.75rem;
            border-radius: 0.5rem;
            border: 1px solid rgba(16, 185, 129, 0.3);
          }

          .amount-summary {
            background: var(--bg-secondary);
            padding: 1.5rem;
            border-radius: 1rem;
            border: 1px solid var(--border-primary);
          }

          .summary-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.75rem;
            font-size: 1rem;
          }

          .summary-row:last-child {
            margin-bottom: 0;
          }

          .summary-row.discount {
            color: var(--success);
          }

          .summary-row.total {
            font-size: 1.2rem;
            font-weight: 700;
            color: var(--text-primary);
            padding-top: 0.75rem;
            border-top: 1px solid var(--border-primary);
          }

          .payment-form {
            display: flex;
            flex-direction: column;
            gap: 2rem;
          }

          .form-group {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }

          .form-group label {
            color: var(--text-primary);
            font-weight: 600;
            font-size: 0.9rem;
          }

          .form-input {
            padding: 1rem;
            background: var(--bg-input);
            border: 2px solid var(--border-primary);
            border-radius: 0.75rem;
            color: var(--text-primary);
            font-size: 1rem;
            transition: all 0.3s ease;
          }

          .form-input:focus {
            outline: none;
            border-color: var(--border-accent);
            box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1);
          }

          .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
          }

          .card-brand {
            color: var(--text-muted);
            font-size: 0.9rem;
            margin-top: 0.25rem;
          }

          .paypal-redirect,
          .crypto-info {
            background: rgba(0, 212, 255, 0.1);
            padding: 1rem;
            border-radius: 0.5rem;
            border: 1px solid rgba(0, 212, 255, 0.3);
            text-align: center;
          }

          .crypto-info p {
            margin-bottom: 0.5rem;
          }

          .crypto-info p:last-child {
            margin-bottom: 0;
          }

          .security-info {
            text-align: center;
            padding: 1.5rem;
            background: var(--bg-secondary);
            border-radius: 1rem;
            border: 1px solid var(--border-primary);
          }

          .security-badges {
            display: flex;
            justify-content: center;
            gap: 1rem;
            margin-bottom: 1rem;
            flex-wrap: wrap;
          }

          .security-badge {
            background: rgba(16, 185, 129, 0.15);
            color: var(--success);
            padding: 0.5rem 1rem;
            border-radius: 2rem;
            font-size: 0.8rem;
            font-weight: 600;
            border: 1px solid rgba(16, 185, 129, 0.3);
          }

          .security-info p {
            color: var(--text-secondary);
            margin: 0;
            font-size: 0.9rem;
          }

          .agreement-section {
            padding: 1rem 0;
          }

          .agreement-checkbox {
            display: flex;
            align-items: flex-start;
            gap: 1rem;
            cursor: pointer;
            line-height: 1.5;
          }

          .agreement-checkbox input {
            display: none;
          }

          .checkmark {
            width: 20px;
            height: 20px;
            border: 2px solid var(--border-primary);
            border-radius: 0.25rem;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            flex-shrink: 0;
            margin-top: 0.125rem;
          }

          .agreement-checkbox input:checked + .checkmark {
            background: var(--primary-cyan);
            border-color: var(--primary-cyan);
          }

          .agreement-checkbox input:checked + .checkmark::after {
            content: '✓';
            color: white;
            font-weight: 700;
            font-size: 0.8rem;
          }

          .agreement-text {
            color: var(--text-secondary);
            font-size: 0.9rem;
          }

          .agreement-text a {
            color: var(--primary-cyan);
            text-decoration: none;
          }

          .agreement-text a:hover {
            text-decoration: underline;
          }

          .final-summary {
            background: linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(255, 107, 53, 0.1));
            padding: 1.5rem;
            border-radius: 1rem;
            border: 1px solid rgba(0, 212, 255, 0.3);
            text-align: center;
          }

          .form-actions {
            display: flex;
            gap: 1rem;
            justify-content: space-between;
          }

          .btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 1rem 2rem;
            border: none;
            border-radius: 0.75rem;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            flex: 1;
            justify-content: center;
          }

          .btn-primary {
            background: var(--primary-gradient);
            color: white;
            box-shadow: var(--shadow-sm);
          }

          .btn-primary:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: var(--shadow-md);
          }

          .btn-primary:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
          }

          .btn-secondary {
            background: var(--bg-tertiary);
            color: var(--text-primary);
            border: 1px solid var(--border-muted);
          }

          .btn-secondary:hover {
            background: var(--bg-input);
            border-color: var(--border-accent);
          }

          .loading-spinner {
            width: 16px;
            height: 16px;
            border: 2px solid rgba(255,255,255,0.3);
            border-top: 2px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          .success-step {
            text-align: center;
            padding: 2rem 0;
          }

          .success-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
          }

          .success-step h3 {
            color: var(--success);
            font-size: 2rem;
            font-weight: 800;
            margin-bottom: 1rem;
          }

          .success-step p {
            color: var(--text-secondary);
            font-size: 1.1rem;
            margin-bottom: 2rem;
          }

          .success-details {
            background: var(--bg-secondary);
            padding: 1.5rem;
            border-radius: 1rem;
            border: 1px solid var(--border-primary);
            margin-bottom: 2rem;
            text-align: left;
          }

          .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.75rem;
            font-size: 1rem;
          }

          .detail-row:last-child {
            margin-bottom: 0;
          }

          .credits-added {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05));
            border: 1px solid rgba(16, 185, 129, 0.3);
            border-radius: 1rem;
            padding: 2rem;
            margin-bottom: 2rem;
          }

          .credits-added h4 {
            color: var(--success);
            font-size: 1.2rem;
            font-weight: 700;
            margin-bottom: 1rem;
          }

          .credits-amount {
            font-size: 2rem;
            font-weight: 800;
            color: var(--success);
          }

          @media (max-width: 768px) {
            .payment-modal {
              width: 95%;
              margin: 1rem;
            }

            .modal-header,
            .modal-content {
              padding: 1.5rem;
            }

            .packages-grid {
              grid-template-columns: repeat(2, 1fr);
            }

            .methods-grid {
              grid-template-columns: 1fr;
            }

            .form-row {
              grid-template-columns: 1fr;
            }

            .security-badges {
              flex-direction: column;
              align-items: center;
            }

            .form-actions {
              flex-direction: column;
            }

            .promo-input-group {
              flex-direction: column;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default PaymentModal;