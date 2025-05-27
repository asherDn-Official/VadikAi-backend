const express = require('express');
const router = express.Router();
const { createCampaign, getCampaigns } = require('../controllers/campaignController');

router.post('/create', createCampaign);
router.get('/get', getCampaigns);

module.exports = router;
