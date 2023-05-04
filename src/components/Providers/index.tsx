import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import UserContextProvider from 'contexts/UserContext';
import 'app.global.css';
import NetworkContextProvider from 'contexts/NetworkContext';
import theme from 'theme';
import AuthProvider from './components/AuthProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient();

const Providers = ({ children }: { children: JSX.Element }) => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <NetworkContextProvider>
            <UserContextProvider>{children}</UserContextProvider>
          </NetworkContextProvider>
        </ThemeProvider>
      </StyledEngineProvider>
    </AuthProvider>
    <ReactQueryDevtools />
  </QueryClientProvider>
);

export default Providers;
