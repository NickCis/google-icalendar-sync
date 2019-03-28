import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import MUIAppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import GitHubIcon from './GitHubIcon';

const styles = {
  toolbarTitle: {
    flex: 1,
  },
};

const AppBar = ({ classes }) => (
  <MUIAppBar color="primary" position="sticky">
    <Toolbar>
      <Typography
        className={classes.toolbarTitle}
        variant="h6"
        color="inherit"
        component="h1"
      >
        Google Ical Sync
      </Typography>
      <IconButton
        color="inherit"
        component="a"
        href="https://github.com/NickCis/google-icalendar-sync"
      >
        <GitHubIcon />
      </IconButton>
    </Toolbar>
  </MUIAppBar>
);

export default withStyles(styles)(AppBar);
