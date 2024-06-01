import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import './app.global.css';
import ErrorBoundary from './components/ErrorBoundary';
import analytics from './services/analytics';
import router from 'routes';

const App = () => {
  useEffect(() => {
    // Only use analytics in production
    if (import.meta.env.PROD) {
      analytics.initialize();
    }
  }, []);

  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
};

export default App;
