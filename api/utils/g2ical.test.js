const {
  getRepeating,
  getAttendee,
  getOrganizer,
  shouldIgnore,
} = require('./g2ical');

describe('getRepeating', () => {
  it('should return undefined, if no recurrence', () => {
    expect(getRepeating({})).toBeUndefined();
  });

  it('should parse freq', () => {
    expect(
      getRepeating({
        recurrence: ['RRULE:FREQ=YEARLY'],
      })
    ).toEqual({
      freq: 'YEARLY',
    });
  });

  it('should parse byday (one day)', () => {
    expect(
      getRepeating({
        recurrence: ['RRULE:FREQ=WEEKLY;BYDAY=WE'],
      })
    ).toEqual({
      freq: 'WEEKLY',
      byDay: ['WE'],
    });
  });

  it('should parse byday (one day with number)', () => {
    expect(
      getRepeating({
        recurrence: ['RRULE:FREQ=MONTHLY;BYDAY=3WE'],
      })
    ).toEqual({
      freq: 'MONTHLY',
      byDay: ['3WE'],
    });
  });

  it('should parse byday (one day with negative number)', () => {
    expect(
      getRepeating({
        recurrence: ['RRULE:FREQ=MONTHLY;BYDAY=-1FR'],
      })
    ).toEqual({
      freq: 'MONTHLY',
      byDay: ['-1FR'],
    });
  });

  it('should parse byday (many days)', () => {
    expect(
      getRepeating({
        recurrence: ['RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR'],
      })
    ).toEqual({
      freq: 'WEEKLY',
      byDay: ['MO', 'TU', 'WE', 'TH', 'FR'],
    });
  });

  it('should parse until (full date)', () => {
    expect(
      getRepeating({
        recurrence: ['RRULE:FREQ=DAILY;UNTIL=20180727T025959Z'],
      })
    ).toEqual({
      freq: 'DAILY',
      until: '2018-07-27T02:59:59.000Z',
    });
  });

  it('should parse until (no time)', () => {
    expect(
      getRepeating({
        recurrence: ['RRULE:FREQ=DAILY;UNTIL=20180727'],
      })
    ).toEqual({
      freq: 'DAILY',
      until: '2018-07-27',
    });
  });

  it('should parse count', () => {
    expect(
      getRepeating({
        recurrence: ['RRULE:FREQ=DAILY;COUNT=3'],
      })
    ).toEqual({
      freq: 'DAILY',
      count: '3',
    });
  });

  it('should parse interval', () => {
    expect(
      getRepeating({
        recurrence: ['RRULE:FREQ=DAILY;INTERVAL=3'],
      })
    ).toEqual({
      freq: 'DAILY',
      interval: '3',
    });
  });

  it('should parse EXDATE', () => {
    expect(
      getRepeating({
        recurrence: [
          'EXDATE;TZID=America/Argentina/Buenos_Aires:20180803T111500',
        ],
      })
    ).toEqual({
      exclude: ['2018-08-03T11:15:00.000-03:00'],
    });
  });

  it('should parse EXDATE (VALUE=DATE)', () => {
    expect(
      getRepeating({
        recurrence: ['EXDATE;VALUE=DATE:20180803'],
      })
    ).toEqual({
      exclude: ['2018-08-03'],
    });
  });

  it('should parse several EXDATE', () => {
    expect(
      getRepeating({
        recurrence: [
          'EXDATE;TZID=America/Argentina/Buenos_Aires:20180803T111500',
          'EXDATE;TZID=America/Argentina/Buenos_Aires:20180803T121500',
        ],
      })
    ).toEqual({
      exclude: [
        '2018-08-03T11:15:00.000-03:00',
        '2018-08-03T12:15:00.000-03:00',
      ],
    });
  });

  it('should parse EXDATE (use trailingExlude)', () => {
    expect(
      getRepeating(
        {
          recurrence: [
            'EXDATE;TZID=America/Argentina/Buenos_Aires:20180803T111500',
          ],
        },
        ['2018-08-03T10:15:00.000-03:00']
      )
    ).toEqual({
      exclude: [
        '2018-08-03T10:15:00.000-03:00',
        '2018-08-03T11:15:00.000-03:00',
      ],
    });
  });
});

describe('getAttendee', () => {
  it('should set name and email', () => {
    expect(
      getAttendee({
        displayName: 'My Name',
        email: 'email@email.com',
      })
    ).toMatchObject({
      name: 'My Name',
      email: 'email@email.com',
    });
  });

  it('should use email as name if no `displayName`', () => {
    expect(
      getAttendee({
        email: 'email@email.com',
      })
    ).toEqual({
      name: 'email@email.com',
      email: 'email@email.com',
    });
  });
});

describe('getOrganizer', () => {
  it('should return undefined if no organizer', () => {
    expect(getOrganizer({})).toBeUndefined();
  });

  it('should set name and email', () => {
    expect(
      getOrganizer({
        organizer: {
          displayName: 'My Name',
          email: 'email@email.com',
        },
      })
    ).toMatchObject({
      name: 'My Name',
      email: 'email@email.com',
    });
  });
});

describe('shouldIgnore', () => {
  it('should ignore canceled events without originalStartTime', () => {
    expect(
      shouldIgnore({
        status: 'cancelled',
      })
    ).toBeTruthy();
  });

  it('shouldnt ignore canceled events with originalStartTime', () => {
    expect(
      shouldIgnore({
        status: 'cancelled',
        originalStartTime: {
          date: 'some date',
        },
      })
    ).toBeFalsy();
  });

  it('shouldnt ignore regular events', () => {
    expect(
      shouldIgnore({
        kind: 'calendar#event',
        etag: '"etag"',
        id: 'item-id',
        status: 'tentative',
        htmlLink: 'https://www.google.com/calendar/event?eid=XXXXXXXXXXXXXX',
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
      })
    ).toBeFalsy();
  });
});
