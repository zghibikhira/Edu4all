import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function WalletSummary() {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg shadow-sm p-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium mb-2">Mon Wallet</h3>
          <div className="text-3xl font-bold mb-2">
            {wallet?.balance || 0}€
          </div>
          <p className="text-green-100 text-sm">
            Solde disponible
          </p>
        </div>
        <div className="flex space-x-2">
          <Link
            to="/wallet"
            className="px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors text-sm font-medium"
          >
            Voir détails
          </Link>
          <Link
            to="/wallet"
            className="px-4 py-2 bg-white text-green-600 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
          >
            Recharger
          </Link>
        </div>
      </div>
    </div>
  );
} 