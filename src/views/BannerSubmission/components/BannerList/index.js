import { Card, Grid, List, Typography } from '@material-ui/core';
import { useWindowSize } from 'hooks';
import { gordonColors } from 'theme';
import Banner from '../Banner';
//import styles from './NewsList.module.css';

const BREAKPOINT_WIDTH = 540;

const headerStyle = {
  backgroundColor: gordonColors.primary.blue,
  color: '#FFF',
  padding: '10px',
};

const singleHeader = (
  <div style={headerStyle}>
    <Grid container direction="row">
      <Grid item xs={12}>
        <Typography variant="body2" style={headerStyle}>
          BANNERS
        </Typography>
      </Grid>
    </Grid>
  </div>
);

const fullHeader = (
  <Grid container direction="row" style={headerStyle}>
    <Grid item xs={1}>
      <Typography style={headerStyle}>ID</Typography>
    </Grid>
    <Grid item xs={3}>
      <Typography variant="body2" style={headerStyle}>
        Title
      </Typography>
    </Grid>
    <Grid item xs={7}>
      <Typography variant="body2" style={headerStyle}>
        Link URL
      </Typography>
    </Grid>
    <Grid item xs={1}>
      <Typography variant="body2" style={headerStyle}>
        Sort Order
      </Typography>
    </Grid>
  </Grid>
);

const BannerList = ({ banners, handleBannerDelete }) => {
  const [width] = useWindowSize();

  return (
    <Card>
      {width < BREAKPOINT_WIDTH ? singleHeader : fullHeader}
      <List disablePadding>
        {banners.length > 0 ? (
          banners.map((banner) => (
            <Banner
              banner={banner}
              size={width < BREAKPOINT_WIDTH ? 'single' : 'full'}
              handleNewsItemDelete={handleBannerDelete}
              key={banner.ID}
            />
          ))
        ) : (
          <Typography variant="h6" align="center">
            No Banners
          </Typography>
        )}
      </List>
    </Card>
  );
};

export default BannerList;
