import React, { useRef } from 'react';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import IconButton from '@material-ui/core/IconButton';
import RootRef from '@material-ui/core/RootRef';
import { withStyles } from '@material-ui/core/styles';
import CopyIcon from './CopyIcon';

const styles = theme => ({
  wrapper: {
    marginTop: theme.spacing.unit * 4,
  },
  copy: {
    width: 1,
  },
});

const CalendarListItem = ({ host, calendar, token, classes }) => {
  const textField = useRef(null);
  const handleClick = () => {
    textField.current.querySelector('input').select();
    document.execCommand('copy');
  };

  return (
    <TableRow>
      <TableCell padding="dense">{calendar.summary}</TableCell>
      <TableCell padding="none">
        <RootRef rootRef={textField}>
          <TextField
            readOnly
            fullWidth
            value={`https://${host}/c/${encodeURIComponent(
              calendar.id
            )}/${encodeURIComponent(token)}/basic.ics`}
          />
        </RootRef>
      </TableCell>
      <TableCell padding="checkbox" align="right" className={classes.copy}>
        <IconButton onClick={handleClick}>
          <CopyIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};

const CalendarList = ({ host, calendars, token, classes }) => (
  <Paper className={classes.wrapper}>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell padding="dense">Calendar</TableCell>
          <TableCell padding="none">URL</TableCell>
          <TableCell padding="checkbox" className={classes.copy} />
        </TableRow>
      </TableHead>
      <TableBody>
        {calendars.map(calendar => (
          <CalendarListItem
            classes={classes}
            key={calendar.id}
            host={host}
            calendar={calendar}
            token={token}
          />
        ))}
      </TableBody>
    </Table>
  </Paper>
);

export default withStyles(styles)(CalendarList);
