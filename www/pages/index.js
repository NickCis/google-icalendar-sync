import 'isomorphic-unfetch';
import { withRouter } from 'next/router';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import compose from 'compose-function';
import GoogleIcon from '../components/GoogleIcon';
import AppBar from '../components/AppBar';
import Error from '../components/Error';
import CalendarList from '../components/CalendarList';

function url(req, url) {
  if (req) return `https://${req.headers.host}${url}`;

  return url;
}

const styles = theme => ({
  content: {
    paddingTop: theme.spacing.unit * 4,
  },
  item: {
    padding: theme.spacing.unit * 2,
  },
  leftIcon: {
    marginRight: theme.spacing.unit,
  },
});

const Page = ({
  error,
  oAuth2Url,
  calendars,
  router: {
    query: { t },
  },
  host,
  classes,
}) => (
  <>
    <AppBar />
    <Grid
      container
      justify="center"
      component="main"
      className={classes.content}
    >
      <Grid item xs={12} md={9} lg={7} className={classes.item}>
        <Typography
          component="h1"
          variant="h2"
          color="textPrimary"
          gutterBottom
        >
          Google Ical Sync
        </Typography>
        <Typography
          variant="h6"
          color="textSecondary"
          paragraph
          align="justify"
        >
          The idea of the project is to provide a endpoint to export an ical
          formatted output of a private calendar.
        </Typography>
        <Typography variant="body1" paragraph align="justify">
          Normally, you would use the default{' '}
          <a href="https://support.google.com/calendar/answer/37648?hl=en">
            Private Address
          </a>
          , but, if your admin has not allow that sharing option you won't see
          it. This project provides the same functionallity but, as it uses the
          google api, you always can create the link.
        </Typography>
        <Typography variant="body2" paragraph align="justify">
          This APP doesn't store any info nor token, the necessary auth is
          stored in the generated url,{' '}
          <a href="https://github.com/NickCis/google-icalendar-sync">
            Go check the code!
          </a>
        </Typography>

        {error && <Error error={error} />}

        {oAuth2Url && (
          <Button variant="contained" component="a" href={oAuth2Url}>
            <GoogleIcon className={classes.leftIcon} />
            Sign In with Google
          </Button>
        )}

        {calendars && (
          <CalendarList host={host} token={t} calendars={calendars} />
        )}
      </Grid>
    </Grid>
  </>
);

Page.getInitialProps = async ({ req, query }) => {
  try {
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
  } catch (error) {
    return {
      error,
    };
  }
};

export default compose(
  withRouter,
  withStyles(styles)
)(Page);
