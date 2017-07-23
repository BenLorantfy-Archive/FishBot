import { createSelector } from 'reselect';


const selectState = () => (state) => state.get('index').toJS();

export const selectLastFed = () => createSelector(
    selectState(),
    (state) => {
        return state.lastFed;
    }
);

export const selectHungryTime = () => createSelector(
    selectState(),
    (state) => {
        return state.hungryTime;
    }
);

export const selectLastUpdate = () => createSelector(
    selectState(),
    (state) => {
        return state.lastUpdate;
    }
);