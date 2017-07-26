import { takeLatest, call } from 'redux-saga/effects';
import * as constants from './constants';
// import * as actions from './actions';
import * as api from './api';

// Individual exports for testing
function* feedFish() {
  try {
    yield call(api.feedFish);
    // yield put(actions.loadProjectsSucceeded(projects.items));
  } catch (e) {
    // yield put(actions.loadProjectsFailed());
  }
}

function* listener() {
  yield takeLatest(constants.FEED_FISH_REQUESTED, feedFish);
}

// All sagas to be loaded
export default [
  listener,
];
