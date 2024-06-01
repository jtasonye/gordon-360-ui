import About from './views/About';
import Admin from './views/Admin';
import ApartmentApp from './views/ApartmentApp';
import BannerSubmission from './views/BannerSubmission';
import CoCurricularTranscript from './views/CoCurricularTranscript';
import EnrollmentCheckIn from './views/EnrollmentCheckIn';
import Events from './views/Events';
import EventsAttended from './views/EventsAttended';
import Feedback from './views/Feedback';
import Help from './views/Help';
import Root from './views/Root';
import Home from './views/Home';
import IDUploader from './views/IDUploader';
import InvolvementProfile from './views/InvolvementProfile';
import InvolvementsAll from './views/InvolvementsAll';
import Links from './views/Links';
import MyProfile from './views/MyProfile';
import News from './views/News';
import Page404 from './views/Page404';
import PeopleSearch from './views/PeopleSearch';
import ProfileNotFound from './views/ProfileNotFound';
import PublicProfile from './views/PublicProfile';
import RecIM from './views/RecIM';
import { createBrowserRouter } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    handle: {
      title: () => 'Gordon 360',
    },
    children: [
      { index: true, element: <Home /> },
      {
        path: 'about',
        element: <About />,
        handle: {
          title: () => 'About',
        },
      },
      {
        path: 'ApartApp',
        element: <ApartmentApp />,
        handle: {
          title: () => 'Apartment Application',
        },
      },
      {
        path: 'activity/:sessionCode/:involvementCode',
        element: <InvolvementProfile />,
        handle: { title: () => 'Involvement Profile' },
      },
      {
        path: 'involvements',
        element: <InvolvementsAll />,
        handle: { title: () => 'Involvements' },
      },
      {
        path: 'help',
        element: <Help />,
        handle: { title: () => 'Help' },
      },
      {
        path: 'transcript',
        element: <CoCurricularTranscript />,
        handle: { title: () => 'Experience Transcript' },
      },
      {
        path: 'events',
        element: <Events />,
        handle: { title: () => 'Events' },
      },
      {
        path: 'attended',
        element: <EventsAttended />,
        handle: { title: () => 'Attended' },
      },
      {
        path: 'feedback',
        element: <Feedback />,
        handle: { title: () => 'Feedback' },
      },
      {
        path: 'profile/null',
        element: <ProfileNotFound />,
        handle: { title: () => 'Not Found' },
      },
      {
        path: 'profile/:username',
        element: <PublicProfile />,
        handle: { title: () => 'Profile' },
      },
      {
        path: 'myprofile',
        element: <MyProfile />,
        handle: { title: () => 'My Profile' },
      },
      {
        path: 'enrollmentcheckin',
        element: <EnrollmentCheckIn />,
        handle: { title: () => 'Enrollment Check-In' },
      },
      {
        path: 'people',
        element: <PeopleSearch />,
        handle: { title: () => 'People' },
      },
      {
        path: 'id',
        element: <IDUploader />,
        handle: { title: () => 'ID Uploader' },
      },
      {
        path: 'admin',
        element: <Admin />,
        handle: { title: () => 'Admin' },
      },
      {
        path: 'banner',
        element: <BannerSubmission />,
        handle: { title: () => 'Banner' },
      },
      {
        path: 'news',
        element: <News />,
        handle: { title: () => 'News' },
      },
      {
        path: 'links',
        element: <Links />,
        handle: { title: () => 'Links' },
      },
      {
        path: 'recim/*',
        element: <RecIM />,
        handle: { title: () => 'Rec-IM' },
      },
      {
        path: '*',
        element: <Page404 />,
        handle: { title: () => 'Page Not Found' },
      },
    ],
  },
]);

export default router;
