import { Grid, Typography, Card, CardHeader, CardContent, IconButton, Button } from '@mui/material';
import { useNavigate, useParams, Link as LinkRouter } from 'react-router-dom';
import { useUser } from 'hooks';
import { useState, useEffect } from 'react';
import GordonLoader from 'components/Loader';
import GordonUnauthorized from 'components/GordonUnauthorized';
import Header from '../../components/Header';
import styles from './Match.module.css';
import { ParticipantList } from './../../components/List';
import { getParticipantByUsername } from 'services/recim/participant';
import { getMatchByID, getMatchAttendance, deleteMatchCascade } from 'services/recim/match';
import MatchForm from 'views/RecIM/components/Forms/MatchForm';
import EditIcon from '@mui/icons-material/Edit';
import SettingsIcon from '@mui/icons-material/Settings';
import { standardDate } from 'views/RecIM/components/Helpers';
import GordonDialogBox from 'components/GordonDialogBox';
import defaultLogo from 'views/RecIM/recim_logo.png';

const RosterCard = ({
  participants,
  teamName,
  withAttendance = false,
  attendance,
  isAdmin,
  matchID,
  teamID,
}) => (
  <Card>
    <CardHeader title={teamName ?? 'No team yet...'} className={styles.cardHeader} />
    <CardContent>
      <ParticipantList
        participants={participants}
        withAttendance={withAttendance}
        attendance={attendance}
        isAdmin={isAdmin}
        matchID={matchID}
        teamID={teamID}
      />
    </CardContent>
  </Card>
);

