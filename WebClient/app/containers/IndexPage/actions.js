/*
 *
 * BlogSection actions
 *
 */

import * as constants from './constants';

export function feedFish() {
  return { type: constants.FEED_FISH_REQUESTED };
}