import {
  Button,
  CardContent,
  Collapse,
  Grid,
  FormControlLabel,
  Switch,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddPhotoIcon from '@mui/icons-material/AddPhotoAlternate';
import { useUser } from 'hooks';
import useNetworkStatus from 'hooks/useNetworkStatus';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './NewsItem.module.css';

const NewsItem = ({
  posting,
  isUnapproved,
  size,
  handleNewsItemEdit,
  handleNewsImageEdit,
  handleNewsItemDelete,
  handleNewsApprovalStatus,
  isAdmin,
}) => {
  const [open, setOpen] = useState(false);
  const isOnline = useNetworkStatus();
  const { profile } = useUser();

  if (isUnapproved) {
    // Shows 'pending approval' instead of the date posted
    posting.dayPosted = <i>pending approval...</i>;
  }

  const author = (
    <Typography className={styles.news_column}>
      {!isOnline || isUnapproved ? (
        posting.author
      ) : (
        <Link className={styles.news_authorProfileLink} to={`/profile/${posting.ADUN}`}>
          {posting.author}
        </Link>
      )}
    </Typography>
  );

  // Only show the edit button if the current user is the author of the posting OR is the Student News admin
  // AND posting is unapproved
  // null check temporarily fixes issue on home card when user has not yet been authenticated
  // it is because the home card doesn't give these properties
  let editButton;
  if (
    (profile?.AD_Username?.toLowerCase() === posting.ADUN.toLowerCase() || isAdmin) &&
    isUnapproved
  ) {
    editButton = (
      <Button
        variant="outlined"
        color="primary"
        startIcon={<EditIcon />}
        onClick={() => handleNewsItemEdit(posting.SNID)}
        className={styles.btn}
      >
        Edit
      </Button>
    );
  } else {
    editButton = <div></div>;
  }

  // Only show the edit image button if the current user is the author of the posting OR is the Student News admin
  // AND posting is unapproved
  // null check temporarily fixes issue on home card when user has not yet been authenticated
  // it is because the home card doesn't give these properties
  let editImageButton;
  if (
    (profile?.AD_Username?.toLowerCase() === posting.ADUN.toLowerCase() || isAdmin) &&
    isUnapproved
  ) {
    editImageButton = (
      <Button
        variant="outlined"
        color="primary"
        startIcon={posting.Image === null ? <AddPhotoIcon /> : <EditIcon />}
        onClick={() => handleNewsImageEdit(posting.SNID)}
        className={styles.btn}
      >
        {posting.Image === null ? 'Attach Image' : 'Edit Image'}
      </Button>
    );
  } else {
    editImageButton = <div></div>;
  }

  // Only show the accepted status switch if the current user is the Student News admin
  let acceptedStatusSwitch;
  if (isAdmin) {
    acceptedStatusSwitch = (
      <FormControlLabel
        control={
          <Switch
            onChange={() => handleNewsApprovalStatus(posting.SNID, isUnapproved)}
            checked={!isUnapproved}
          />
        }
        label={isUnapproved ? 'Unapproved' : 'Approved'}
        labelPlacement="bottom"
        disabled={!isOnline}
      />
    );
  } else {
    acceptedStatusSwitch = null;
  }

  // Only show the delete button if the current user is the author of the posting
  // OR is the Student News admin
  // null check temporarily fixes issue on home card when user has not yet been authenticated
  let deleteButton;
  if (profile?.AD_Username?.toLowerCase() === posting.ADUN.toLowerCase() || isAdmin) {
    deleteButton = (
      <Button
        variant="outlined"
        color="primary"
        startIcon={<DeleteIcon />}
        onClick={() => {
          handleNewsItemDelete(posting.SNID);
        }}
        className={`${styles.btn} ${styles.deleteButton}`}
      >
        Delete
      </Button>
    );
  } else {
    deleteButton = <div></div>;
  }

  // SINGLE SIZE - single column per news item
  if (size === 'single') {
    return (
      <Grid
        container
        onClick={() => {
          setOpen(!open);
        }}
        className={`${styles.news_item} ${isUnapproved ? styles.unapproved : styles.approved}`}
        justifyContent="center"
      >
        <Grid item xs={12}>
          <Typography variant="h6" className={styles.news_heading} style={{ fontWeight: 'bold' }}>
            {posting.Subject}
          </Typography>
          {author}
        </Grid>
        <Collapse in={open} timeout="auto" unmountOnExit>
          <CardContent>
            <Typography className={styles.news_content}>"{posting.categoryName}"</Typography>
            <Typography className={styles.news_content}>{posting.Body}</Typography>
            {posting.Image !== null && <img src={`${posting.Image}`} alt=" " />}
          </CardContent>
          <Grid container justifyContent="space-evenly">
            {editButton}
            {editImageButton}
            {deleteButton}
            {acceptedStatusSwitch}
          </Grid>
        </Collapse>
      </Grid>
    );
  }
  // FULL SIZE - many columns per news item
  else if (size === 'full') {
    return (
      <Grid
        container
        direction="row"
        onClick={() => {
          setOpen(!open);
        }}
        className={`${styles.news_item} ${isUnapproved ? styles.unapproved : styles.approved}`}
      >
        <Grid item xs={2}>
          <Typography className={styles.news_column}>{posting.categoryName}</Typography>
        </Grid>
        <Grid item xs={5}>
          <Typography className={styles.news_column} style={{ fontWeight: 'bold' }}>
            {posting.Subject}
          </Typography>
        </Grid>
        <Grid item xs={3}>
          {author}
        </Grid>
        <Grid item xs={2}>
          <Typography className={styles.news_column}>{posting.dayPosted}</Typography>
        </Grid>

        {/* Collapsable details */}
        <Collapse in={open} timeout="auto" unmountOnExit style={{ width: '100%' }}>
          <CardContent>
            <Grid container direction="row" alignItems="center" justifyContent="space-around">
              <Grid item xs={8} style={{ textAlign: 'left' }}>
                <Typography className={styles.descriptionText}>Description:</Typography>
                <Typography type="caption" className={styles.descriptionText}>
                  {posting.Body}
                </Typography>
                {posting.Image !== null && <img src={`${posting.Image}`} alt=" " />}
              </Grid>
              {/* Possible action buttons */}
              <Grid item xs={4}>
                <Grid container justifyContent="space-evenly">
                  {/* these conditionally render - see respective methods */}
                  {editButton}
                  {editImageButton}
                  {deleteButton}
                  {acceptedStatusSwitch}
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
        </Collapse>
      </Grid>
    );
  }
};

NewsItem.propTypes = {
  posting: PropTypes.shape({
    SNID: PropTypes.number.isRequired,
    Subject: PropTypes.string.isRequired,
    ADUN: PropTypes.string.isRequired,
    Entered: PropTypes.string.isRequired,
    categoryName: PropTypes.string.isRequired,
    Body: PropTypes.string.isRequired,
    // Expiration: PropTypes.string.isRequired,
  }).isRequired,

  isUnapproved: PropTypes.any,
  size: PropTypes.string.isRequired,
  handleNewsItemEdit: PropTypes.func.isRequired,
  handleNewsItemDelete: PropTypes.func.isRequired,
  handleNewsApprovalStatus: PropTypes.func.isRequired,
  isAdmin: PropTypes.bool.isRequired,
};

export default NewsItem;
