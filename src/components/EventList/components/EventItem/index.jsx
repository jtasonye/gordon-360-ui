import { CardContent, Collapse, Grid, Typography } from '@mui/material';
import { useState } from 'react';
import styles from './EventItem.module.css';
import 'add-to-calendar-button';
import { format } from 'date-fns';
import { STORAGE_COLOR_PREFERENCE_KEY } from 'theme';

const EventItem = ({ event }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Grid
      component="li"
      container
      direction="row"
      onClick={() => setExpanded((e) => !e)}
      className={styles.event_item}
    >
      <Grid item xs={12} sm={4}>
        <Typography variant="h6">{event.title}</Typography>
      </Grid>
      <Grid item xs={6} sm={2}>
        <Typography>{event.date === 'Invalid DateTime' ? 'No Date Listed' : event.date}</Typography>
      </Grid>
      <Grid item xs={6} sm={2}>
        <Typography>
          {event.timeRange === 'Invalid DateTime - Invalid DateTime'
            ? 'No Time Listed'
            : event.timeRange}
        </Typography>
      </Grid>
      <Grid item xs={12} sm={4}>
        <Typography>{event.location}</Typography>
      </Grid>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <Typography type="caption">{event.Description || 'No description available'}</Typography>
          {event.StartDate !== '' && event.EndDate !== '' && (
            <add-to-calendar-button
              name={event.title}
              options="'Google','Microsoft365|Gordon Outlook','Apple','Outlook.com|Outlook','MicrosoftTeams'"
              location={event.location}
              startDate={format(new Date(event.StartDate), 'yyyy-MM-dd')}
              endDate={format(new Date(event.EndDate), 'yyyy-MM-dd')}
              startTime={format(new Date(event.StartDate), 'HH:mm')}
              endTime={format(new Date(event.EndDate), 'HH:mm')}
              //default timeZone setting is "currentBrowser", and saved setting "America/New_York" if needed in case
              timeZone="currentBrowser"
              label="Add to Calendar"
              description={event.Description}
              onClick={() => setExpanded((e) => !e)}
              lightMode={localStorage.getItem(STORAGE_COLOR_PREFERENCE_KEY) ?? 'system'}
              //Get user theme mode preference
            ></add-to-calendar-button>
          )}
        </CardContent>
      </Collapse>
    </Grid>
  );
};

export default EventItem;
