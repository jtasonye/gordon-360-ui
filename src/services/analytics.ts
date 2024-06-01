import ReactGA from 'react-ga4';

let hasBeenInitialized = false;

const onError = (description: string) => {
  ReactGA.send({
    hitType: 'exception',
    exDescription: description,
  });
};

/**
 * Track an event
 *
 * @param category Top level category for the event, e.g. 'User', 'Navigation', etc.
 * @param action Description of what happened in the event, e.g. 'Edited activity'
 * @param label More specific description of the action
 * @param value If applicable, a numerical value for the event
 * @returns nothing
 */
const onEvent = (category: string, action: string, label?: string, value?: number) =>
  ReactGA.event({
    category,
    action,
    label,
    value,
  });

const onPageView = (title?: string) =>
  ReactGA.send({
    hitType: 'pageview',
    page: window.location.pathname + window.location.search,
    title: title ?? null,
  });

const initialize = () => {
  ReactGA.initialize(import.meta.env.VITE_ANALYTICS_ID ?? 'G-2FE78G0CBN');
  hasBeenInitialized = true;
  // Set user role
  // TODO get user role from JWT
  ReactGA.set({ dimension1: 'god' });
  onPageView();
};

const analyticsService = {
  initialize,
  isInitialized: () => hasBeenInitialized,
  onError,
  onEvent,
  onPageView,
};

export default analyticsService;
