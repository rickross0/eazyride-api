const express = require('express');
const router = express.Router();
const { getContacts } = require('../controllers/supportController');

// Public — any user can read support contacts
router.get('/contacts', getContacts);

module.exports = router;
