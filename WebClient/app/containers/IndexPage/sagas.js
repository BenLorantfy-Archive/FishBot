import { take, takeLatest, call, put, select } from 'redux-saga/effects';
import * as constants from './constants';
import * as actions from './actions';
import * as api from './api';

// Individual exports for testing
function* feedFish(action) {
  console.log("Feeding Fish");
  try{
    var response = yield call(api.feedFish);
    // yield put(actions.loadProjectsSucceeded(projects.items));
  }catch(e){
    // yield put(actions.loadProjectsFailed());
  }
}

function* listener(){
  console.log("YOOO");
  yield takeLatest(constants.FEED_FISH_REQUESTED, feedFish);
}

// All sagas to be loaded
export default [
  listener,
];
