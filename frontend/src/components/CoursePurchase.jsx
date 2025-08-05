import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import { PayPalButtons } from '@paypal/react-paypal-js';

// Handle missing Stripe API key gracefully
const stripePromise = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY)
  : null;

export default function CoursePurchase({ course, onPurchaseSuccess }) {
  const { user } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [purchaseMethod, setPurchaseMethod] = useState('wallet'); // wallet, stripe, paypal
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      const response = await fetch('/api/wallet', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setWallet(data.data);
      }
    } catch (error) {
      console.error('Erreur fetchWallet:', error);
    }
  };

  const handleWalletPurchase = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/wallet/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          courseId: course._id,
          amount: course.settings.price,
          description: `Achat du cours: ${course.title}`
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Créer l'achat
        await createPurchase('wallet');
        onPurchaseSuccess && onPurchaseSuccess();
        setShowPurchaseModal(false);
      } else {
        alert(data.message || 'Erreur lors de l\'achat');
      }
    } catch (error) {
      console.error('Erreur achat wallet:', error);
      alert('Erreur lors de l\'achat');
    } finally {
      setLoading(false);
    }
  };

  const handleStripePurchase = async () => {
    setLoading(true);
    try {
      const stripe = await stripePromise;
      
      // Créer le Payment Intent
      const response = await fetch('/api/payments/stripe/purchase-course', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          courseId: course._id,
          amount: course.settings.price
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Confirmer le paiement avec Stripe
        const { error } = await stripe.confirmCardPayment(data.data.clientSecret, {
          payment_method: {
            card: elements.getElement('card'),
            billing_details: {
              name: user?.name || 'User'
            }
          }
        });
        
        if (error) {
          console.error('Erreur paiement Stripe:', error);
          alert('Erreur lors du paiement');
        } else {
          // Créer l'achat
          await createPurchase('stripe', data.data.paymentIntentId);
          onPurchaseSuccess && onPurchaseSuccess();
          setShowPurchaseModal(false);
        }
      }
    } catch (error) {
      console.error('Erreur achat Stripe:', error);
      alert('Erreur lors de l\'achat');
    } finally {
      setLoading(false);
    }
  };

  const createPurchase = async (paymentMethod, paymentIntentId = null, paypalOrderId = null) => {
    try {
      const response = await fetch('/api/payments/confirm-purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          courseId: course._id,
          amount: course.settings.price,
          paymentMethod: paymentMethod,
          paymentIntentId: paymentIntentId,
          paypalOrderId: paypalOrderId
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Recharger le wallet si nécessaire
        if (paymentMethod === 'wallet') {
          fetchWallet();
        }
        return true;
      } else {
        alert(data.message || 'Erreur lors de la confirmation de l\'achat');
        return false;
      }
    } catch (error) {
      console.error('Erreur createPurchase:', error);
      alert('Erreur lors de la confirmation de l\'achat');
      return false;
    }
  };

  const canAffordWithWallet = wallet && wallet.balance >= course.settings.price;

  return (
    <>
      <button
        onClick={() => setShowPurchaseModal(true)}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
      >
        Acheter ce cours - {course.settings.price}€
      </button>

      {/* Modal d'achat */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Acheter le cours</h2>
            <p className="text-gray-600 mb-4">{course.title}</p>
            <p className="text-2xl font-bold mb-6">{course.settings.price}€</p>

            {/* Méthodes de paiement */}
            <div className="space-y-4 mb-6">
              {/* Wallet */}
              <div className="border rounded-lg p-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="wallet"
                    checked={purchaseMethod === 'wallet'}
                    onChange={(e) => setPurchaseMethod(e.target.value)}
                    disabled={!canAffordWithWallet}
                  />
                  <div>
                    <div className="font-medium">Payer avec mon wallet</div>
                    <div className="text-sm text-gray-500">
                      Solde: {wallet?.balance || 0}€
                      {!canAffordWithWallet && (
                        <span className="text-red-500 ml-2">(Solde insuffisant)</span>
                      )}
                    </div>
                  </div>
                </label>
              </div>

              {/* Stripe */}
              {stripePromise && (
                <div className="border rounded-lg p-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="stripe"
                      checked={purchaseMethod === 'stripe'}
                      onChange={(e) => setPurchaseMethod(e.target.value)}
                    />
                    <div>
                      <div className="font-medium">Carte bancaire</div>
                      <div className="text-sm text-gray-500">Paiement sécurisé</div>
                    </div>
                  </label>
                </div>
              )}

              {/* PayPal */}
              <div className="border rounded-lg p-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="paypal"
                    checked={purchaseMethod === 'paypal'}
                    onChange={(e) => setPurchaseMethod(e.target.value)}
                  />
                  <div>
                    <div className="font-medium">PayPal</div>
                    <div className="text-sm text-gray-500">Paiement rapide</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="space-y-3">
              {purchaseMethod === 'wallet' && (
                <button
                  onClick={handleWalletPurchase}
                  disabled={loading || !canAffordWithWallet}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {loading ? 'Achat en cours...' : 'Acheter avec mon wallet'}
                </button>
              )}

              {purchaseMethod === 'stripe' && stripePromise && (
                <button
                  onClick={handleStripePurchase}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {loading ? 'Achat en cours...' : 'Payer avec ma carte'}
                </button>
              )}

              {purchaseMethod === 'paypal' && (
                <PayPalButtons
                  createOrder={(data, actions) => {
                    return actions.order.create({
                      purchase_units: [{
                        amount: {
                          value: course.settings.price.toString()
                        },
                        description: `Achat du cours: ${course.title}`
                      }]
                    });
                  }}
                  onApprove={async (data, actions) => {
                    const order = await actions.order.capture();
                    
                    // Créer l'achat
                    const success = await createPurchase('paypal', null, data.orderID);
                    if (success) {
                      onPurchaseSuccess && onPurchaseSuccess();
                      setShowPurchaseModal(false);
                    }
                  }}
                />
              )}
            </div>

            <button
              onClick={() => setShowPurchaseModal(false)}
              className="w-full mt-4 text-gray-600 hover:text-gray-800"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </>
  );
} 