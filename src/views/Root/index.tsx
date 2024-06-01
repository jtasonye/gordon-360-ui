import AppRedirect from 'components/AppRedirect';
import BirthdayMessage from 'components/BirthdayMessage';
import GordonHeader from 'components/Header';
import GordonNav from 'components/Nav';
import { useRouteTitle, useWatchSystemColorScheme } from 'hooks';
import { useEffect, useState } from 'react';
import styles from './Root.module.css';
import { Outlet, useLocation } from 'react-router';
import analytics from 'services/analytics';

export default function Root() {
  useWatchSystemColorScheme();
  useRouteTitle();
  const location = useLocation();

  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (analytics.isInitialized()) {
      analytics.onPageView();
    }
  }, [location]);

  const onDrawerToggle = () => {
    setDrawerOpen((o) => !o);
  };

  return (
    <>
      <GordonHeader onDrawerToggle={onDrawerToggle} />
      <GordonNav onDrawerToggle={onDrawerToggle} drawerOpen={drawerOpen} />
      <main className={styles.app_main}>
        <BirthdayMessage />
        <AppRedirect />
        <Outlet />
      </main>
    </>
  );
}
