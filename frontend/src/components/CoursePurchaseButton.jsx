import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function CoursePurchaseButton({ course, onPurchaseSuccess }) {
  const { user } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);

  useEffect(() => {
    fetchWallet();
    checkPurchaseStatus();
  }, [course._id]);

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

  const checkPurchaseStatus = async () => {
    try {
      const response = await fetch(`/api/purchases/check/${course._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setHasPurchased(data.hasPurchased);
    } catch (error) {
      console.error('Erreur checkPurchaseStatus:', error);
    }
  };

  const handlePurchase = async () => {
    if (!wallet || wallet.balance < course.settings.price) {
      alert('Solde insuffisant. Veuillez recharger votre wallet.');
      return;
    }

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
        setHasPurchased(true);
        fetchWallet(); // Refresh wallet balance
        onPurchaseSuccess && onPurchaseSuccess();
        alert('Achat effectué avec succès !');
      } else {
        alert(data.message || 'Erreur lors de l\'achat');
      }
    } catch (error) {
      console.error('Erreur achat:', error);
      alert('Erreur lors de l\'achat');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    // Redirect to course details page where files can be downloaded
    window.location.href = `/courses/${course._id}`;
  };

  if (hasPurchased) {
    return (
      <button
        onClick={handleDownload}
        className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
      >
        📥 Télécharger le cours
      </button>
    );
  }

  const canAfford = wallet && wallet.balance >= course.settings.price;

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-600">Prix:</span>
        <span className="font-semibold text-lg">{course.settings.price}€</span>
      </div>
      
      {wallet && (
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Votre solde:</span>
          <span className={`font-semibold ${canAfford ? 'text-green-600' : 'text-red-600'}`}>
            {wallet.balance}€
          </span>
        </div>
      )}

      <button
        onClick={handlePurchase}
        disabled={loading || !canAfford}
        className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
          canAfford
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Achat en cours...
          </span>
        ) : canAfford ? (
          '🛒 Acheter ce cours'
        ) : (
          '💰 Solde insuffisant'
        )}
      </button>

      {!canAfford && (
        <button
          onClick={() => window.location.href = '/wallet'}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
        >
          Recharger mon wallet
        </button>
      )}
    </div>
  );
} 