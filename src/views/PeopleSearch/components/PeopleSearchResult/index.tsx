import { Card, CardActionArea, CardContent, CardMedia, Divider, Typography } from '@mui/material';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import VisibilitySensor from 'react-visibility-sensor';
import { Class, SearchResult } from 'services/peopleSearch';
import { useWindowSize } from 'hooks';
import userService from 'services/user';
import styles from './PeopleSearchResult.module.css';
import { BorderAll } from '@mui/icons-material';

/*Const string was created with https://png-pixel.com/ .
 *It is a 1 x 1 pixel with the same color as gordonColors.neutral.lightGray (7/9/21)
 */
const GORDONCOLORS_NEUTRAL_LIGHTGRAY_1X1 =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/erVfwAJRwPA/3pinwAAAABJRU5ErkJggg==';
const JPG_BASE64_HEADER = 'data:image/jpg;base64,';
const breakpointWidth = 810;

const SecondaryText = ({
  children,
  ...otherProps
}: {
  children: ReactNode;
  [props: string]: any;
}) => (
  <Typography variant="body2" color="textSecondary" {...otherProps}>
    {children}
  </Typography>
);

interface Props {
  person: SearchResult;
  lazyLoadAvatar: boolean;
}

const PeopleSearchResult = ({ person, lazyLoadAvatar }: Props) => {
  const [avatar, setAvatar] = useState<string | null>(
    person.AD_Username ? GORDONCOLORS_NEUTRAL_LIGHTGRAY_1X1 : null,
  );
  const [hasBeenRun, setHasBeenRun] = useState(false);
  const [width] = useWindowSize();
  const navigate = useNavigate();
  const isMobileView = width < breakpointWidth;

  const loadAvatar = useCallback(async () => {
    if (person.AD_Username) {
      const { def: defaultImage, pref: preferredImage } = await userService.getImage(
        person.AD_Username,
      );

      setAvatar(JPG_BASE64_HEADER + (preferredImage || defaultImage));
    }
    setHasBeenRun(true);
  }, [person.AD_Username]);

  useEffect(() => {
    if (!lazyLoadAvatar && !hasBeenRun) {
      loadAvatar();
    }
  }, [hasBeenRun, lazyLoadAvatar, loadAvatar]);

  const handleVisibilityChange = (isVisible: boolean) => {
    if (lazyLoadAvatar && isVisible && !hasBeenRun) loadAvatar();
  };

  const fullName = `${person.FirstName} ${person.LastName}`;
  const nickname =
    person?.NickName && person.NickName !== person.FirstName ? `(${person.NickName})` : null;
  const maidenName =
    person?.MaidenName && person.MaidenName !== person.LastName ? `(${person.MaidenName})` : null;

  let classOrJobTitle,
    mailLocation = '';
  switch (person.Type) {
    case 'Student':
      classOrJobTitle = Class[person.Class];
      mailLocation = `Mailbox #${person.Mail_Location}`;
      break;

    case 'Faculty':
    case 'Staff':
      classOrJobTitle = person.JobTitle;
      mailLocation = `Mailstop: ${person.Mail_Location}`;
      break;

    default:
      break;
  }

  const emailIcon = isMobileView ? (
    <></>
  ) : (
    <Card className={styles.mailingIconContainer}>
      <CardActionArea className={styles.mailAction}>
        <a href={`mailto:${person.Email}`}>
          <div>
            <MailOutlineIcon
              sx={{
                fontSize: 30,
                color: 'white',
                height: '100%',
                backgroundColor: 'blue',
                // borderRadius: 4,
              }}
            />
          </div>
        </a>
      </CardActionArea>
    </Card>
  );

  return (
    <>
      <VisibilitySensor onChange={handleVisibilityChange}>
        <Card className={styles.resultContainer} elevation={0}>
          <CardActionArea
            style={{ flex: 7 }}
            className="gc360_link"
            onClick={() => {
              navigate(`/profile/${person.AD_Username}`);
            }}
          >
            {/* <Link style={{ flex: 7 }} className="gc360_link" to={`/profile/${person.AD_Username}`}> */}
            <Card className={styles.result} elevation={0}>
              {avatar && (
                <CardMedia
                  src={avatar}
                  title={fullName}
                  component="img"
                  className={styles.avatar}
                />
              )}
              <CardContent>
                <Typography variant="h5" className={styles.name}>
                  {person.FirstName} {nickname} {person.LastName} {maidenName}
                </Typography>
                <Typography className={styles.subtitle}>
                  {classOrJobTitle ?? person.Type}
                  {person.Type === 'Alumni' && person.PreferredClassYear
                    ? ' ' + person.PreferredClassYear
                    : null}
                </Typography>
                <SecondaryText className={styles.secondary_text}>
                  {(person.Type === 'Student' || person.Type === 'Alumni') && (
                    <>
                      {person.Major1Description}
                      {person.Major2Description
                        ? (person.Major1Description ? ', ' : '') + `${person.Major2Description}`
                        : null}
                      {person.Type === 'Student' && person.Major3Description
                        ? `, ${person.Major3Description}`
                        : null}
                    </>
                  )}
                </SecondaryText>
                <SecondaryText className={styles.secondary_text}>{person.Email}</SecondaryText>
                <SecondaryText className={styles.secondary_text}>{mailLocation}</SecondaryText>
              </CardContent>
            </Card>
            {/* </Link> */}
          </CardActionArea>
          {emailIcon}
        </Card>
      </VisibilitySensor>
      <Divider />
    </>
  );
};

export default PeopleSearchResult;
