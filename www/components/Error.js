import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

const styles = theme => ({
  paper: {
    marginTop: theme.spacing.unit * 4,
    padding: theme.spacing.unit * 2,
  },
  title: {
    color: theme.palette.error.main,
  },
  pre: {
    overflow: 'auto',
  },
  code: {
    wordBreak: 'normal',
    wordWrap: 'normal',
  },
});

const Error = ({ error, classes }) => (
  <Paper className={classes.paper}>
    <Typography variant="h6" className={classes.title}>
      An Error has ocurred
    </Typography>

    <pre className={classes.pre}>
      <code className={classes.code}>{JSON.stringify(error, null, 2)}</code>
    </pre>
  </Paper>
);

export default withStyles(styles)(Error);
