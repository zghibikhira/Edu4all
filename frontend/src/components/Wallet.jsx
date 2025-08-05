import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useElements, useStripe } from '@stripe/react-stripe-js';
import { PayPalButtons } from '@paypal/react-paypal-js';

// Handle missing Stripe API key gracefully
const stripePromise = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY)
  : null;

// Composant interne pour gérer les paiements Stripe
function StripePaymentForm({ rechargeAmount, onSuccess, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();

  const handleStripeRecharge = async () => {
    if (!stripe || !elements) {
      console.error('Stripe not loaded');
      return;
    }

    try {
      // Créer le Payment Intent
      const response = await fetch('/api/payments/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          amount: rechargeAmount
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
          alert('Erreur lors du paiement: ' + error.message);
        } else {
          // Confirmer le paiement côté serveur
          await fetch('/api/payments/stripe/confirm-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              paymentIntentId: data.data.paymentIntentId
            })
          });
          
          onSuccess();
        }
      }
    } catch (error) {
      console.error('Erreur recharge Stripe:', error);
      alert('Erreur lors de la recharge');
    }
  };

  return (
    <div className="space-y-3">
      <button
        onClick={handleStripeRecharge}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
      >
        Payer avec Carte Bancaire
      </button>
      
      <button
        onClick={onCancel}
        className="w-full mt-4 text-gray-600 hover:text-gray-800"
      >
        Annuler
      </button>
    </div>
  );
}

export default function Wallet() {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rechargeAmount, setRechargeAmount] = useState(10);
  const [showRecharge, setShowRecharge] = useState(false);

  useEffect(() => {
    fetchWallet();
    fetchTransactions();
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

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/wallet/transactions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setTransactions(data.data.transactions);
      }
    } catch (error) {
      console.error('Erreur fetchTransactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRechargeSuccess = () => {
    fetchWallet();
    fetchTransactions();
    setShowRecharge(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'deposit':
        return '💰';
      case 'withdrawal':
        return '💸';
      case 'purchase':
        return '🛒';
      case 'refund':
        return '↩️';
      default:
        return '📊';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header du Wallet */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white mb-6">
        <h1 className="text-2xl font-bold mb-2">Mon Wallet</h1>
        <div className="text-4xl font-bold mb-4">
          {wallet?.balance || 0}€
        </div>
        <button
          onClick={() => setShowRecharge(true)}
          className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
        >
          Recharger
        </button>
      </div>

      {/* Modal de Recharge */}
      {showRecharge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Recharger mon wallet</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Montant (€)</label>
              <input
                type="number"
                value={rechargeAmount}
                onChange={(e) => setRechargeAmount(parseFloat(e.target.value) || 0)}
                className="w-full p-2 border rounded-lg"
                min="1"
                step="0.01"
              />
            </div>

            {stripePromise ? (
              <Elements stripe={stripePromise}>
                <StripePaymentForm
                  rechargeAmount={rechargeAmount}
                  onSuccess={handleRechargeSuccess}
                  onCancel={() => setShowRecharge(false)}
                />
              </Elements>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-600 mb-2">Paiement par carte bancaire temporairement indisponible</p>
                <p className="text-sm text-gray-500">Veuillez utiliser PayPal ou contacter l'administrateur</p>
              </div>
            )}

            <PayPalButtons
              createOrder={(data, actions) => {
                return actions.order.create({
                  purchase_units: [{
                    amount: {
                      value: rechargeAmount.toString()
                    }
                  }]
                });
              }}
              onApprove={async (data, actions) => {
                await actions.order.capture();
                
                // Confirmer le paiement côté serveur
                await fetch('/api/payments/paypal/capture-payment', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                  },
                  body: JSON.stringify({
                    orderId: data.orderID
                  })
                });
                
                // Recharger les données
                fetchWallet();
                fetchTransactions();
                setShowRecharge(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Historique des Transactions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Historique des transactions</h2>
        
        {transactions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Aucune transaction pour le moment</p>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getTransactionIcon(transaction.type)}</span>
                  <div>
                    <div className="font-medium">{transaction.description}</div>
                    <div className="text-sm text-gray-500">
                      {formatDate(transaction.createdAt)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${
                    transaction.type === 'deposit' || transaction.type === 'refund' 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {transaction.type === 'deposit' || transaction.type === 'refund' ? '+' : '-'}
                    {transaction.amount}€
                  </div>
                  <div className="text-xs text-gray-500 capitalize">
                    {transaction.paymentMethod}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 