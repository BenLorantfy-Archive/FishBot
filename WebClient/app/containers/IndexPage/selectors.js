import { createSelector } from 'reselect';


const selectState = () => (state) => state.get('index').toJS();

export const selectLastFed = () => createSelector(
    selectState(),
    (state) => state.lastFed
);

export const selectHungryTime = () => createSelector(
    selectState(),
    (state) => state.hungryTime
);

export const selectLastUpdate = () => createSelector(
    selectState(),
    (state) => state.lastUpdate
);

export const selectFeeds = () => createSelector(
    selectState(),
    (state) => state.feeds.data
);