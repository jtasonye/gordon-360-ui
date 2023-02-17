import { useIsAuthenticated } from '@azure/msal-react';
import { AppBar, Button, IconButton, Tab, Tabs, Toolbar, Typography } from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import RecIMIcon from '@mui/icons-material/SportsFootball';
import HomeIcon from '@mui/icons-material/Home';
import LocalActivityIcon from '@mui/icons-material/LocalActivity';
// import WorkIcon from '@mui/icons-material/Work';
import WellnessIcon from '@mui/icons-material/LocalHospital';
import MenuIcon from '@mui/icons-material/Menu';
import PeopleIcon from '@mui/icons-material/People';
import GordonDialogBox from 'components/GordonDialogBox/index';
import { useDocumentTitle, useNetworkStatus, useWindowSize } from 'hooks';
import { projectName } from 'project-name';
import { forwardRef, useEffect, useState } from 'react';
import { NavLink, Route, Switch } from 'react-router-dom';
import routes from 'routes';
import { authenticate } from 'services/auth';
import { windowBreakWidths } from 'theme';
import { GordonNavAvatarRightCorner } from './components/NavAvatarRightCorner';
import GordonNavButtonsRightCorner from './components/NavButtonsRightCorner';
import GordonQuickSearch from './components/QuickSearch';
import styles from './Header.module.css';

const ForwardNavLink = forwardRef((props, ref) => <NavLink innerRef={ref} {...props} />);

const GordonHeader = ({ onDrawerToggle }) => {
  const [tabIndex, setTabIndex] = useState(0);
  const [dialog, setDialog] = useState('');
  const [width] = useWindowSize();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [anchorElement, setAnchorElement] = useState(null);
  const isOnline = useNetworkStatus();
  const setDocumentTitle = useDocumentTitle();
  const isAuthenticated = useIsAuthenticated();

  /**
   * Update the tab highlight indicator based on the url
   *
   * The checks use regular expressions to check for matches in the url.
   */
  const updateTabHighlight = () => {
    let currentPath = window.location.pathname;
    // Tab url regular expressions must be listed in the same order as the tabs, since the
    // indices of the elements in the array on the next line are mapped to the indices of the tabs
    let urls = [
      /^\/$/,
      /^\/involvements\/?$|^\/activity/,
      /^\/events\/?$/,
      /^\/people$/,
      /^\/wellness$/,
      /^\/recim$/,
    ];
    setTabIndex(false);
    for (let i = 0; i < urls.length; i++) {
      if (urls[i].test(currentPath)) {
        setTabIndex(i);
      }
    }
  };

  useEffect(() => {
    updateTabHighlight();
  });

  useEffect(() => {
    if (width < windowBreakWidths.breakMD) {
      setIsMenuOpen(false);
    }
  }, [width]);

  const createDialogBox = () => {
    if (dialog === 'offline') {
      return (
        <GordonDialogBox
          open={dialog}
          onClose={() => setDialog(null)}
          title={'Offline Mode'}
          buttonClicked={() => setDialog(null)}
          buttonName={'Okay'}
        >
          This feature is unavailable offline. Please reconnect to internet to access this feature.
        </GordonDialogBox>
      );
    } else if (dialog === 'unauthorized') {
      return (
        <GordonDialogBox
          open={dialog}
          onClose={() => setDialog(null)}
          title={'Credentials Needed'}
          buttonClicked={() => setDialog(null)}
          buttonName={'Okay'}
        >
          This feature is unavailable while not logged in. Please log in to access it.
        </GordonDialogBox>
      );
    } else {
      return null;
    }
  };

  const requiresAuthTab = (name, icon) => {
    if (!isOnline) {
      return (
        <Tab
          className={`${styles.tab} ${styles.disabled_tab}`}
          icon={icon}
          label={name}
          onClick={() => setDialog('offline')}
        />
      );
    } else if (!isAuthenticated) {
      return (
        <Tab
          className={`${styles.tab} ${styles.disabled_tab}`}
          icon={icon}
          label={name}
          onClick={() => setDialog('unauthorized')}
        />
      );
    } else {
      const route = `/${name.toLowerCase().replace('-', '')}`;
      return (
        <Tab
          className={styles.tab}
          icon={icon}
          label={name}
          component={ForwardNavLink}
          to={route}
        />
      );
    }
  };

  const handleOpenMenu = (event) => {
    setAnchorElement(event.currentTarget);
    setIsMenuOpen(true);
  };

  const handleCloseMenu = () => {
    setAnchorElement(null);
    setIsMenuOpen(false);
  };

  const loginButton = (
    <Button
      className={styles.login_button}
      variant="contained"
      color="secondary"
      onClick={authenticate}
    >
      Login
    </Button>
  );

  return (
    <section className={styles.gordon_header}>
      <AppBar className={styles.app_bar} position="static">
        <Toolbar>
          <IconButton
            className={styles.menu_button}
            color="primary"
            aria-label="open drawer"
            onClick={onDrawerToggle}
            size="large"
          >
            <MenuIcon className={styles.menu_button_icon} />
          </IconButton>

          <Typography className={`disable_select ${styles.title}`} variant="h6" color="inherit">
            <Switch>
              {routes.map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  exact={route.exact}
                  component={() => {
                    setDocumentTitle(route.name || projectName);
                    return <span>{route.name || projectName}</span>;
                  }}
                />
              ))}
            </Switch>
          </Typography>

          <div className={styles.center_container}>
            <Tabs
              textColor="inherit"
              indicatorColor="secondary"
              centered
              value={tabIndex}
              onChange={(event, value) => setTabIndex(value)}
            >
              <Tab
                className={styles.tab}
                icon={<HomeIcon />}
                label="Home"
                component={ForwardNavLink}
                to="/"
              />
              <Tab
                className={styles.tab}
                icon={<LocalActivityIcon />}
                label="Involvements"
                component={ForwardNavLink}
                to="/involvements"
              />
              <Tab
                className={styles.tab}
                icon={<EventIcon />}
                label="Events"
                component={ForwardNavLink}
                to="/events"
              />
              {requiresAuthTab('People', <PeopleIcon />)}
              {/* {requiresAuthTab('Timesheets', WorkIcon)} */}
              {requiresAuthTab('Wellness', <WellnessIcon />)}
              {requiresAuthTab('Rec-IM', <RecIMIcon />)}
            </Tabs>
          </div>

          <div className={styles.people_search_container_container}>
            {/* Width is dynamic */}
            <div className={styles.people_search_container}>
              {isAuthenticated ? <GordonQuickSearch /> : loginButton}
            </div>
          </div>

          <GordonNavAvatarRightCorner onClick={handleOpenMenu} menuOpened={isMenuOpen} />

          <GordonNavButtonsRightCorner
            open={isMenuOpen}
            openDialogBox={setDialog}
            anchorEl={anchorElement}
            onClose={handleCloseMenu}
          />

          {createDialogBox()}
        </Toolbar>
      </AppBar>
    </section>
  );
};

export default GordonHeader;
