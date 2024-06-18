import { Typography, Grid, Button, TextField, Box, SelectChangeEvent } from '@mui/material/';
import React, { ChangeEvent, useState, useMemo, useEffect } from 'react';
import styles from './AlumniUpdateForm.module.css';
import { Profile as profileType } from 'services/user';
import GordonLoader from 'components/Loader';
import GordonDialogBox from 'components/GordonDialogBox';
import { severityType } from 'components/Snackbar';
import { ConfirmationRow } from './components/ConfirmationRow';
import { ConfirmationWindowHeader } from './components/ConfirmationHeader';
import { ContentCard } from './components/ContentCard';
import { ProfileUpdateField } from './components/ProfileUpdateField';
import addressService from 'services/address';
import { map } from 'services/utils';
import userService from 'services/user';

type inputType = 'text' & 'checkbox' & 'select';

const shouldContactFields = [
  { label: 'Do Not Contact', name: 'doNotContact', type: 'checkbox' as inputType },
  { label: 'Do Not Mail', name: 'doNotMail', type: 'checkbox' as inputType },
];

const UPDATE_STEP = 'update';
const CONFIRM_STEP = 'confirm';

type Props = {
  profile: profileType;
  closeWithSnackbar: (status: { type: severityType; message: string }) => void;
  openAlumniUpdateForm: boolean;
  setOpenAlumniUpdateForm: (bool: boolean) => void;
};

/**
 * A form for alumni to request an update to their profile information.
 */

