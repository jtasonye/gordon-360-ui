import { Avatar, IconButton } from '@mui/material';
import GordonLoader from 'components/Loader';
import { useUser } from 'hooks';
import styles from './NavAvatarRightCorner.module.css';
import { Link } from 'react-router-dom';

export const GordonNavAvatarRightCorner = () => {
  const { profile, images, loading } = useUser();
  const image = images?.pref || images?.def;

  return (
    <IconButton className={styles.button} component={Link} to="/myprofile">
      {loading ? (
        <GordonLoader size={68} color="secondary" />
      ) : image ? (
        <Avatar className={styles.root} src={`data:image/jpg;base64,${image}`} sizes="50px" />
      ) : (
        <Avatar className={styles.root}>
          {profile?.FirstName?.[0]} {profile?.LastName?.[0]}
        </Avatar>
      )}
    </IconButton>
  );
};
