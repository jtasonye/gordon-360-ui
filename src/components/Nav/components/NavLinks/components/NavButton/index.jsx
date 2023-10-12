import { ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { NavLink } from 'react-router-dom';

/**
 * A Navigation Button for the Right Corner Menu
 * @param {object} props the component props
 * @param {string} [props.unavailable] why the page linked to is unavailable. Either 'offline', 'unauthorized', or null
 * @param {Function} [props.onLinkClick] function called when link is clicked
 * @param {Function}  [props.openUnavailableDialog] function to open the dialog box when the linked page is unavailable
 * @param {boolean} props.divider whether or to add a divider
 * @param {string} props.linkName the name of the link
 * @param {string} [props.linkPath] the path to be linked to
 * @param {JSX.Element} [props.LinkIcon] An optional icon to include in the link
 * @returns {JSX.ELement} A NavButton with the specified content and behavior
 */
const GordonNavButton = ({
  unavailable,
  onLinkClick,
  openUnavailableDialog,
  divider = true,
  linkName,
  linkPath,
  LinkIcon,
}) => {
  const link =
    unavailable || linkPath === null ? (
      <ListItem divider={divider} disablePadding>
        <ListItemButton button onClick={onLinkClick} disabled={unavailable} className="gc360_link">
          {LinkIcon && (
            <ListItemIcon>
              <LinkIcon />
            </ListItemIcon>
          )}
          <ListItemText primary={linkName} />
        </ListItemButton>
      </ListItem>
    ) : (
      <ListItem divider={divider} disablePadding>
        <ListItemButton
          component={NavLink}
          to={linkPath}
          onClick={onLinkClick}
          end
          className="gc360_link"
        >
          {LinkIcon && (
            <ListItemIcon>
              <LinkIcon />
            </ListItemIcon>
          )}
          <ListItemText primary={linkName} />
        </ListItemButton>
      </ListItem>
    );

  if (unavailable) {
    return <div onClick={() => openUnavailableDialog(unavailable)}>{link}</div>;
  } else {
    return link;
  }
};

export default GordonNavButton;
