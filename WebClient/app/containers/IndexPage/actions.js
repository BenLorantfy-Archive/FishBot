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

/** load feeds **/
export function loadFeeds() {
  return { type: constants.LOAD_FEEDS };
}

export function loadFeedsSucceeded(data) {
  return { type: constants.LOAD_FEEDS_SUCCEEDED, data };
}

export function loadFeedsFailed(error) {
  return { type: constants.LOAD_FEEDS_FAILED, error };
}