const Match = () => {
  const navigate = useNavigate();
  const { matchID } = useParams();
  const { profile } = useUser();
  const [match, setMatch] = useState();
  const [loading, setLoading] = useState(true);
  const [team0Score, setTeam0Score] = useState(0);
  const [team1Score, setTeam1Score] = useState(0);
  const [openMatchForm, setOpenMatchForm] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
  const [user, setUser] = useState();
  const [matchAttendance, setMatchAttendance] = useState();
  const [matchName, setMatchName] = useState();

  useEffect(() => {
    const loadData = async () => {
      if (profile) {
        setUser(await getParticipantByUsername(profile.AD_Username));
      }
    };
    loadData();
  }, [profile]);

  useEffect(() => {
    const loadMatch = async () => {
      setLoading(true);
      setMatch(await getMatchByID(matchID));
      setMatchAttendance(await getMatchAttendance(matchID));
      setLoading(false);
    };
    loadMatch();
  }, [matchID, openMatchForm]);
  // @TODO modify above dependency to only refresh upon form submit (not cancel)

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
      setMatchName(`${match?.Team[0]?.Name ?? 'TBD'} vs ${match?.Team[1]?.Name ?? 'TBD'}`);
      assignMatchScores();
    }
  }, [match]);

  const handleMatchFormSubmit = (status, setOpenMatchForm) => {
    //if you want to do something with the message make a snackbar function here
    setOpenMatchForm(false);
  };

  const handleDelete = () => {
    deleteMatchCascade(matchID);
    setOpenConfirmDelete(false);
    setOpenSettings(false);
    navigate(`/recim/activity/${match.Activity.ID}`);
    // @TODO add snackbar
  };

  if (loading && !profile) {
    return <GordonLoader />;
  } else if (!profile) {
    // The user is not logged in
    return <GordonUnauthorized feature={'the Rec-IM page'} />;
  } else {
    let headerContents = (
      <>
        <Grid container spacing={4}>
          <Grid item xs={6} textAlign="right">
            <Typography className={styles.subtitle}>
              {match && standardDate(match.StartTime, true)}
            </Typography>
          </Grid>
          <Grid item xs={6} textAlign="left">
            <Typography className={styles.subtitle}>@{match?.Surface}</Typography>
          </Grid>
        </Grid>
        <Grid container alignItems="center" justifyContent="space-around">
          <Grid item xs={2}>
            <img
              src={match?.Team.find((t) => t.ID === match?.Team[0]?.ID)?.Logo ?? defaultLogo}
              alt="Team Icon"
              width="85em"
            ></img>
          </Grid>
          <Grid item xs={2}>
            <LinkRouter to={`/recim/activity/${match?.Activity.ID}/team/${match?.Team[0]?.ID}`}>
              <Typography variant="h5" className={`${styles.teamName} gc360_text_link`}>
                {match?.Team[0]?.Name ?? 'No team yet...'}
              </Typography>
            </LinkRouter>
            <Typography className={styles.subtitle}>
              {/* once this is added to the API, it will instantly work */}
              {match?.Team[0]?.TeamRecord.WinCount ?? 0}W :{' '}
              {match?.Team[0]?.TeamRecord.LossCount ?? 0}L
            </Typography>
            {user?.IsAdmin && (
              <i className={styles.subtitle}>
                Sportsmanship: {match?.Scores[0]?.SportsmanshipScore}
              </i>
            )}
          </Grid>
          <Grid item container xs={4} sm={2} alignItems="center" direction="column">
            <Typography variant="h5">
              {team0Score} : {team1Score}
            </Typography>
            {user?.IsAdmin && (
              <Grid item>
                <Grid container columnSpacing={2} justifyItems="center">
                  <Grid item>
                    <IconButton
                      onClick={() => {
                        setOpenMatchForm(true);
                      }}
                      className={styles.editIconButton}
                    >
                      <EditIcon />
                    </IconButton>
                  </Grid>
                  <Grid item>
                    <IconButton
                      onClick={() => {
                        setOpenSettings(true);
                      }}
                    >
                      <SettingsIcon fontSize="large" />
                    </IconButton>
                  </Grid>
                </Grid>
              </Grid>
            )}
          </Grid>

          <Grid item xs={2} textAlign="right">
            <LinkRouter to={`/recim/activity/${match?.Activity.ID}/team/${match?.Team[1]?.ID}`}>
              <Typography variant="h5" className={`${styles.teamName} gc360_text_link`}>
                {match?.Team[1]?.Name ?? 'No team yet...'}
              </Typography>
            </LinkRouter>
            <Typography className={styles.subtitle}>
              {match?.Team[1]?.TeamRecord.WinCount ?? 0}W :{' '}
              {match?.Team[1]?.TeamRecord.LossCount ?? 0}L
            </Typography>
            {user?.IsAdmin && (
              <i className={styles.subtitle}>
                Sportsmanship: {match?.Scores[1]?.SportsmanshipScore}
              </i>
            )}
          </Grid>
          <Grid item xs={2}>
            <img
              src={match?.Team.find((t) => t.ID === match?.Team[1]?.ID)?.Logo ?? defaultLogo}
              alt="Team Icon"
              width="85em"
            ></img>
          </Grid>
        </Grid>
      </>
    );

    return (
      <>
        <Header match={match}>{headerContents}</Header>
        {loading ? (
          <GordonLoader />
        ) : (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <RosterCard
                participants={match.Team[0]?.Participant}
                teamName={match.Team[0]?.Name}
                withAttendance
                attendance={
                  matchAttendance?.find((item) => item.TeamID === match.Team[0]?.ID)?.Attendance
                }
                isAdmin={user?.IsAdmin}
                matchID={match.ID}
                teamID={match.Team[0]?.ID}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <RosterCard
                participants={match.Team[1]?.Participant}
                teamName={match.Team[1]?.Name}
                withAttendance
                attendance={
                  matchAttendance?.find((item) => item.TeamID === match.Team[1]?.ID)?.Attendance
                }
                isAdmin={user?.IsAdmin}
                matchID={match.ID}
                teamID={match.Team[1]?.ID}
              />
            </Grid>

            {/* forms and dialogs */}
            <MatchForm
              closeWithSnackbar={(status) => {
                handleMatchFormSubmit(status, setOpenMatchForm);
              }}
              openMatchForm={openMatchForm}
              setOpenMatchForm={(bool) => setOpenMatchForm(bool)}
              match={match}
            />
            <GordonDialogBox
              title="Admin Settings"
              fullWidth
              open={openSettings}
              cancelButtonClicked={() => setOpenSettings(false)}
              cancelButtonName="Close"
            >
              <br />
              <Grid container alignItems="center" justifyContent="space-between">
                <Grid item>
                  <Typography>Permanently delete the match '{matchName}'</Typography>
                </Grid>
                <Grid item>
                  <Button
                    color="error"
                    variant="contained"
                    onClick={() => setOpenConfirmDelete(true)}
                  >
                    Delete this match
                  </Button>
                </Grid>
              </Grid>
            </GordonDialogBox>
            <GordonDialogBox
              title="Confirm Delete"
              open={openConfirmDelete}
              cancelButtonClicked={() => setOpenConfirmDelete(false)}
              cancelButtonName="No, keep this team"
              buttonName="Yes, delete this team"
              buttonClicked={() => handleDelete()}
              severity="error"
            >
              <br />
              <Typography variant="body1">
                Are you sure you want to permanently delete this match: '{matchName}'?
              </Typography>
              <Typography variant="body1">This action cannot be undone.</Typography>
            </GordonDialogBox>
          </Grid>
        )}
      </>
    );
  }
};

export default Match;