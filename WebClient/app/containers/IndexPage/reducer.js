/*
 *
 * BlogSection reducer
 *
 */

import { fromJS } from 'immutable';
import * as constants from './constants';

const initialState = fromJS({
  //  projects: []
  loading: false,

  // Timestamp indicating when the last update was recieved
  lastUpdate: null,

  // Last fed time
  lastFed: null,

  // Next time when fish is hungry
  hungryTime: null,
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
    default:
      return state;
  }
}

export default reducer;
