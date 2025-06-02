const express = require('express');
const router = express.Router();
const { createCampaign, getCampaigns, testSendNow } = require('../controllers/campaignController');

router.post('/create', createCampaign);
router.get('/get', getCampaigns);

//test

router.post('/test-send', testSendNow);


module.exports = router;
