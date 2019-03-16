const { google } = require('googleapis');
const OAuth2Client = require('../utils/OAuth2Client');
const { send } = require('micro');
const micronize = require('micronize');
const query = require('micro-query');

module.exports = micronize(async (req, res) => {
  const q = query(req);

  if (q.t) {
    const token = JSON.parse(q.t);
    const oAuth2Client = new OAuth2Client(req);
    oAuth2Client.setCredentials(token);
    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

    const { data } = await calendar.calendarList.list();
    send(res, 200, { data });

    return;
  }

  send(res, 401, { error: 'no token' });
});
