import { Grid, Typography } from '@mui/material';
import { useState, useEffect, useMemo } from 'react';
import GordonLoader from 'components/Loader';
import GordonDialogBox from 'components/GordonDialogBox';
import { ConfirmationRow } from '../components/ConfirmationRow';
import { ConfirmationWindowHeader } from '../components/ConfirmationHeader';
import { ContentCard } from '../components/ContentCard';
import { InformationField } from '../components/InformationField';
import {
  createSeries,
  editSeries,
  getSeriesStatusTypes,
  getSeriesTypes,
} from 'services/recim/series';

const SeriesForm = ({
  closeWithSnackbar,
  openSeriesForm,
  setOpenSeriesForm,
  activityID,
  existingActivitySeries,
  scheduleID,
  series, // If series passed, allows edit
}) => {
  const [errorStatus, setErrorStatus] = useState({
    name: false,
    startDate: false,
    endDate: false,
    typeID: false,
    numberOfTeamsAdmitted: false,
    statusID: false,
  });

  // Fetch data required for form creation
  const [loading, setLoading] = useState(true);
  const [seriesType, setSeriesType] = useState([]);
  const [statuses, setStatuses] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      // Get all active activities where registration has not closed
      setSeriesType(await getSeriesTypes());
      setStatuses(await getSeriesStatusTypes());
      setLoading(false);
    };
    loadData();
  }, []);

  const createSeriesFields = [
    {
      label: 'Name',
      name: 'name',
      type: 'text',
      error: errorStatus.name,
      helperText: '*Required',
    },
    {
      label: 'Series Start Date',
      name: 'startDate',
      type: 'datetime',
      error: errorStatus.startDate,
      helperText: '*Required',
    },
    {
      label: 'Series End Date',
      name: 'endDate',
      type: 'datetime',
      error: errorStatus.endDate,
      helperText: '*Required',
    },
  ];

  if (series) {
    createSeriesFields.push({
      label: 'Series Status',
      name: 'statusID',
      type: 'select',
      menuItems: statuses.map((status) => {
        return status.Description;
      }),
      error: errorStatus.statusID,
      helperText: '*Required',
    });
  } else {
    createSeriesFields.push(
      {
        label: 'Series Type',
        name: 'typeID',
        type: 'select',
        menuItems: seriesType.map((seriesType) => {
          return seriesType.Description;
        }),
        error: errorStatus.type,
        helperText: '*Required',
      },
      {
        label: 'Reference Series',
        name: 'referenceSeriesID',
        type: 'select',
        menuItems: existingActivitySeries.map((series) => {
          return series.Name;
        }),
        helperText: '*Optional',
      },
      {
        label: 'Number of Teams',
        name: 'numberOfTeamsAdmitted',
        type: 'text',
        error: errorStatus.numberOfTeamsAdmitted,
        helperText: '*Invalid Number',
      },
    );
  }

  const allFields = [
    createSeriesFields,
    // if you need more fields put them here, or if you make a "second page"
  ].flat();

  const currentInfo = useMemo(() => {
    if (series) {
      return {
        name: series.Name,
        startDate: series.StartDate,
        endDate: series.EndDate,
        statusID: series.Status,
        scheduleID: scheduleID,
      };
    } else {
      return {
        name: '',
        startDate: '',
        endDate: '',
        typeID: '',
        activityID: activityID,
        numberOfTeamsAdmitted: '',
        referenceSeriesID: '',
        scheduleID: scheduleID, //nullable, if scheduleID is passed, it will be assigned to the series
      };
    }
  }, [activityID, scheduleID, series]);

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
        case 'numberOfTeamsAdmitted':
          handleSetError(field, !isNumeric(newInfo[field]));
          hasError = !isNumeric(newInfo[field]) || hasError;
          break;
        case 'referenceSeriesID':
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

    let seriesRequest = { ...currentInfo, ...newInfo };

    if (series) {
      seriesRequest.statusID = statuses.find(
        (status) => status.Description === seriesRequest.statusID,
      ).ID;
      editSeries(series.ID, seriesRequest).then(() => {
        setSaving(false);
        closeWithSnackbar({
          type: 'success',
          message: `Series ${series.Name}, has been successfully edited`,
        });
        handleWindowClose();
      });
    } else {
      seriesRequest.typeID = seriesType.filter(
        (type) => type.Description === seriesRequest.typeID,
      )[0].ID;

      let referenceSeriesID =
        seriesRequest.referenceSeriesID === currentInfo.referenceSeriesID
          ? null
          : existingActivitySeries.filter((ref) => ref.Name === seriesRequest.referenceSeriesID)[0]
              .ID;
      createSeries(referenceSeriesID, seriesRequest).then(() => {
        setSaving(false);
        closeWithSnackbar({
          type: 'success',
          message: 'Your new series has been created or whatever message you want here',
        });
        handleWindowClose();
      });
    }
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
          {mapFieldsToInputs(createSeriesFields)}
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
      open={openSeriesForm}
      title={series ? 'Edit Series' : 'Create Series'}
      fullWidth
      maxWidth="lg"
      buttonClicked={() => setOpenConfirmWindow(true)}
      isButtonDisabled={disableSubmitButton}
      buttonName="Submit"
      cancelButtonClicked={() => {
        setNewInfo(currentInfo);
        setOpenSeriesForm(false);
      }}
      cancelButtonName="cancel"
    >
      {content}
      {!series && (
        <Typography>
          *Reference Series is used for selecting teams from an existing series
        </Typography>
      )}
    </GordonDialogBox>
  );
};

export default SeriesForm;