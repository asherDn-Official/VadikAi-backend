const Customer = require("../models/Customer");

async function filterUsers(filters) {
  const query = {};
  if (filters.favoriteProducts?.length) {
    query['preferences.favoriteProducts'] = { $in: filters.favoriteProducts };
  }
  if (filters.interests?.length) {
    query['preferences.interests'] = { $in: filters.interests };
  }
  if (filters.birthday) {
    const today = new Date();
    query['$expr'] = {
      $and: [
        { $eq: [{ $dayOfMonth: '$preferences.birthday' }, today.getDate()] },
        { $eq: [{ $month: '$preferences.birthday' }, today.getMonth() + 1] }
      ]
    };
  }

  return await Customer.find(query);
}

module.exports = filterUsers;
