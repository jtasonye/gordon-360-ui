import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  FormControl,
  Grid,
  Input,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@material-ui/core';
import { useParams } from 'react-router';
import InvolvementsGrid from './components/InvolvementsGrid';
import GordonLoader from 'components/Loader';
import Requests from './components/Requests';
import userService from 'services/user';
import involvementService from 'services/activity';
import sessionService from 'services/session';
import useNetworkStatus from 'hooks/useNetworkStatus';
import './involvements-all.css';

const InvolvementsAll = ({ authentication, history }) => {
  const [currentAcademicSession, setCurrentAcademicSession] = useState('');
  const [involvements, setInvolvements] = useState([]);
  const [allInvolvements, setAllInvolvements] = useState([]);
  const [myInvolvements, setMyInvolvements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSession, setSelectedSession] = useState('');
  const [sessions, setSessions] = useState([]);
  const [type, setType] = useState('');
  const [types, setTypes] = useState([]);
  const isOnline = useNetworkStatus();

  const { session: sessionFromURL } = useParams();

  useEffect(() => {
    const loadPage = async () => {
      setSessions(await sessionService.getAll());

      if (sessionFromURL) {
        setSelectedSession(sessionFromURL);
      } else {
        const { SessionCode } = await sessionService.getCurrent();
        setCurrentAcademicSession(currentAcademicSession || SessionCode);
        const [involvements, sessions] = await Promise.all([
          involvementService.getAll(SessionCode),
          sessionService.getAll(),
        ]);

        if (involvements.length === 0) {
          let IndexOfCurrentSession = sessions.findIndex(
            (session) => session.SessionCode === SessionCode,
          );

          for (let k = IndexOfCurrentSession + 1; k < sessions.length; k++) {
            const newInvolvements = await involvementService.getAll(sessions[k].SessionCode);
            if (newInvolvements.length !== 0) {
              setSelectedSession(sessions[k].SessionCode);

              break;
            }
          }
        } else {
          setSelectedSession(SessionCode);
        }
      }
      setLoading(false);
    };
    loadPage();
  }, [currentAcademicSession, authentication, sessionFromURL]);

  useEffect(() => {
    if (selectedSession) {
      history.push(`?session=${selectedSession}`);
    }
  }, [history, selectedSession]);

  useEffect(() => {
    const updateInvolvements = async () => {
      setLoading(true);
      const allInvolvements = await involvementService.getAll(selectedSession);
      setInvolvements(involvementService.filter(allInvolvements, type, search));
      setAllInvolvements(allInvolvements);
      setTypes(await involvementService.getTypes(selectedSession));
      if (authentication) {
        const { id } = await userService.getLocalInfo();
        setMyInvolvements(
          await userService.getSessionMembershipsWithoutGuests(id, selectedSession),
        );
      }
      setLoading(false);
    };

    updateInvolvements();
  }, [selectedSession, authentication, type, search]);

  useEffect(() => {
    setInvolvements(involvementService.filter(allInvolvements, type, search));
  }, [allInvolvements, type, search]);

  let myInvolvementsHeadingText;
  let myInvolvementsNoneText;
  if (selectedSession === currentAcademicSession) {
    myInvolvementsHeadingText = 'Current';
    myInvolvementsNoneText =
      "It looks like you're not currently a member of any Involvements. Get connected below!";
  } else {
    let involvementDescription = sessions.find((s) => s.SessionCode === selectedSession)
      ?.SessionDescription;
    myInvolvementsHeadingText = involvementDescription;
    myInvolvementsNoneText = 'No personal involvements found for this term';
  }

  return (
    <Grid container justify="center" spacing={4}>
      <Grid item className="involvements-filter" xs={12} lg={8}>
        <Grid container spacing={2}>
          <Grid item xs={12} lg={6}>
            <TextField
              id="search"
              label="Search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              margin="none"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <FormControl fullWidth>
              <InputLabel htmlFor="activity-session">Term</InputLabel>
              <Select
                value={selectedSession}
                onChange={(e) => setSelectedSession(e.target.value)}
                input={<Input id="activity-session" />}
              >
                {(isOnline
                  ? sessions
                  : sessions.filter((item) => item.SessionCode === selectedSession)
                ).map(({ SessionDescription: description, SessionCode: code }) => (
                  <MenuItem label={description} value={code} key={code}>
                    {description}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <FormControl fullWidth>
              <InputLabel htmlFor="activity-type">Type</InputLabel>
              <Select
                value={type}
                onChange={(event) => setType(event.target.value)}
                input={<Input id="activity-type" />}
              >
                <MenuItem label="All" value="">
                  <em>All</em>
                </MenuItem>
                {types.map((type) => (
                  <MenuItem value={type} key={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Grid>

      {isOnline && authentication && (
        <Requests />
      )}

      <Grid item xs={12} lg={8}>
        <Card>
          <CardHeader title={`${myInvolvementsHeadingText} Involvements`} className="involvements-header" />
          <CardContent>
            {/* My Involvements (private) */}
            {authentication && (
              <>
                {loading ? (
                  <GordonLoader />
                ) : (
                  <InvolvementsGrid
                    involvements={myInvolvements}
                    sessionCode={selectedSession}
                    noInvolvementsText={myInvolvementsNoneText}
                  />
                )}
                <br></br>
                <hr width="70%"></hr>
                <br></br>
              </>
            )}

             {/* All Involvements (public) */}
            {loading ? (
              <GordonLoader />
            ) : (
              <InvolvementsGrid
                involvements={involvements}
                sessionCode={selectedSession}
                noInvolvementsText="There aren't any involvements for the selected session and type"
              />
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default InvolvementsAll;
