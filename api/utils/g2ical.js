function parseDate(data) {
  // 20180727T025959Z or 20190620
  const match = /^(\d{4})(\d{2})(\d{2})(T(\d{2})(\d{2})(\d{2})Z?)?$/.exec(data);

  if (!match) {
    throw new Error(`parseDate could parse: '${data}'`);
    return;
  }

  const [,year,month,day,,hour = '00',min = '00', sec = '00'] = match;
  return new Date(`${year}-${month}-${day}T${hour}:${min}:${sec}.000Z`);
}

function getRepeating(item) {
  const { recurrence } = item;

  if (!recurrence) return;

  return recurrence.reduce((rep, r) => {
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
        if (extra) {
          extra.forEach(pair => {
            const [key, data] = pair.split('=');

            switch (key) {
              case 'TZID':
                rep.excludeTimezone = data;
                break;

              default:
                console.log(`EXDATE: Unknown key ${key} :: ${data}`);
                break;
            }
          });
        }

        rep.exclude = data.split(',').map(parseDate);
        break;

      default:
        console.log(`Unknown key: ${key} :: ${data}`);
        break;
    }

    return rep;
  }, {});
}

function getStart(item) {
  const keys = ['start', 'originalStartTime'];
  for (let i = 0, k; (k = keys[i]); i++) {
    if (item[k]) return new Date(item[k].dateTime || item[k].date);
  }
}

function getTimezone(item) {
  const keys = ['start', 'originalStartTime', 'end'];
  for (let i = 0, k; (k = keys[i]); i++) {
    if (item[k] && item[k].timezone) return item[k].timezone;
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
  if (!item.organizer)
    return;

  return getAttendee(item.organizer);
}

module.exports = {
  getRepeating,
  getStart,
  getTimezone,
  getAllDay,
  getAttendee,
  getOrganizer,
};
