import 'isomorphic-unfetch'

function url(req, url) {
  if (req)
    return `https://${req.headers.host}${url}`;

  return url;
}

const Page = ({ oAuth2Url, calendars, query }) => (
  <div>
    <h1>Google Icalendar Sync</h1>
    <p>This is a test</p>
    <a href={ oAuth2Url }>url</a>
    {calendars && (
      <ul>
        calendars.items.map(calendar => (
          <li> { calendar.summary }: <input type="text" value={ `/api/calendar/ical.js?t=${envodeURIComponent(query.tokens)}&id=${encodeURIComponent(calendar.id)}`} /> </li>
        ))
      </ul>
    )}
  </div>

);

Page.getInitialProps = async ({ req, query }) => {
  if (query.tokens) {
    const { data } = await (await fetch(url(req, `/api/calendar/list.js?t=${encodeURIComponent(query.tokens)}`))).json();

    return {
      calendars: data.items,
    };
  }

  const json = await (await fetch(url(req, '/api/oauth2/url.js'))).json();
  return {
    oAuth2Url: json.url,
  };
}

export default Page
