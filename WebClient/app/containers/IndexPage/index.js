/*
 *
 * BlogSection
 *
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
// import Spinner from 'react-spinkit';
import { createStructuredSelector } from 'reselect';
import moment from 'moment';
import io from 'socket.io-client';

/** material ui **/
import RaisedButton from 'material-ui/RaisedButton';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';

import * as selectors from './selectors';
import * as actions from './actions';
import * as styles from './styles';
import StreamFeed from '../../components/StreamFeed';


// @import "~slick-carousel/slick/slick.css";
// @import "~slick-carousel/slick/slick-theme.css";

export class IndexPage extends React.Component { // eslint-disable-line react/prefer-stateless-function
  constructor(props) {
    super(props);
    this.state = {
      timer: '',
    };
  }

  componentWillMount() {
    setInterval(() => {
      this.updateTimes();
    }, 1000);
    this.updateTimes();

    const socket = io('https://benlorantfy.com/', { transports: ['websocket'], upgrade: false, path: '/fishbot/updates' });
    socket.on('connect', () => {
      // console.log('Connected to server');
    });

    socket.on('message', (event, data) => {
      this.props.recievedUpdate(event, data);
    });

    // Fetch feeds
    this.props.loadFeeds();
  }

  updateTimes() {
    this.setState((prevState, props) => {
      if (props.hungryTime == null) {
        return Object.assign({}, prevState, { time: 'in ...' });
      }
      if (props.hungryTime < moment().toISOString()) {
        return Object.assign({}, prevState, { time: 'now' });
      }

      const timeWhenHungryAgain = props.hungryTime;
      const now = moment();
      let time = now.to(timeWhenHungryAgain);
      if (time === 'in a day') {
        time = `in ${moment(timeWhenHungryAgain).diff(now, 'hours')} hours`;
      }
      if (time === 'in a few seconds') {
        time = `in ${moment(timeWhenHungryAgain).diff(now, 'seconds')} seconds`;
      }
      return Object.assign({}, prevState, { time });
    });

    this.setState((prevState, props) => {
      return Object.assign({}, prevState, { now: moment().toISOString() });
    });
  }

  render() {
    const isDisabled = this.props.lastUpdate === null || this.props.hungryTime > moment().toISOString();
    return (
      <div>
        <Helmet>
          <title>FishBot</title>
        </Helmet>
        <div style={styles.container}>
          <h1 style={styles.header}>FishBot</h1>
          <h2 style={styles.subHeader}>An automatic fish feeder</h2>
          <StreamFeed style={{ marginBottom: '20px' }} />
          <RaisedButton
            onTouchTap={this.props.feedFish}
            label="Feed Leroy"
            style={{ marginRight: '15px' }}
            disabled={isDisabled}
          />

          {isDisabled && <span>{`Leroy isn't hungry right now. He'll be hungry ${this.state.time}`}</span>}


        </div>
        <div style={styles.container}>
          <h1 style={styles.header3}>Recent Feedings</h1>
          
          <Table>
            <TableHeader
              displaySelectAll={false}
              adjustForCheckbox={false}
            >
              <TableRow>
                <TableHeaderColumn>ID</TableHeaderColumn>
                <TableHeaderColumn>Relative Time</TableHeaderColumn>
                <TableHeaderColumn>Absolute Time</TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody
              displayRowCheckbox={false}
            >
              {this.props.feeds.map((feed, i) => {
                return <TableRow key={i}>
                  <TableRowColumn>{i}</TableRowColumn>
                  <TableRowColumn>{moment(feed.time).from(this.state.now)}</TableRowColumn>
                  <TableRowColumn>{moment(feed.time).format('MMMM Do YYYY, h:mm:ss a')}</TableRowColumn>
                </TableRow>
              })}
            </TableBody>
          </Table>


        </div>
      </div>
    );
  }
}

IndexPage.propTypes = {
  recievedUpdate: PropTypes.func.isRequired,
  feedFish: PropTypes.func.isRequired,
  lastUpdate: PropTypes.string,
  hungryTime: PropTypes.string,
};

const mapStateToProps = createStructuredSelector({
  lastUpdate: selectors.selectLastUpdate(),
  lastFed: selectors.selectLastFed(),
  hungryTime: selectors.selectHungryTime(),
  feeds: selectors.selectFeeds(),
});

function mapDispatchToProps(dispatch) {
  return {
    recievedUpdate: (event, data) => dispatch(actions.recievedUpdate(event, data)),
    feedFish: () => dispatch(actions.feedFish()),
    loadFeeds: () => dispatch(actions.loadFeeds()),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(IndexPage);
