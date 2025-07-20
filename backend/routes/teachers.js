const express = require('express');
const router = express.Router();
const { getAllTeachers } = require('../controllers/teacherController');

// GET /api/teachers
router.get('/', getAllTeachers);

module.exports = router; 