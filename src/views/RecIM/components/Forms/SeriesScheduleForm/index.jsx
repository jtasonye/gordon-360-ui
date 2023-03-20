import { Grid } from '@mui/material';
import { useState, useEffect, useMemo } from 'react';
import GordonLoader from 'components/Loader';
import GordonDialogBox from 'components/GordonDialogBox';
import { ConfirmationRow } from '../components/ConfirmationRow';
import { ConfirmationWindowHeader } from '../components/ConfirmationHeader';
import { ContentCard } from '../components/ContentCard';
import { InformationField } from '../components/InformationField';
import { putSeriesSchedule } from 'services/recim/series';
import { getSurfaces } from 'services/recim/match';

const SeriesScheduleForm = ({
  closeWithSnackbar,
  openSeriesScheduleForm,
  setOpenSeriesScheduleForm,
  seriesID,
}) => {
  const [errorStatus, setErrorStatus] = useState({
    AvailableDays: false,
    AvailableSurfaceIDs: false,
    DailyStartTime: false,
    DailyEndTime: false,
    EstMatchTime: false,
  });

  // Fetch data required for form creation
  const [loading, setLoading] = useState(true);
  const [surfaces, setSurfaces] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setSurfaces(await getSurfaces());
      setLoading(false);
    };
    loadData();
  }, []);

  const seriesScheduleFields = [
    {
      label: 'Monday',
      name: 'Mon',
      type: 'checkbox',
      error: errorStatus.AvailableDays,
      helperText: '*Required',
    },
    {
      label: 'Tuesday',
      name: 'Tue',
      type: 'checkbox',
      error: errorStatus.AvailableDays,
      helperText: '*Required',
    },
    {
      label: 'Wednesday',
      name: 'Wed',
      type: 'checkbox',
      error: errorStatus.AvailableDays,
      helperText: '*Required',
    },
    {
      label: 'Thursday',
      name: 'Thu',
      type: 'checkbox',
      error: errorStatus.AvailableDays,
      helperText: '*Required',
    },
    {
      label: 'Friday',
      name: 'Fri',
      type: 'checkbox',
      error: errorStatus.AvailableDays,
      helperText: '*Required',
    },
    {
      label: 'Saturday',
      name: 'Sat',
      type: 'checkbox',
      error: errorStatus.AvailableDays,
      helperText: '*Required',
    },
    {
      label: 'Sunday',
      name: 'Sun',
      type: 'checkbox',
      error: errorStatus.AvailableDays,
      helperText: '*Required',
    },
    {
      label: 'Surfaces',
      name: 'AvailableSurfaceIDs',
      type: 'multiselect',
      menuItems: surfaces.map((surface) => surface.Name),
      error: errorStatus.AvailableSurfaceIDs,
      helperText: '*Required',
    },
    {
      label: 'Daily Start Time',
      name: 'DailyStartTime',
      type: 'datetime',
      error: errorStatus.DailyStartTime,
      helperText: '*Required',
    },
    {
      label: 'Daily End Time',
      name: 'DailyEndTime',
      type: 'datetime',
      error: errorStatus.DailyEndTime,
      helperText: '*Required',
    },
    {
      label: 'Estimated Match Length',
      name: 'EstMatchTime',
      type: 'text',
      error: errorStatus.EstMatchTime,
      helperText: '*Required',
    },
  ];

  const allFields = [
    seriesScheduleFields,
    // if you need more fields put them here, or if you make a "second page"
  ].flat();

  const currentInfo = useMemo(() => {
    return {
      SeriesID: seriesID,
      Sun: false,
      Mon: false,
      Tue: false,
      Wed: false,
      Thu: false,
      Fri: false,
      Sat: false,
      AvailableSurfaceIDs: [],
      DailyStartTime: '',
      DailyEndTime: '',
      EstMatchTime: '',
    };
  }, [seriesID]);

  const [newInfo, setNewInfo] = useState(currentInfo);
  const [openConfirmWindow, setOpenConfirmWindow] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [disableSubmitButton, setDisableSubmitButton] = useState(true);

  const handleSetError = (field, condition) => {
    const getCurrentErrorStatus = (currentValue) => {
      return {
        ...currentValue,
        [field]: condition,
      };
    };
    setErrorStatus(getCurrentErrorStatus);
  };

  const isNumeric = (value) => {
    return /^-?\d+$/.test(value) || value.length === 0;
  };
  // Field Validation
  useEffect(() => {
    let hasError = false;
    let hasChanges = false;
    for (const field in currentInfo) {
      if (currentInfo[field] !== newInfo[field]) {
        hasChanges = true;
      }
      //switch case used here TEMPORARILY as a template for other forms
      switch (field) {
        case 'EstMatchTime':
          handleSetError(field, !isNumeric(newInfo[field]));
          hasError = !isNumeric(newInfo[field]) || hasError;
          break;
        default:
          handleSetError(field, newInfo[field] === '');
          hasError = newInfo[field] === '' || hasError;
          break;
      }
    }
    setDisableSubmitButton(hasError || !hasChanges);
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
    return updatedFields;
  }

  const handleConfirm = () => {
    setSaving(true);

    let dayOfTheWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    let seriesRequest = { ...currentInfo, ...newInfo };
    seriesRequest.AvailableDays = {};

    // To get days of the week into array form for pass to API
    dayOfTheWeek.forEach((day) => {
      seriesRequest.AvailableDays[day] = seriesRequest[day];
      delete seriesRequest[day];
    });

    seriesRequest.AvailableSurfaceIDs = seriesRequest.AvailableSurfaceIDs.map(
      (surfaceDescription) => {
        return surfaces.find((surface) => surfaceDescription === surface.Name).ID;
      },
    );

    putSeriesSchedule(seriesRequest).then(() => {
      setSaving(false);
      closeWithSnackbar({
        type: 'success',
        message: `The series schedule has been edited`,
      });
      handleWindowClose();
    });
  };

  const handleWindowClose = () => {
    setOpenConfirmWindow(false);
    setNewInfo(currentInfo);
  };

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
        sm={6}
        md={4}
        lg={3}
      />
    ));
  };

  let content;
  if (loading) {
    content = <GordonLoader />;
  } else {
    content = (
      <>
        <ContentCard title="Series Information">
          {mapFieldsToInputs(seriesScheduleFields)}
        </ContentCard>

        <GordonDialogBox
          open={openConfirmWindow}
          title="Confirm Your Activity"
          buttonClicked={!isSaving && handleConfirm}
          buttonName="Confirm"
          // in case you want to authenticate something change isButtonDisabled
          isButtonDisabled={false}
          cancelButtonClicked={!isSaving && handleWindowClose}
          cancelButtonName="Cancel"
        >
          <ConfirmationWindowHeader />
          <Grid container>
            {getNewFields(currentInfo, newInfo).map((field) => (
              <ConfirmationRow key={field} field={field} />
            ))}
          </Grid>
          {isSaving && <GordonLoader size={32} />}
        </GordonDialogBox>
      </>
    );
  }
  return (
    <GordonDialogBox
      open={openSeriesScheduleForm}
      title={'Edit Series Schedule'}
      fullWidth
      maxWidth="lg"
      buttonClicked={() => setOpenConfirmWindow(true)}
      isButtonDisabled={disableSubmitButton}
      buttonName="Submit"
      cancelButtonClicked={() => {
        setNewInfo(currentInfo);
        setOpenSeriesScheduleForm(false);
      }}
      cancelButtonName="cancel"
    >
      {content}
    </GordonDialogBox>
  );
};

export default SeriesScheduleForm;