import { Grid } from '@mui/material';
import { useState, useEffect } from 'react';
import { HallSearchField } from 'views/PeopleSearch/components/SearchFieldList/components/SearchField';
import GordonSnackbar from 'components/Snackbar';

const HallSlot = ({ rank, hallList, preferredHallList, updatePreferredHallList }) => {
  const [hall, setHall] = useState('');
  const [snackbar, setSnackbar] = useState({ message: '', severity: null, open: false });
  const [filteredHallList, setFilteredHallList] = useState(hallList);

  useEffect(() => {
    const updatedHallList = hallList.filter((h) => !preferredHallList.includes(h) || h === hall);
    setFilteredHallList(updatedHallList);
  }, [preferredHallList, hallList, hall]);

  const selectPreferredHall = (event) => {
    const newHall = event.target.value;
    if (newHall !== '' && preferredHallList.includes(newHall)) {
      setSnackbar({
        message: 'You have already selected this hall.',
        severity: 'error',
        open: true,
      });
      return;
    }
    setHall(newHall);
    updatePreferredHallList(rank, newHall);
  };

  return (
    <Grid container spacing={5}>
      <HallSearchField
        name="building"
        value={hall}
        updateValue={(event) => selectPreferredHall(event)}
        options={filteredHallList}
        select
        size={200}
      />
      <GordonSnackbar
        open={snackbar.open}
        severity={snackbar.severity}
        text={snackbar.message}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      />
    </Grid>
  );
};

export default HallSlot;
