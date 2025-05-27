const Campaign = require('../models/Campaign');
const MessageLog = require('../models/MessageLog');
const filterUsers = require('../utils/filterUsers');
const axios = require('axios');
const { WHATSAPP_TOKEN, PHONE_NUMBER_ID, API_URL } = require('../config/metaApi');

exports.sendMessage = async (campaignId) => {
  const campaign = await Campaign.findById(campaignId);
  if (!campaign) return;

  const users = await filterUsers(campaign.filters);

  for (const user of users) {
    try {
      const personalizedVars = campaign.variables.map(v => user.preferences[v] || user[v] || '');

      await axios.post(`${API_URL}/${PHONE_NUMBER_ID}/messages`, {
        messaging_product: 'whatsapp',
        to: user.phone,
        type: 'template',
        template: {
          name: campaign.messageTemplate,
          language: { code: 'en_US' },
          components: [{
            type: 'body',
            parameters: personalizedVars.map(text => ({ type: 'text', text }))
          }]
        }
      }, {
        headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` }
      });

      await MessageLog.create({
        campaignId,
        userId: user._id,
        phone: user.phone,
        status: 'sent',
        timestamp: new Date()
      });

    } catch (err) {
      await MessageLog.create({
        campaignId,
        userId: user._id,
        phone: user.phone,
        status: 'failed',
        timestamp: new Date()
      });
    }
  }
};
