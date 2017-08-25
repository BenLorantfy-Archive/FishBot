import { takeLatest, call, put } from 'redux-saga/effects';
import * as constants from './constants';
import * as actions from './actions';
import * as api from './api';

// Individual exports for testing
function* feedFish() {
  try {
    yield call(api.feedFish);
  } catch (e) {

  }
}

function* loadFeeds() {
  try {
    const feeds = yield call(api.loadFeeds);
    yield put(actions.loadFeedsSucceeded(feeds));
  } catch (e) {
    yield put(actions.loadFeedsFailed(e));
  }
}

function* listener() {
  yield takeLatest(constants.FEED_FISH_REQUESTED, feedFish);
  yield takeLatest(constants.LOAD_FEEDS, loadFeeds);
}

// All sagas to be loaded
export default [
  listener,
];
