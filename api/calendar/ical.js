const { google } = require('googleapis');
const { send } = require('micro');
const morgan = require('micro-morgan');
const micronize = require('micronize');
const query = require('micro-query');
const ical = require('@nickcis/ical-generator');
const compose = require('compose-function');
const OAuth2Client = require('../utils/OAuth2Client');
const token = require('../utils/token');
const {
  getDate,
  getRepeating,
  getStart,
  getTimezone,
  getAllDay,
  getAttendee,
  getOrganizer,
  shouldIgnore,
  isCanceledRecurringInstance,
  getId,
} = require('../utils/g2ical');

function getTimeMin() {
  const date = new Date();
  date.setMonth(date.getMonth() - 2);
  return date.toISOString();
}

const format =
  '[:date[clf]] ":method HTTP/:http-version" :status :res[content-length]b ":user-agent"';

module.exports = compose(
  micronize,
  morgan(format)
)(async (req, res) => {
  const q = query(req);

  if (!q.t || !q.id) {
    send(res, 401);
    return;
  }

  const t = token.parse(q.t);
  const oAuth2Client = new OAuth2Client(req);
  oAuth2Client.setCredentials(t);
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

  const trailingExclude = {};
  const events = {};

  data.items.forEach(item => {
    if (isCanceledRecurringInstance(item)) {
      const originalEvent = events[item.recurringEventId];
      const date = getDate(item.originalStartTime);

      if (originalEvent) {
        const repeating = {
          ...originalEvent.repeating(),
          date,
        };

        repeating.exclude = [...(repeating.exclude || []), date];

        originalEvent.repeating(repeating);
      } else {
        trailingExclude[item.recurringEventId] = [
          ...(trailingExclude[item.recurringEventId] || []),
          date,
        ];
      }

      return;
    }

    if (shouldIgnore(item)) return;

    events[item.id] = cal.createEvent({
      ...item,
      id: getId(item),
      start: getStart(item),
      end: getDate(item.end),
      timezone: getTimezone(item),
      created: item.created && new Date(item.created),
      allDay: getAllDay(item),
      lastModified: item.updated && new Date(item.updated),
      url: item.htmlLink,
      repeating: getRepeating(item, trailingExclude[item.id]),
      recurrenceId: getDate(item.originalStartTime),
      organizer: getOrganizer(item),
      attendees: item.attendees && item.attendees.map(getAttendee),
    });
  });

  res.setHeader('Content-Type', 'text/calendar; charset=UTF-8');
  send(res, 200, cal.toString());
});
