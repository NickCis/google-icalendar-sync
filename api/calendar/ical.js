const { google } = require('googleapis');
const OAuth2Client = require('../utils/OAuth2Client');
const { send } = require('micro');
const micronize = require('micronize');
const query = require('micro-query');
const ical = require('@nickcis/ical-generator');
const {
  getRepeating,
  getStart,
  getTimezone,
  getAllDay,
  getAttendee,
  getOrganizer,
} = require('../utils/g2ical');

function getTimeMin() {
  const date = new Date();
  date.setMonth(date.getMonth() - 2);
  return date.toISOString();
}

module.exports = micronize(async (req, res) => {
  const q = query(req);

  if (!q.t || !q.id) {
    send(res, 401);
    return;
  }

  const token = JSON.parse(q.t);
  const oAuth2Client = new OAuth2Client(req);
  oAuth2Client.setCredentials(token);
  const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
  const { data } = await calendar.events.list({
    calendarId: q.id,
    maxResults: 2500,
    timeMin: getTimeMin(),
  });

  const cal = ical({
    domain: req.headers.host,
    prodId: {
      company: 'Open Source Software',
      product: 'google-icalendar-sync',
    },
    name: data.summary,
    timezone: data.timeZone,
    // method: ?
    // ttl: ?
  });

  data.items.forEach(item => {
    cal.createEvent({
      ...item,
      start: getStart(item),
      end: item.end && new Date(item.end.dateTime || item.end.date),
      timezone: getTimezone(item),
      created: item.created && new Date(item.created),
      allDay: getAllDay(item),
      lastModified: item.updated && new Date(item.updated),
      url: item.htmlLink,
      repeating: getRepeating(item),
      // recurrenceId: item.recurringEventId, // TODO:
      organizer: getOrganizer(item),
      attendees: item.attendees && item.attendees.map(getAttendee),
    });
  });

  res.setHeader('Content-Type', 'text/calendar; charset=UTF-8');
  send(res, 200, cal.toString());
});
