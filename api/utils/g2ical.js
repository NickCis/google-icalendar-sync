const moment = require('moment-timezone');

function iana2timezone(iana) {
  return moment.tz(iana).format('Z');
}

function parseDate(data, timezone = 'Z') {
  // 20180727T025959Z or 20190620
  const match = /^(\d{4})(\d{2})(\d{2})(T(\d{2})(\d{2})(\d{2})Z?)?$/.exec(data);

  if (!match) {
    throw new Error(`parseDate could parse: '${data}'`);
    return;
  }

  const [, year, month, day, , hour = '00', min = '00', sec = '00'] = match;
  return new Date(
    `${year}-${month}-${day}T${hour}:${min}:${sec}.000${timezone}`
  );
}

function getRepeating(item, trailingExclude) {
  const { recurrence } = item;

  if (!recurrence) return;

  return recurrence.reduce(
    (rep, r) => {
      const [_key, data] = r.split(':');
      const [key, ...extra] = _key.split(';');

      switch (key) {
        case 'RRULE':
          data.split(';').forEach(pair => {
            const [key, data] = pair.split('=');

            switch (key) {
              case 'FREQ':
              case 'INTERVAL':
              case 'COUNT':
                rep[key.toLowerCase()] = data;
                break;

              case 'UNTIL':
                rep.until = parseDate(data);
                break;

              case 'BYDAY':
                rep.byDay = data.split(',');
                break;

              case 'BYMONTH':
                rep.byMonth = data;
                break;

              case 'BYMONTHDAY':
                rep.byMonthDay = data;
                break;

              case 'BYSETPOS':
                rep.bySetPos = data;
                break;

              default:
                console.log(`RRULE: Unknown key ${key} :: ${data}`);
                break;
            }
          });

          break;

        case 'EXDATE':
          let timezone = 'Z';
          if (extra) {
            extra.forEach(pair => {
              const [key, data] = pair.split('=');

              switch (key) {
                case 'TZID':
                  timezone = iana2timezone(data);
                  break;

                default:
                  console.log(`EXDATE: Unknown key ${key} :: ${data}`);
                  break;
              }
            });
          }

          rep.exclude = (rep.exclude || []).concat(
            data.split(',').map(d => parseDate(d, timezone))
          );
          break;

        default:
          console.log(`Unknown key: ${key} :: ${data}`);
          break;
      }

      return rep;
    },
    {
      exclude: trailingExclude,
    }
  );
}

function getDate(value) {
  if (!value) return;

  if (value.dateTime) {
    if (/(Z|[+-]\d{2}(:\d{2})?)$/.exec(value.dateTime)) return value.dateTime;
    return `${value.dateTime}${iana2timezone(value.timeZone)}`;
  }
  return value.date;
}

function getStart(item) {
  const keys = ['start', 'originalStartTime'];
  for (let i = 0, k; (k = keys[i]); i++) {
    const date = getDate(item[k]);
    if (date) return date;
  }
}

function getTimezone(item) {
  const keys = ['start', 'originalStartTime', 'end'];
  for (let i = 0, k; (k = keys[i]); i++) {
    if (item[k] && item[k].timeZone) return item[k].timeZone;
  }
}

function getAllDay(item) {
  const keys = ['start', 'originalStartTime', 'end'];
  for (let i = 0, k; (k = keys[i]); i++) {
    if (item[k]) return !!item[k].date;
  }
}

function getAttendee(attendee) {
  return {
    ...attendee,
    name: attendee.displayName || attendee.email || 'unknown',
    email: attendee.email || 'unknown@email.com',
  };
}

function getOrganizer(item) {
  if (!item.organizer) return;

  return getAttendee(item.organizer);
}

function shouldIgnore(item) {
  if (item.status === 'cancelled' && !item.originalStartTime) return true;

  return false;
}

function isCanceledRecurringInstance(item) {
  if (
    item.status === 'cancelled' &&
    item.recurringEventId &&
    item.originalStartTime
  )
    return true;

  return false;
}

function getId(item) {
  return item.recurringEventId || item.id;
}

module.exports = {
  parseDate,
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
};
