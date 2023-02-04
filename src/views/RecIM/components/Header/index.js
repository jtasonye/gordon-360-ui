import { Grid, AppBar, Breadcrumbs, Typography, IconButton } from '@mui/material';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { Link as LinkRouter } from 'react-router-dom';
import { DateTime } from 'luxon';
import styles from './Header.module.css';
import { useUser } from 'hooks';
import { getParticipantByUsername } from 'services/recim/participant';
import { getActivityByID } from 'services/recim/activity';
import { getTeamByID } from 'services/recim/team';
import { getMatchByID } from 'services/recim/match';
import ActivityForm from 'views/RecIM/components/Forms/ActivityForm';
import TeamForm from 'views/RecIM/components/Forms/TeamForm';
import GordonLoader from 'components/Loader';
import recimLogo from './../../recim_logo.png';
import HomeIcon from '@mui/icons-material/Home';
import EditIcon from '@mui/icons-material/Edit';

const Header = ({ page, expandable = false }) => {
  const { profile } = useUser();
  const { activityID, teamID, matchID } = useParams();
  const [user, setUser] = useState();
  const [activity, setActivity] = useState();
  const [team, setTeam] = useState();
  const [match, setMatch] = useState();
  const [openActivityForm, setOpenActivityForm] = useState(false);
  const [openTeamForm, setOpenTeamForm] = useState(false);
  const [isCaptain, setIsCaptain] = useState(false);
  const [team0Score, setTeam0Score] = useState(0);
  const [team1Score, setTeam1Score] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      if (profile) {
        setUser(await getParticipantByUsername(profile.AD_Username));
      }
    };
    loadData();
  }, [profile]);

  useEffect(() => {
    const loadData = async () => {
      activityID ? setActivity(await getActivityByID(activityID)) : setActivity();
    };
    loadData();
  }, [activityID]);

  useEffect(() => {
    const loadData = async () => {
      teamID ? setTeam(await getTeamByID(teamID)) : setTeam();
    };
    loadData();
  }, [teamID]);

  useEffect(() => {
    const loadData = async () => {
      matchID ? setMatch(await getMatchByID(matchID)) : setMatch();
    };
    loadData();
  }, [matchID]);

  //checks if the team is modifiable by the current user
  useEffect(() => {
    if (user && team) {
      let role =
        team.Participant.find((teamParticipant) => teamParticipant.Username === user.Username)
          ?.Role ?? 'Invalid';
      setIsCaptain(role === 'Co-Captain' || role === 'Team-captain/Creator');
    }
  }, [team, user]);

  useEffect(() => {
    if (match) {
      const assignMatchScores = async () => {
        setTeam0Score(
          match.Scores.find((team) => team.TeamID === match.Team[0]?.ID)?.TeamScore ?? 0,
        );
        setTeam1Score(
          match.Scores.find((team) => team.TeamID === match.Team[1]?.ID)?.TeamScore ?? 0,
        );
      };
      assignMatchScores();
    }
  }, [match]);

  const handleActivityForm = (status) => {
    //if you want to do something with the message make a snackbar function here
    setOpenActivityForm(false);
  };

  const handleTeamForm = (status) => {
    //if you want to do something with the message make a snackbar function here
    setOpenTeamForm(false);
  };

  const teamRecord = () => {
    if (team) {
      if (team.TeamRecord[0]) {
        return (
          <Typography variant="subtitle2">
            {team.TeamRecord[0].Win} W : {team.TeamRecord[0].Loss} L : {team.TeamRecord[0].Tie} T
          </Typography>
        );
      }
      return <Typography variant="subtitle2">Activity has not started</Typography>;
    }
    return <GordonLoader size={15} inline />;
  };

  const dayMonthDate = (date) => {
    return (
      date.weekdayLong +
      ', ' +
      date.monthLong +
      ' ' +
      date.day +
      ', ' +
      date.toLocaleString(DateTime.TIME_SIMPLE)
    );
  };

  const mainHeader = () => {
    if (expandable === 'home') {
      return (
        <Grid container direction="row" alignItems="center" spacing={4}>
          <Grid item>
            <img src={recimLogo} alt="Rec-IM Logo" width="85em"></img>
          </Grid>
          <Grid item xs={8} md={5} lg={3}>
            <Typography variant="h5" className={styles.title}>
              <b className="accentText">Gordon</b> Rec-IM
            </Typography>
            <Typography variant="h6" className={styles.subtitle}>
              <i>"Competition reveals character"</i>
            </Typography>
          </Grid>
        </Grid>
      );
    }
    if (expandable === 'activity') {
      return (
        <Grid container direction="row" alignItems="center" columnSpacing={4}>
          <Grid item>
            <img src={''} alt="Activity Icon" width="85em"></img>
          </Grid>
          <Grid item xs={8} md={5}>
            <Typography variant="h5" className={styles.title}>
              {activity?.Name}
              {user?.IsAdmin ? (
                <IconButton>
                  <EditIcon
                    onClick={() => {
                      setOpenActivityForm(true);
                    }}
                  />
                </IconButton>
              ) : null}
            </Typography>
            <Typography variant="h6" className={styles.subtitle}>
              <i>Description of activity</i>
            </Typography>
          </Grid>
          {openActivityForm && (
            <ActivityForm
              activity={activity}
              closeWithSnackbar={(status) => {
                handleActivityForm(status);
              }}
              openActivityForm={openActivityForm}
              setOpenActivityForm={(bool) => setOpenActivityForm(bool)}
            />
          )}
        </Grid>
      );
    }
    if (expandable === 'team') {
      return (
        <Grid container direction="row" alignItems="center" columnSpacing={4}>
          <Grid item>
            <img src={''} alt="Team Icon" width="85em"></img>
          </Grid>
          <Grid item xs={8} md={5}>
            <Typography variant="h5" className={styles.title}>
              {team?.Name ?? <GordonLoader size={15} inline />}
              {(user?.IsAdmin || (isCaptain && team?.Activity?.RegistrationOpen)) && (
                <IconButton>
                  <EditIcon
                    onClick={() => {
                      setOpenTeamForm(true);
                    }}
                  />
                </IconButton>
              )}
            </Typography>
            {teamRecord()}
          </Grid>
          {openTeamForm && (
            <TeamForm
              closeWithSnackbar={(status) => {
                handleTeamForm(status);
              }}
              openTeamForm={openTeamForm}
              setOpenTeamForm={(bool) => setOpenTeamForm(bool)}
              activityID={team?.Activity?.ID}
              team={team}
              isAdmin={user.IsAdmin}
            />
          )}
        </Grid>
      );
    }
    if (expandable === 'match') {
      return (
        <>
          <Grid container justifyContent="space-between" marginBottom="10px">
            <Grid item className={styles.grayText}>
              {match?.Activity.Name}
            </Grid>
            <Grid item className={styles.grayText}>
              {dayMonthDate(DateTime.fromISO(match?.Time))}
            </Grid>
          </Grid>
          <Grid container alignItems="center" justifyContent="space-around">
            <Grid item xs={2}>
              <LinkRouter to={`/recim/activity/${match?.Activity.ID}/team/${match?.Team[0]?.ID}`}>
                <Typography variant="h5" className="gc360_text_link">
                  {match?.Team[0]?.Name ?? 'No team yet...'}
                </Typography>
              </LinkRouter>
              <i className={styles.grayText}>Sportsmanship</i>
            </Grid>
            <Grid item xs={2}>
              <img src={''} alt="Team Icon" width="85em"></img>
            </Grid>
            <Grid item container xs={4} sm={2} alignItems="center" direction="column">
              <Typography variant="body" className={styles.grayText}>
                <i>Match Score</i>
              </Typography>
              <Typography variant="h5">
                {team0Score} : {team1Score}
              </Typography>
            </Grid>
            <Grid item xs={2}>
              <img src={''} alt="Team Icon" width="85em"></img>
            </Grid>
            <Grid item xs={2}>
              <LinkRouter to={`/recim/activity/${match?.Activity.ID}/team/${match?.Team[1]?.ID}`}>
                <Typography variant="h5" className="gc360_text_link">
                  {match?.Team[1]?.Name ?? 'No team yet...'}
                </Typography>
              </LinkRouter>
              <i className={styles.grayText}>Sportsmanship</i>
            </Grid>
          </Grid>
        </>
      );
    }
    return null;
  };

  return (
    <>
      {expandable && <Grid className={styles.mainHeader}>{mainHeader()}</Grid>}
      <AppBar className={styles.stickyNav} sx={!expandable && { mt: '-1rem' }}>
        <Breadcrumbs aria-label="breadcrumb">
          {/* Home breadcrumb: link or text */}
          {activity || page === 'admin' ? (
            <LinkRouter className="gc360_text_link" underline="hover" color="inherit" to={'/recim'}>
              <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Rec-IM Home
            </LinkRouter>
          ) : (
            <Typography color="text.primary">
              <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Rec-IM Home
            </Typography>
          )}
          {/* Admin breadcrumb: text */}
          {page === 'admin' && <Typography color="text.primary">Admin</Typography>}
          {/* Activity breadcrumb: link or text */}
          {activity &&
            (match || team ? (
              <LinkRouter
                className="gc360_text_link"
                underline="hover"
                color="inherit"
                to={`/recim/activity/${activity.ID}`}
              >
                {activity.Name}
              </LinkRouter>
            ) : (
              <Typography color="text.primary">{activity.Name}</Typography>
            ))}
          {/* Team breadcrumb: text */}
          {team && <Typography color="text.primary">{team.Name}</Typography>}
          {/* Match breadcrumb: text */}
          {matchID && (
            <Typography color="text.primary">
              Match: {match?.Team[0]?.Name ?? <GordonLoader size={15} inline />} vs{' '}
              {match?.Team[1]?.Name ?? <GordonLoader size={15} inline />}
            </Typography>
          )}
        </Breadcrumbs>
      </AppBar>
    </>
  );
};

export default Header;
