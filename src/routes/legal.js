const express = require('express');
const router = express.Router();
const { getTerms } = require('../controllers/legalController');

// Public — any user can read T&C
router.get('/terms', getTerms);

module.exports = router;
