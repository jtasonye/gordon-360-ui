import Grid from '@material-ui/core/Grid';
import React, { Component } from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import GordonLoader from '../../../../components/Loader';

import ClearIcon from '@material-ui/icons/Clear';
import './Denied.css';

export default class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      network: 'online',
      time: new Date().toLocaleString([], { hour: '2-digit', minute: '2-digit' }),
      width: 0,
    };
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
    this.resizeIcon = this.resizeIcon.bind(this);
  }

  componentDidMount() {
    this.intervalID = setInterval(() => this.tick(), 1000);
    this.updateWindowDimensions();
    window.addEventListener('resize', this.updateWindowDimensions);
    this.loadQuestion();
  }

  componentWillMount() {
    clearInterval(this.intervalID);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
  }

  updateWindowDimensions() {
    this.setState({ width: window.innerWidth });
  }

  tick() {
    this.setState({
      time: new Date().toLocaleString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    });
  }

  logIn() {
    try {
      this.props.onLogIn();
    } catch (error) {
      console.log('Login failed with error: ' + error);
    }
  }

  resizeIcon() {
    return this.state.width * 0.03 + 50;
  }
  async loadQuestion() {
    this.setState({ loading: true });
    try {
      this.tick();
      this.setState({ loading: false });
    } catch (error) {
      this.setState({ error });
    }
  }
  render() {
    /* Used to re-render the page when the network connection changes.
     *  this.state.network is compared to the message received to prevent
     *  multiple re-renders that creates extreme performance lost.
     *  The origin of the message is checked to prevent cross-site scripting attacks
     */

    window.addEventListener('message', event => {
      if (
        event.data === 'online' &&
        this.state.network === 'offline' &&
        event.origin === window.location.origin
      ) {
        this.setState({ network: 'online' });
      } else if (
        event.data === 'offline' &&
        this.state.network === 'online' &&
        event.origin === window.location.origin
      ) {
        this.setState({ network: 'offline' });
      }
    });

    let content;
    if (this.state.loading) {
      content = <GordonLoader />;
    } else {
      content = (
        <Grid spacing={2}>
          <Card>
            <CardHeader title="Denied" />
            <CardContent className="denied-box">
              <div className="denied-time">{this.state.time}</div>
              <div className="circle-cross">
                <ClearIcon style={{ fontSize: this.resizeIcon() }} />
              </div>
              <CardHeader
                className="denied-time"
                title="Please notify the health center: (978)867-4300"
              />
            </CardContent>
          </Card>
        </Grid>
      );
      return content;
    }
  }
}
