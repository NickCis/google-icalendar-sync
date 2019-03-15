const OAuth2Client = require('../utils/OAuth2Client');
const micronize = require('../utils/micronize');
const { send } = require('micro');
const scopes = ['https://www.googleapis.com/auth/calendar.readonly'];

module.exports = micronize(async (req, res) => {
  const oauth2Client = new OAuth2Client(req);
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
  });

  send(res, 200, { url });
});
