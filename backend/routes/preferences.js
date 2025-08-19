const express = require('express');
const router = express.Router();
const UserPreferences = require('../models/userPreferences');
const { authenticateToken } = require('../middleware/authMiddleware');

// Get user preferences
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const preferences = await UserPreferences.getOrCreatePreferences(userId);

    res.json({
      success: true,
      data: preferences
    });
  } catch (error) {
    console.error('Error getting user preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des préférences',
      error: error.message
    });
  }
});

// Update user preferences
router.put('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;

    // Validate updates
    const allowedUpdates = ['notifications', 'general', 'privacy'];
    const filteredUpdates = {};
    
    for (const key of allowedUpdates) {
      if (updates[key]) {
        filteredUpdates[key] = updates[key];
      }
    }

    const preferences = await UserPreferences.updatePreferences(userId, filteredUpdates);

    res.json({
      success: true,
      message: 'Préférences mises à jour avec succès',
      data: preferences
    });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour des préférences',
      error: error.message
    });
  }
});

// Update specific preference section
router.patch('/:section', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { section } = req.params;
    const updates = req.body;

    // Validate section
    const allowedSections = ['notifications', 'general', 'privacy'];
    if (!allowedSections.includes(section)) {
      return res.status(400).json({
        success: false,
        message: 'Section invalide'
      });
    }

    const updateData = { [section]: updates };
    const preferences = await UserPreferences.updatePreferences(userId, updateData);

    res.json({
      success: true,
      message: 'Section mise à jour avec succès',
      data: preferences
    });
  } catch (error) {
    console.error('Error updating preference section:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la section',
      error: error.message
    });
  }
});

// Reset preferences to defaults
router.post('/reset', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Delete existing preferences and create new ones with defaults
    await UserPreferences.findOneAndDelete({ userId });
    const preferences = await UserPreferences.getOrCreatePreferences(userId);

    res.json({
      success: true,
      message: 'Préférences réinitialisées aux valeurs par défaut',
      data: preferences
    });
  } catch (error) {
    console.error('Error resetting preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la réinitialisation des préférences',
      error: error.message
    });
  }
});

module.exports = router;
