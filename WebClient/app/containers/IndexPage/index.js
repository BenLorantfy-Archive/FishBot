/*
 *
 * BlogSection
 *
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import Spinner from 'react-spinkit';
import { createStructuredSelector } from 'reselect';
import * as selectors from './selectors';
import * as actions from './actions';
import * as styles from './styles';
import moment from 'moment';
import RaisedButton from 'material-ui/RaisedButton';
import StreamFeed from '../../components/StreamFeed';

// @import "~slick-carousel/slick/slick.css";
// @import "~slick-carousel/slick/slick-theme.css";

export class IndexPage extends React.Component { // eslint-disable-line react/prefer-stateless-function
  constructor(props) {
    super(props);
    this.state = {
      timer: "",
    };
  }

  componentWillMount(){
    setInterval(() => {
      this.updateTimeUntilHungry();
    },1000);
    this.updateTimeUntilHungry();
  }

  updateTimeUntilHungry(){
    this.setState((prevState, props) => {
      const timeWhenHungryAgain = "2017-07-06T00:40:17.119Z";
      const now = moment();
      let time = now.to(timeWhenHungryAgain);
      if(time === "in a few seconds"){
        time = "in " + moment(timeWhenHungryAgain).diff(now, "seconds") + " seconds";
      }
      return { time };
    });
  }

  render() {
    const isDisabled = false;
    return (
      <div>
        <div style={styles.container}>
          <h1 style={styles.header}>FishBot</h1>
          <h2 style={styles.subHeader}>An automatic fish feeder</h2>
          <StreamFeed style={{ marginBottom: "20px" }} />
          <RaisedButton 
            onTouchTap={this.props.feedFish} 
            label="Feed Leroy" 
            style={{ marginRight: "15px" }} 
            disabled={isDisabled} /> 
          Leroy isn't hungry right now. He'll be hungry {this.state.time}

        </div>
      </div>
    );
  }
}

IndexPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  // projects: selectors.selectProjects(),
  // loading: selectors.selectLoading(),
});

function mapDispatchToProps(dispatch) {
  return {
    feedFish: () => dispatch(actions.feedFish()),
    dispatch,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(IndexPage);
