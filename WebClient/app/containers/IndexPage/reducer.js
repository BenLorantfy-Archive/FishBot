/*
 *
 * BlogSection reducer
 *
 */

import { fromJS } from 'immutable';
import * as constants from './constants';

const initialState = fromJS({
  loading: false,

  // Timestamp indicating when the last update was recieved
  lastUpdate: null,

  // Last fed time
  lastFed: null,

  // Next time when fish is hungry
  hungryTime: null,

  // All the feeds
  feeds: {
    data: [],
    error: null,
    loading: false,
  }
});

function reducer(state = initialState, action) {
  switch (action.type) {
    case constants.RECIEVED_UPDATE:
      if (!state.lastUpdate || state.lastUpdate < action.data.timeSent) {
        if (action.event === 'updated-last-fed') {
          return state
            .set('lastUpdate', action.data.timeSent)
            .set('lastFed', action.data.lastFed)
            .set('hungryTime', action.data.hungryTime);
        }
      }
      return state;
    case constants.LOAD_FEEDS:
      return state
        .setIn(['feeds', 'loading'], true)
        .setIn(['feeds', 'error'], null)
        .setIn(['feeds', 'data'], []);
    case constants.LOAD_FEEDS_SUCCEEDED:
      return state
        .setIn(['feeds', 'loading'], false)
        .setIn(['feeds', 'error'], null)
        .setIn(['feeds', 'data'], action.data);
    case constants.LOAD_FEEDS_FAILED:
      return state
        .setIn(['feeds', 'loading'], false)
        .setIn(['feeds', 'error'], action.error)
        .setIn(['feeds', 'data'], []);
    default:
      return state;
  }
}

export default reducer;
