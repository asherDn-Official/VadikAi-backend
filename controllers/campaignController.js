const Campaign = require("../models/Campaign");
// const filterUsers = require("../utils/filterUsers");
const { sendMessage } = require("./messageScheduler");

exports.createCampaign = async (req, res) => {
  try {
    const campaign = new Campaign(req.body);
    await campaign.save();

    // const users = await filterUsers(campaign.filters);  - for user filter send messages
    
    
    if (campaign.schedule.type === "once") {
      setTimeout(
        () => sendMessage(campaign._id),
        new Date(campaign.schedule.date) - Date.now()
      );
    }

    res.status(201).json(campaign);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find();
    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
