const { getRepeating, getAttendee, getOrganizer } = require('./g2ical');

describe('getRepeating', () => {
  it('should return undefined, if no recurrence', () => {
    expect(getRepeating({})).toBeUndefined();
  });

  it('should parse freq', () => {
    expect(getRepeating({
      recurrence: ['RRULE:FREQ=YEARLY']
    })).toEqual({
      freq: 'YEARLY'
    });
  });

  it('should parse byday (one day)', () => {
    expect(getRepeating({
      recurrence: ['RRULE:FREQ=WEEKLY;BYDAY=WE'],
    })).toEqual({
      freq: 'WEEKLY',
      byDay: ['WE']
    });
  });

  it('should parse byday (one day with number)', () => {
    expect(getRepeating({
      recurrence: ['RRULE:FREQ=MONTHLY;BYDAY=3WE'],
    })).toEqual({
      freq: 'MONTHLY',
      byDay: ['3WE']
    });
  });

  it('should parse byday (one day with negative number)', () => {
    expect(getRepeating({
      recurrence: ['RRULE:FREQ=MONTHLY;BYDAY=-1FR'],
    })).toEqual({
      freq: 'MONTHLY',
      byDay: ['-1FR']
    });
  });

  it('should parse byday (many days)', () => {
    expect(getRepeating({
      recurrence: ['RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR'],
    })).toEqual({
      freq: 'WEEKLY',
      byDay: ['MO','TU', 'WE', 'TH', 'FR']
    });
  });

  it('should parse until (full date)', () => {
    expect(getRepeating({
      recurrence: ['RRULE:FREQ=DAILY;UNTIL=20180727T025959Z'],
    })).toEqual({
      freq: 'DAILY',
      until: new Date('2018-07-27T02:59:59.000Z')
    });
  });

  it('should parse until (no time)', () => {
    expect(getRepeating({
      recurrence: ['RRULE:FREQ=DAILY;UNTIL=20180727'],
    })).toEqual({
      freq: 'DAILY',
      until: new Date('2018-07-27T00:00:00.000Z')
    });
  });

  it('should parse count', () => {
    expect(getRepeating({
      recurrence: ['RRULE:FREQ=DAILY;COUNT=3'],
    })).toEqual({
      freq: 'DAILY',
      count: '3'
    });
  });

  it('should parse interval', () => {
    expect(getRepeating({
      recurrence: ['RRULE:FREQ=DAILY;INTERVAL=3'],
    })).toEqual({
      freq: 'DAILY',
      interval: '3'
    });
  });

  it('should parse EXDATE', () => {
    expect(getRepeating({
      recurrence: ['EXDATE;TZID=America/Argentina/Buenos_Aires:20180803T111500'],
    })).toEqual({
      exclude: [new Date('2018-08-03T11:15:00.000Z')],
      excludeTimezone: 'America/Argentina/Buenos_Aires'

    });
  });
});

describe('getAttendee', () => {
  it('should set name and email', () => {
    expect(getAttendee({
      displayName: 'My Name',
      email: 'email@email.com'
    })).toMatchObject({
      name: 'My Name',
      email: 'email@email.com'
    });
  });

  it('should use email as name if no `displayName`', () => {
    expect(getAttendee({
      email: 'email@email.com'
    })).toEqual({
      name: 'email@email.com',
      email: 'email@email.com'
    });
  });
});

describe('getOrganizer', () => {
  it('should return undefined if no organizer', () => {
    expect(getOrganizer({})).toBeUndefined();
  });

  it('should set name and email', () => {
    expect(getOrganizer({
      organizer: {
        displayName: 'My Name',
        email: 'email@email.com'
      }
    })).toMatchObject({
      name: 'My Name',
      email: 'email@email.com'
    });  });
});
