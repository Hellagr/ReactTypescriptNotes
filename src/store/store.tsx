import { legacy_createStore, combineReducers } from 'redux';
import { noteReducer, noteDeleteNoteReducer } from '../reducers/noteReducer';

export const rootReducer = combineReducers({
    note: noteReducer,
    deletedNote: noteDeleteNoteReducer
})

export const store = legacy_createStore(rootReducer);