const AlumniUpdateForm = ({
  profile,
  closeWithSnackbar,
  openAlumniUpdateForm,
  setOpenAlumniUpdateForm,
}: Props) => {
  const [statesAndProv, setStatesAndProv] = useState(['Not Applicable']);
  const [countries, setCountries] = useState(['Prefer Not to Say']);
  const [errorStatus, setErrorStatus] = useState({
    firstName: false,
    lastName: false,

    homePhone: false,
    workPhone: false,
    mobilePhone: false,

    personalEmail: false,
    workEmail: false,
    aEmail: false,
  });

  const personalInfoFields = [
    {
      label: 'Salutation',
      name: 'salutation',
      type: 'select' as inputType,
      menuItems: ['Prefer Not to Answer', 'Mr.', 'Ms.', 'Mrs.', 'Miss', 'Dr.', 'Rev.'],
    },
    {
      label: 'First Name',
      name: 'firstName',
      type: 'text' as inputType,
      error: errorStatus.firstName,
      helperText: '*Required',
    },
    {
      label: 'Last Name',
      name: 'lastName',
      type: 'text' as inputType,
      error: errorStatus.lastName,
      helperText: '*Required',
    },
    { label: 'Middle Name', name: 'middleName', type: 'text' as inputType },
    { label: 'Preferred Name', name: 'nickName', type: 'text' as inputType },
    { label: 'Suffix', name: 'suffix', type: 'text' as inputType },
    { label: 'Married', name: 'married', type: 'checkbox' as inputType },
  ];
  const emailInfoFields = [
    {
      label: 'Personal Email',
      name: 'personalEmail',
      type: 'text' as inputType,
      error: errorStatus.personalEmail,
      helperText: '*Invalid Email',
    },
    {
      label: 'Work Email',
      name: 'workEmail',
      type: 'text' as inputType,
      error: errorStatus.workEmail,
      helperText: '*Invalid Email',
    },
    {
      label: 'Alternate Email',
      name: 'aEmail',
      type: 'text' as inputType,
      error: errorStatus.aEmail,
      helperText: '*Invalid Email',
    },
    {
      label: 'Preferred Email',
      name: 'preferredEmail',
      type: 'select' as inputType,
      menuItems: ['No Preference', 'Personal Email', 'Work Email', 'Alternate Email'],
    },
  ];
  const phoneInfoFields = [
    {
      label: 'Home Phone',
      name: 'homePhone',
      type: 'text' as inputType,
      error: errorStatus.homePhone,
      helperText: '*Invalid Number',
    },
    {
      label: 'Work Phone',
      name: 'workPhone',
      type: 'text' as inputType,
      error: errorStatus.workPhone,
      helperText: '*Invalid Number',
    },
    {
      label: 'Mobile Phone',
      name: 'mobilePhone',
      type: 'text' as inputType,
      error: errorStatus.mobilePhone,
      helperText: '*Invalid Number',
    },
    {
      label: 'Preferred Phone',
      name: 'preferredPhone',
      type: 'select' as inputType,
      menuItems: ['No Preference', 'Home Phone', 'Work Phone', 'Mobile Phone'],
    },
  ];
  const mailingInfoFields = [
    { label: 'Address', name: 'address1', type: 'text' as inputType },
    { label: 'Address Line 2 (optional)', name: 'address2', type: 'text' as inputType },
    { label: 'City', name: 'city', type: 'text' as inputType },
    { label: 'State', name: 'state', type: 'select' as inputType, menuItems: statesAndProv },
    { label: 'Zip Code', name: 'zip', type: 'text' as inputType },
    { label: 'Country', name: 'country', type: 'select' as inputType, menuItems: countries },
  ];

  const allFields = [
    personalInfoFields,
    emailInfoFields,
    phoneInfoFields,
    mailingInfoFields,
    shouldContactFields,
  ].flat();

  useEffect(() => {
    addressService
      .getStates()
      .then(map((state) => state.Name))
      .then((states) => ['Not Applicable', ...states])
      .then(setStatesAndProv);
    addressService
      .getCountries()
      .then(map((country) => country.Name))
      .then(setCountries);
  }, []);

  type Info = {
    salutation?: string;
    firstName?: string;
    lastName?: string;
    middleName?: string;
    nickName?: string;
    suffix?: string;
    personalEmail?: string;
    workEmail?: string;
    aEmail?: string;
    preferredEmail?: string;
    doNotContact?: boolean;
    doNotMail?: boolean;
    homePhone?: string;
    workPhone?: string;
    mobilePhone?: string;
    preferredPhone?: string;
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    married?: boolean;
  };

  const currentInfo = useMemo<Info>(() => {
    return {
      salutation: profile.Title
        ? profile.Title.charAt(0).toUpperCase() + profile.Title.slice(1).toLowerCase()
        : '',
      firstName: profile.FirstName ?? '',
      lastName: profile.LastName ?? '',
      middleName: profile.MiddleName ?? '',
      nickName: profile.NickName ?? '',
      suffix: profile.Suffix ?? '',
      personalEmail: profile.PersonalEmail ?? '',
      workEmail: profile.WorkEmail ?? '',
      aEmail: profile.aEmail ?? '',
      preferredEmail: profile.PreferredEmail ?? '',
      doNotContact: profile.doNotContact ?? false,
      doNotMail: profile.doNotMail ?? false,
      homePhone: profile.HomePhone ?? '',
      workPhone: profile.WorkPhone ?? '',
      mobilePhone: profile.MobilePhone ?? '',
      preferredPhone: profile.PreferredPhone ?? '',
      //Homestreet lines are inverted in alumni SQL
      address1: profile.HomeStreet2 ?? profile.HomeStreet1 ?? '',
      address2: profile.HomeStreet2 && profile.HomeStreet1 ? profile.HomeStreet2 : '',
      city: profile.HomeCity ?? '',
      state: profile.HomeState ?? '',
      zip: profile.HomePostalCode ?? '',
      country: profile.HomeCountry ?? '',
      married: profile.Married === 'Y' ? true : false,
    };
  }, [profile]);
  const [updatedInfo, setUpdatedInfo] = useState(currentInfo);
  const [step, setStep] = useState(UPDATE_STEP);
  const [isSaving, setSaving] = useState(false);
  const [changeReason, setChangeReason] = useState('');
  const [disableUpdateButton, setDisableUpdateButton] = useState(true);

  const handleSetError = (field: string, condition: boolean) => {
    const getCurrentErrorStatus = (currentValue: any) => {
      return {
        ...currentValue,
        [field]: condition,
      };
    };
    setErrorStatus(getCurrentErrorStatus);
  };

  const isEmailValid = (email?: string) => {
    //email regex from: https://stackoverflow.com/a/72476905
    const regex = /[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,8}(.[a-z{2,8}])?/g;
    return !email || email === '' || regex.test(email);
  };

  const isPhoneValid = (phoneNum?: string) => {
    /**
     * 2 Regex's used here:
     * /[-()\s]/g => /g is a global search for all characters in the array symbols -,(,),(space)
     * /^[+]?\d{7,15}+$/ => regex match value of (begin char)(0 or 1 instance of '+')(7-15 digits)(end char)
     */
    let value = phoneNum!.replace(/[-()\s]/g, '');
    return /^[+]?\d{7,15}$/.test(value) || phoneNum!.length === 0;
  };

  // Field Validation
  useEffect(() => {
    let hasError = false;
    let hasChanges = false;
    for (const field in currentInfo) {
      if ((field as keyof typeof currentInfo) !== (field as keyof typeof updatedInfo)) {
        hasChanges = true;
      }
      switch (field) {
        case 'firstName':
        case 'lastName':
          handleSetError(field, updatedInfo[field] === '');
          hasError = updatedInfo[field] === '' || hasError;
          break;
        case 'homePhone':
        case 'workPhone':
        case 'mobilePhone':
          handleSetError(field, !isPhoneValid(updatedInfo[field]));
          hasError = !isPhoneValid(updatedInfo[field]) || hasError;
          break;
        case 'personalEmail':
        case 'workEmail':
        case 'aEmail':
          handleSetError(field, !isEmailValid(updatedInfo[field]));
          hasError = !isEmailValid(updatedInfo[field]) || hasError;
          break;
        default:
          break;
      }
    }
    setDisableUpdateButton(hasError || !hasChanges);
  }, [updatedInfo, currentInfo]);

  const handleChange = (event: SelectChangeEvent<string> & ChangeEvent<HTMLInputElement>) => {
    const getNewInfo = (currentValue: Info) => {
      return {
        ...currentValue,
        [event.target.name]:
          event.target.type === 'checkbox' ? event.target.checked : event.target.value,
      };
    };
    setUpdatedInfo(getNewInfo);
  };

  const getFieldLabel = (fieldName: string) => {
    const matchingField = allFields.find((field) => field.name === fieldName);
    return matchingField!.label;
  };

  function getUpdatedFields(updatedInfo: Info, currentInfo: Info) {
    const updatedFields: any[] = [];
    Object.entries(currentInfo).forEach(([field, value]) => {
      let updatedValue = value;
      if (field === 'homePhone' || field === 'workPhone' || field === 'mobilePhone') {
        if (typeof value === 'string') {
          updatedValue = value.replace(/[-()\s]/g, '');
        }
      }
      if ((field as keyof typeof updatedInfo) !== value)
        updatedFields.push({
          Field: field,
          Value: updatedValue,
          Label: getFieldLabel(field),
        });
    });
    return updatedFields;
  }

  const handleConfirm = () => {
    setSaving(true);
    let updateRequest = getUpdatedFields(currentInfo, updatedInfo);
    updateRequest.push({
      Field: 'changeReason',
      Value: changeReason,
      Label: 'Reason for change',
    });
    userService.requestInfoUpdate(updateRequest).then(() => {
      setSaving(false);
      closeWithSnackbar({
        type: 'success',
        message: 'Your update request has been sent. Please check back later.',
      });
      handleWindowClose();
    });
  };

  const handleWindowClose = () => {
    setStep(UPDATE_STEP);
    setChangeReason('');
  };

  /**
   * @param {Array<{name: string, label: string, type: string, menuItems: string[]}>} fields array of objects defining the properties of the input field
   * @returns JSX correct input for each field based on type
   */
  const mapFieldsToInputs = (
    fields: Array<{
      name: string;
      label: string;
      type: 'select' & 'text' & 'checkbox';
      menuItems?: string[];
      error?: boolean;
      helperText?: React.ReactNode;
    }>,
  ) => {
    return fields.map((field) => (
      <ProfileUpdateField
        error={field.error}
        label={field.label}
        name={field.name}
        helperText={field.helperText}
        value={field.name as keyof typeof updatedInfo}
        type={field.type}
        menuItems={field.menuItems}
        onChange={handleChange}
      />
    ));
  };

  const dialogProps =
    step === CONFIRM_STEP
      ? {
          title: 'Confirm Your Updates',
          buttonClicked: !isSaving ? handleConfirm : null,
          buttonName: 'Confirm',
          isButtonDisabled: changeReason === '',
          cancelButtonClicked: !isSaving ? handleWindowClose : null,
        }
      : {
          title: 'Update Information',
          buttonClicked: () => setStep(CONFIRM_STEP),
          isButtonDisabled: disableUpdateButton,
          buttonName: 'Update',
          cancelButtonClicked: () => {
            setUpdatedInfo(currentInfo);
            setOpenAlumniUpdateForm(false);
          },
        };

  return (
    <GordonDialogBox
      {...dialogProps}
      open={openAlumniUpdateForm}
      fullWidth
      maxWidth="lg"
      isButtonDisabled={disableUpdateButton}
      cancelButtonName="Cancel"
    >
      {step === UPDATE_STEP && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <ContentCard title="Personal Information">
            {mapFieldsToInputs(personalInfoFields)}
          </ContentCard>
          <ContentCard title="Email Addresses">{mapFieldsToInputs(emailInfoFields)}</ContentCard>
          <ContentCard title="Phone Numbers">{mapFieldsToInputs(phoneInfoFields)}</ContentCard>
          <ContentCard title="Mailing Address">{mapFieldsToInputs(mailingInfoFields)}</ContentCard>
          <ContentCard title="Contact Preferences">
            {mapFieldsToInputs(shouldContactFields)}
          </ContentCard>
          <Typography variant="subtitle1">
            Found a bug?
            <Button href="mailto:cts@gordon.edu?Subject=Gordon 360 Bug" color="primary">
              Report to CTS
            </Button>
          </Typography>
        </Box>
      )}
      {step === CONFIRM_STEP && (
        <>
          <ConfirmationWindowHeader />
          <Grid container>
            {getUpdatedFields(currentInfo, updatedInfo).map((field) => (
              <ConfirmationRow field={field} prevValue={field.Field as keyof typeof currentInfo} />
            ))}
          </Grid>
          <TextField
            required
            variant="filled"
            label="Please give a reason for the change..."
            multiline
            fullWidth
            minRows={4}
            name="changeReason"
            value={changeReason}
            onChange={(event) => {
              setChangeReason(event.target.value);
            }}
          />
          {isSaving && <GordonLoader size={32} />}
        </>
      )}
    </GordonDialogBox>
  );
};

export default AlumniUpdateForm;
