import { legacy_createStore, combineReducers } from 'redux';
import { noteReducer } from '../reducers/noteReducer';

export const rootReducer = combineReducers({
    note: noteReducer,
})

export const store = legacy_createStore(rootReducer);






