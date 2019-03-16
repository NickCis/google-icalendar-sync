import 'isomorphic-unfetch';

function url(req, url) {
  if (req) return `https://${req.headers.host}${url}`;

  return url;
}

const Page = ({
  oAuth2Url,
  calendars,
  url: {
    query: { t },
  },
  host,
}) => (
  <div>
    <h1>Google Icalendar Sync</h1>
    <a href={oAuth2Url}>url</a>
    {calendars && (
      <ul>
        {calendars.map(calendar => (
          <li>
            {calendar.summary}:{' '}
            <input
              type="text"
              value={`https://${host}/calendar/${encodeURIComponent(
                calendar.id
              )}/${encodeURIComponent(t)}/basic.ics`}
            />
          </li>
        ))}
      </ul>
    )}
  </div>
);

Page.getInitialProps = async ({ req, query }) => {
  if (query.t) {
    const { data } = await (await fetch(
      url(req, `/api/calendar/list.js?t=${encodeURIComponent(query.t)}`)
    )).json();

    return {
      host: req ? req.headers.host : window.location.host,
      calendars: data.items,
    };
  }

  const json = await (await fetch(url(req, '/api/oauth2/url.js'))).json();
  return {
    oAuth2Url: json.url,
  };
};

export default Page;
