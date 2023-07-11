import LightbulbIcon from '@mui/icons-material/Lightbulb';

/* Temporary component for testing theme implementation and dark mode.  Used in the right side
nav menu currently.

@TODO convert to some final implementation
*/
import {
  //   Experimental_CssVarsProvider as CssVarsProvider,
  useColorScheme,
} from '@mui/material/styles';
import styles from './modeSwitcher.module.css';

export const ModeSwitcher = () => {
  const { mode, setMode } = useColorScheme();

  return (
    <>
      <button
        onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
        className={styles.ModeSwitcherButton}
      >
        {mode === 'light' ? 'Dark Mode' : 'Light Mode'}
      </button>
      <LightbulbIcon />
    </>
  );
};
