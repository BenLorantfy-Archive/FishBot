/*
 *
 * BlogSection actions
 *
 */

import * as constants from './constants';

export function feedFish() {
  return { type: constants.FEED_FISH_REQUESTED };
}

export function recievedUpdate(event, data) {
  return { type: constants.RECIEVED_UPDATE, event, data };
}