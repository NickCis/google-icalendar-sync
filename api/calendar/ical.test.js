const mockCalendar = {
  events: {
    list: jest.fn(),
  },
};

jest.mock('micro', () => ({ send: jest.fn() }));
jest.mock('micro-query', () => jest.fn());
jest.mock('micronize', () => jest.fn(f => f));
jest.mock('micro-morgan', () => jest.fn(() => f => f));
jest.mock('googleapis', () => ({
  google: {
    calendar: jest.fn().mockReturnValue(mockCalendar),
  },
}));
jest.mock('../utils/OAuth2Client', () =>
  jest.fn(() => ({
    setCredentials: jest.fn(),
  }))
);

const micro = require('micro');
const query = require('micro-query');
const ical = require('./ical');

beforeEach(() => {
  micro.send.mockReset();
  query.mockReset();
  mockCalendar.events.list.mockReset();
});

it('should send 401 if no token', async () => {
  const res = {};
  query.mockReturnValue({
    id: 'id',
  });

  await ical({}, res);

  expect(micro.send).toHaveBeenCalledWith(res, 401);
});

it('should build ical', async () => {
  const req = {
    headers: {
      host: 'test.host',
    },
  };
  const res = {
    setHeader: jest.fn(),
  };

  query.mockReturnValue({
    t: JSON.stringify('token'),
    id: 'id',
  });

  mockCalendar.events.list.mockReturnValue(
    Promise.resolve({
      config: {},
      data: {
        kind: 'calendar#events',
        etag: '"etab"',
        summary: 'Calendar title',
        updated: '2019-03-13T03:54:30.086Z',
        timeZone: 'America/Argentina/Buenos_Aires',
        accessRole: 'owner',
        defaultReminders: [
          {
            method: 'popup',
            minutes: 10,
          },
          {
            method: 'email',
            minutes: 10,
          },
        ],
        items: [
          {
            kind: 'calendar#event',
            etag: '"etag"',
            id: 'item-id',
            status: 'tentative',
            htmlLink:
              'https://www.google.com/calendar/event?eid=XXXXXXXXXXXXXX',
            created: '2012-04-09T04:03:21.000Z',
            updated: '2012-04-09T04:03:22.000Z',
            summary: 'Event title',
            description: 'Description of event',
            creator: {
              email: 'email@gmail.com',
              displayName: 'My Name',
              self: true,
            },
            organizer: {
              email: 'email@gmail.com',
              displayName: 'My Name',
              self: true,
            },
            start: {
              dateTime: '2012-05-05T09:00:00-03:00',
            },
            end: {
              dateTime: '2012-05-05T13:00:00-03:00',
            },
            iCalUID: 'item-id@google.com',
            sequence: 1,
            attendees: [
              {
                email: 'email@gmail.com',
                displayName: 'My Name',
                organizer: true,
                self: true,
                responseStatus: 'accepted',
              },
            ],
            extendedProperties: {
              shared: {
                'CalendarSyncAdapter#originalTimezone':
                  'America/Argentina/Buenos_Aires',
              },
            },
            reminders: {
              useDefault: true,
            },
          },
          {
            kind: 'calendar#event',
            etag: '"etag"',
            id: 'item-id-2',
            status: 'confirmed',
            htmlLink: 'https://www.google.com/calendar/event?eid=XXXXXXXXX',
            created: '2016-07-12T01:57:03.000Z',
            updated: '2016-07-12T01:57:03.477Z',
            summary: 'Yearly recurring event',
            creator: {
              email: 'email@gmail.com',
              displayName: 'My Name',
              self: true,
            },
            organizer: {
              email: 'email@gmail.com',
              displayName: 'My Name',
              self: true,
            },
            start: {
              date: '2016-07-11',
            },
            end: {
              date: '2016-07-12',
            },
            recurrence: ['RRULE:FREQ=YEARLY'],
            transparency: 'transparent',
            iCalUID: 'item-id-2@google.com',
            sequence: 0,
            reminders: {
              useDefault: true,
            },
          },
          {
            kind: 'calendar#event',
            etag: '"etag"',
            id: 'item-id-3',
            status: 'confirmed',
            htmlLink: 'https://www.google.com/calendar/event?eid=XXXXXXXXX',
            created: '2016-07-12T01:57:03.000Z',
            updated: '2016-07-12T01:57:03.477Z',
            summary: 'Weekly wednesday recurring event',
            creator: {
              email: 'email@gmail.com',
              displayName: 'My Name',
              self: true,
            },
            organizer: {
              email: 'email@gmail.com',
              displayName: 'My Name',
              self: true,
            },
            start: {
              date: '2016-07-11',
            },
            end: {
              date: '2016-07-12',
            },
            recurrence: ['RRULE:FREQ=WEEKLY;BYDAY=WE'],
            transparency: 'transparent',
            iCalUID: 'item-id-3@google.com',
            sequence: 0,
            reminders: {
              useDefault: true,
            },
          },
          {
            kind: 'calendar#event',
            etag: '"etag"',
            id: 'item-id-4',
            status: 'confirmed',
            htmlLink: 'https://www.google.com/calendar/event?eid=XXXXXXXXXXXX',
            created: '2019-03-16T05:55:02.000Z',
            updated: '2019-03-16T05:55:02.849Z',
            summary: 'Test: Cada mes 3er miercoles',
            creator: {
              email: 'email@gmail.com',
              displayName: 'My Name',
              self: true,
            },
            organizer: {
              email: 'email@gmail.com',
              displayName: 'My Name',
              self: true,
            },
            start: {
              date: '2019-03-20',
            },
            end: {
              date: '2019-03-21',
            },
            recurrence: ['RRULE:FREQ=MONTHLY;BYDAY=3WE'],
            // "RRULE:FREQ=MONTHLY;COUNT=3;INTERVAL=3;BYDAY=3WE"
            // "RRULE:FREQ=MONTHLY;UNTIL=20190620;INTERVAL=3"
            transparency: 'transparent',
            iCalUID: 'item-id-4@google.com',
            sequence: 0,
            extendedProperties: {
              private: {
                everyoneDeclinedDismissed: '-1',
              },
            },
            reminders: {
              useDefault: true,
            },
          },

          {
            kind: 'calendar#event',
            etag: '"etag"',
            id: 'item-id-5',
            status: 'cancelled',
            recurringEventId: 'item-id-4',
            originalStartTime: {
              date: '2019-04-17',
            },
          },
        ],
      },
    })
  );

  await ical(req, res);

  expect(res.setHeader).toHaveBeenCalledWith(
    'Content-Type',
    'text/calendar; charset=UTF-8'
  );

  expect(
    micro.send.mock.calls[0][2].replace(/^DTSTAMP:.+$/gm, 'DTSTAMP:')
  ).toMatchSnapshot();
});
