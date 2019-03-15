const { google } = require('googleapis');
const OAuth2Client = require('../utils/OAuth2Client');
const { send } = require('micro');
const micronize = require('../utils/micronize');
const query = require('micro-query');
const ical = require('ical-generator');

module.exports = micronize(async (req, res) => {
  const q = query(req);

  if (!q.t || !q.id) {
    send(res, 401);
    return;
  }

  const token = JSON.parse(q.t);
  const oAuth2Client = new OAuth2Client(req);
  oAuth2Client.setCredentials(token);
  const calendar = google.calendar({version: 'v3', auth: oAuth2Client});
  const { data } = await calendar.events.list({
    calendarId: q.id,
    maxResults: 2500,
    // timeMin: lastMonth
  });

  const cal = ical({
    domain: req.headers.host,
    name: data.summary,
    timezone: data.timeZone,
    events: data.items,
  });

  /*
  data.items.forEach(item => {
    cal.createEvent({
      id: item.id,
      summary: item.summary,
      description: item.description,
      start:
    });
  });*/

  res.setHeader('Content-Type', 'text/calendar; charset=UTF-8');
  send(res, 200, cal.toString());
});
