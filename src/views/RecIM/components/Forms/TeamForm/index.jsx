import {
  Button,
  Grid,
  DialogActions,
  DialogContent,
  DialogContentText,
  Tooltip,
} from '@mui/material';
import { useState, useMemo, useEffect, useRef } from 'react';
import GordonDialogBox from 'components/GordonDialogBox';
import { createTeam, editTeam, getTeamStatusTypes } from 'services/recim/team';
import { InformationField } from '../components/InformationField';
import { ConfirmationWindowHeader } from '../components/ConfirmationHeader';
import { ConfirmationRow } from '../components/ConfirmationRow';
import { ContentCard } from '../components/ContentCard';
import { isMobile } from 'react-device-detect';
import GordonLoader from 'components/Loader';
import Cropper from 'react-cropper';
import Dropzone from 'react-dropzone';
import { useUser } from 'hooks';
import { CropperHelper } from 'views/RecIM/components/Helpers/index';

const CROP_DIM = 200; // Width of cropped image canvas

const TeamForm = ({
  isAdmin,
  team,
  closeWithSnackbar,
  openTeamForm,
  setOpenTeamForm,
  activityID,
}) => {
  const [errorStatus, setErrorStatus] = useState({
    Name: false,
    ActivityID: false,
    Logo: false,
    statusID: false,
  });

  const { profile } = useUser();
  const [teamStatus, setTeamStatus] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setTeamStatus(await getTeamStatusTypes());
      setLoading(false);
    };
    loadData();
  }, [profile]);

  const createTeamFields = [
    {
      label: 'Name',
      name: 'Name',
      type: 'text',
      error: errorStatus.Name,
      helperText: '*Required',
    },
  ];
  if (team && isAdmin) {
    createTeamFields.push({
      label: 'Team Status',
      name: 'StatusID',
      type: 'select',
      menuItems: teamStatus.map((type) => {
        return type.Description;
      }),
      error: errorStatus.statusID,
      helperText: '*Required',
    });
  }

  const allFields = [createTeamFields].flat();

  const currentInfo = useMemo(() => {
    if (team) {
      return {
        Name: team.Name,
        ActivityID: Number(activityID),
        StatusID:
          teamStatus.find((type) => type.Description === team.Status) == null
            ? ''
            : teamStatus.find((type) => type.Description === team.Status).Description,
        Logo: team.Logo,
      };
    }
    return {
      Name: '',
      ActivityID: Number(activityID),
      Logo: null,
    };
  }, [activityID, team, teamStatus]);

  const [newInfo, setNewInfo] = useState(currentInfo);
  const [isSaving, setSaving] = useState(false);
  const [openConfirmWindow, setOpenConfirmWindow] = useState(false);
  const [disableUpdateButton, setDisableUpdateButton] = useState(true);
  const [cropperImageData, setCropperImageData] = useState(); //null if no picture chosen, else contains picture
  const [photoDialogError, setPhotoDialogError] = useState();
  const [aspectRatio, setAspectRatio] = useState();
  const [message, setMessage] = useState();
  const cropperRef = useRef();
  const [teamRequest, setTeamRequest] = useState({ ...currentInfo, ...newInfo });
  const cropperHelper = new CropperHelper();

  const handleSetError = (field, condition) => {
    const getCurrentErrorStatus = (currentValue) => {
      return {
        ...currentValue,
        [field]: condition,
      };
    };
    setErrorStatus(getCurrentErrorStatus);
  };

  // refresh dropdown select once fetch is complete
  useEffect(() => {
    setNewInfo(currentInfo);
    if (currentInfo.Logo !== null) {
      setCropperImageData(currentInfo.Logo);
    }
  }, [currentInfo]);

  // Field Validation
  useEffect(() => {
    let hasError = false;
    let hasChanges = false;
    for (const field in currentInfo) {
      if (currentInfo[field] !== newInfo[field] || currentInfo.Logo !== cropperRef.current) {
        hasChanges = true;
      }
      handleSetError(field, newInfo[field] === '');
      hasError = newInfo[field] === '' || hasError;
    }
    setDisableUpdateButton(hasError || !hasChanges);
  }, [newInfo, currentInfo]);

  const handleChange = (event, src) => {
    const getNewInfo = (currentValue) => {
      // datetime pickers return value rather than event,
      // so we can also manually specify target source and value
      if (src) {
        let newValue = event;
        return {
          ...currentValue,
          [src]: newValue,
        };
      }
      return {
        ...currentValue,
        [event.target.name]:
          event.target.type === 'checkbox' ? event.target.checked : event.target.value,
      };
    };
    setNewInfo(getNewInfo);
  };

  const getFieldLabel = (fieldName) => {
    const matchingField = allFields.find((field) => field.name === fieldName);
    return matchingField.label;
  };

  function getNewFields(currentInfo, newInfo) {
    const updatedFields = [];
    Object.entries(newInfo).forEach(([key, value]) => {
      if (currentInfo[key] !== value)
        updatedFields.push({
          Field: key,
          Value: value,
          Label: getFieldLabel(key),
        });
    });

    //push previous and new image if the Logos are different
    const prevLogo = currentInfo.Logo ?? 'None';
    const newLogo = teamRequest.Logo ?? 'None';
    if (prevLogo !== newLogo) {
      updatedFields.push({
        Field: 'Previous Logo',
        Value: prevLogo,
        Label: 'Previous Logo',
      });
      updatedFields.push({
        Field: 'New Logo',
        Value: newLogo,
        Label: 'New Logo',
      });
    }

    return updatedFields;
  }

  const handleSubmit = async () => {
    let newTeamRequest = { ...currentInfo, ...newInfo };
    newTeamRequest.Logo =
      cropperImageData != null
        ? cropperRef.current.cropper.getCroppedCanvas({ width: CROP_DIM }).toDataURL()
        : null;

    // wait for the value update on TeamRequest, otherwise the Confirm Window may not show images (prev and new) properly
    await setTeamRequest(newTeamRequest);
  };

  const handleConfirm = () => {
    setSaving(true);

    if (team) {
      teamRequest.StatusID = teamStatus.find(
        (type) => type.Description === teamRequest.StatusID,
      ).ID;

      editTeam(team.ID, teamRequest).then(() => {
        setSaving(false);
        closeWithSnackbar({
          type: 'success',
          message: 'Team edited successfully',
        });

        handleWindowClose();
      });
    } else {
      createTeam(profile.AD_Username, teamRequest).then((createdTeam) => {
        setSaving(false);
        closeWithSnackbar(createdTeam.ID, {
          type: 'success',
          message: 'Team created successfully',
        });

        handleWindowClose();
      });
    }
  };

  const handleWindowClose = () => {
    setOpenTeamForm(false);
    setOpenConfirmWindow(false);
    setNewInfo(currentInfo);
    setCropperImageData(null);
  };

  /*****************************************************************************************************
  /*Following functions are solely related to photo submission and essential to implement CropperHelper*
  /****************************************************************************************************/

  function onCropperZoom(event) {
    if (event.detail.ratio > 1) {
      event.preventDefault();
      cropperRef.current.cropper.zoomTo(1);
    }
  }

  async function onDropAccepted(fileList) {
    setPhotoDialogError(null);
    cropperHelper.onDropAccepted(fileList, setCropperImageData, setAspectRatio);
  }

  async function onDropRejected() {
    await cropperHelper.onDropRejected(setPhotoDialogError);
  }

  function createPhotoDialogBoxMessage() {
    cropperHelper
      .createPhotoDialogBoxMessage(
        photoDialogError,
        setPhotoDialogError,
        cropperImageData,
        isMobile,
      )
      .then((value) => setMessage(value));
  }

  /**
   * @param {Array<{name: string, label: string, type: string, menuItems: string[]}>} fields array of objects defining the properties of the input field
   * @returns JSX correct input for each field based on type
   */
  const mapFieldsToInputs = (fields) => {
    return fields.map((field) => (
      <InformationField
        key={field.name}
        error={field.error}
        label={field.label}
        name={field.name}
        helperText={field.helperText}
        value={newInfo[field.name]}
        type={field.type}
        menuItems={field.menuItems}
        onChange={handleChange}
        xs={12}
        sm={12}
        md={12}
        lg={12}
      />
    ));
  };
  if (loading) return <GordonLoader />;
  return (
    <GordonDialogBox
      open={openTeamForm}
      title={team ? 'Edit your team' : 'Create a Team'}
      fullWidth
      maxWidth="sm"
      buttonClicked={() => {
        handleSubmit();
        setOpenConfirmWindow(true);
      }}
      isButtonDisabled={disableUpdateButton}
      buttonName="Submit"
      cancelButtonClicked={() => {
        setNewInfo(currentInfo);
        setOpenTeamForm(false);
      }}
      cancelButtonName="cancel"
    >
      <ContentCard title="Team Information">
        {mapFieldsToInputs(createTeamFields)}
        <div className="gc360_photo_dialog_box">
          <DialogContent>
            <DialogContentText className="gc360_photo_dialog_box_content_text">
              {createPhotoDialogBoxMessage()}
              {photoDialogError ? <span style={{ color: '#B63228' }}>{message}</span> : message}
            </DialogContentText>
            {!cropperImageData && (
              <Dropzone
                onDropAccepted={onDropAccepted}
                onDropRejected={onDropRejected}
                accept="image/jpeg, image/jpg, image/png"
              >
                {({ getRootProps, getInputProps }) => (
                  <section>
                    <div className="gc360_photo_dialog_box_content_dropzone" {...getRootProps()}>
                      <input {...getInputProps()} />
                    </div>
                  </section>
                )}
              </Dropzone>
            )}
            {cropperImageData && (
              <div className="gc360_photo_dialog_box_content_cropper">
                <Cropper
                  ref={cropperRef}
                  src={cropperImageData}
                  autoCropArea={1}
                  viewMode={3}
                  aspectRatio={aspectRatio}
                  highlight={false}
                  background={false}
                  zoom={onCropperZoom}
                  zoomable={false}
                  dragMode={'none'}
                  checkCrossOrigin={false}
                />
              </div>
            )}
          </DialogContent>
          <DialogActions className="gc360_photo_dialog_box_actions_top">
            {cropperImageData && (
              <Tooltip classes={{ tooltip: 'tooltip' }} id="tooltip-hide" title="Remove this image">
                <Button
                  variant="outlined"
                  onClick={() => setCropperImageData(null)}
                  className="gc360_photo_dialog_box_content_button"
                >
                  Remove picture
                </Button>
              </Tooltip>
            )}
          </DialogActions>
        </div>
      </ContentCard>

      {/* Confirmation Dialog */}
      <GordonDialogBox
        open={openConfirmWindow}
        title="Confirm Your Team"
        buttonClicked={!isSaving && handleConfirm}
        buttonName="Confirm"
        // in case you want to authenticate something change isButtonDisabled
        isButtonDisabled={disableUpdateButton}
        cancelButtonClicked={!isSaving && handleWindowClose}
        cancelButtonName="Cancel"
      >
        <ConfirmationWindowHeader />
        <Grid container>
          {getNewFields(currentInfo, newInfo).map((field) => (
            <ConfirmationRow key={field} field={field} prevValue={currentInfo[field.Field]} />
          ))}
        </Grid>
        {isSaving && <GordonLoader size={32} />}
      </GordonDialogBox>
    </GordonDialogBox>
  );
};

export default TeamForm;