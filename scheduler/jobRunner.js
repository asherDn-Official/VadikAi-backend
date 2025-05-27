const Campaign = require('../models/Campaign');
const { sendMessage } = require('../controllers/messageScheduler');

async function dailyJobRunner() {
  const birthdayCampaigns = await Campaign.find({
    'schedule.type': 'recurring',
    'schedule.recurringType': 'birthday'
  });

  for (const campaign of birthdayCampaigns) {
    await sendMessage(campaign._id);
  }
}

module.exports = dailyJobRunner;
