import { fromJS } from 'immutable';

const INITIAL_STATE = fromJS({

});

function appReducer(state = INITIAL_STATE, action) {
  switch (action.type) {


    default:
      return state;
  }
}

export default appReducer;
