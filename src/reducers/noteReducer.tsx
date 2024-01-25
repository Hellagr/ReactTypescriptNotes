import { store } from '../store/store';

const INITIAL_DATABASE_NOTE = "INITIAL_DATABASE_NOTE";
const INITIAL_DELETED_NOTES = "INITIAL_DELETED_NOTES";


if (!('indexedDB' in window)) {
    alert("This browser doesn't support IndexedDB");
}
const request = window.indexedDB.open("Database", 2);
request.onerror = (event) => {
    console.error(`Error: ${event}`);
};
request.onupgradeneeded = (event) => {
    const db = (event.target as IDBOpenDBRequest).result;
    if (!db.objectStoreNames.contains("notes")) {
        db.createObjectStore("notes");
    }
    if (!db.objectStoreNames.contains("deletedNotes")) {
        db.createObjectStore("deletedNotes");
    }
}

request.onsuccess = (event) => {
    const db = (event.target as IDBOpenDBRequest).result as IDBDatabase;
    const transactionNotes = db.transaction('notes', 'readonly');
    const objectStoreNotes = transactionNotes.objectStore('notes');
    const getRequest = objectStoreNotes.getAll();
    getRequest.onsuccess = function (event) {
        const dataNotes = (event.target as IDBRequest).result;
        function addDatabaseNote() {
            return {
                type: INITIAL_DATABASE_NOTE,
                payload:
                    [
                        ...dataNotes
                    ]
            };
        };
        store.dispatch(addDatabaseNote());
    };
    const transactionDeletedNotes = db.transaction('deletedNotes', 'readonly');
    const objectStoreDeletedNotes = transactionDeletedNotes.objectStore('deletedNotes');
    const getRequestDeletedNotes = objectStoreDeletedNotes.getAll();
    getRequestDeletedNotes.onsuccess = function (event) {
        const dataNotes = (event.target as IDBRequest).result;
        function addDatabaseDeletedNote() {
            return {
                type: INITIAL_DELETED_NOTES,
                payload:
                    [
                        ...dataNotes
                    ]
            };
        };
        store.dispatch(addDatabaseDeletedNote());
    };
};

let initialState: Array<object> = [];

export const noteReducer = (state: any = initialState, action: any) => {
    switch (action.type) {
        case "INITIAL_DATABASE_NOTE":
            return ([...state, action.payload]);
        case "ADD_NOTE":
            const updatedState = [...state];
            updatedState[0] = [...updatedState[0], action.payload];
            return updatedState;
        case "UPDATE_NOTE":
            return ([...state, state[0].map((e: any) => {
                if (e.id === +action.payload.id) {
                    e.title = action.payload.title ? action.payload.title : e.title;
                    e.text = action.payload.text ? action.payload.text : e.text;
                    e.hashTag = action.payload.hashTag ? action.payload.hashTag : e.hashTag;
                }
            })]);
        case "DELETE_NOTE":
            return [state[0].filter((e: any) => e.id !== +action.payload)];
        default:
            return state;
    }
}

export const noteDeleteNoteReducer = (state: any = initialState, action: any) => {
    switch (action.type) {
        case "INITIAL_DELETED_NOTES":
            return ([...state, action.payload]);
        case "ADD_DELETED_NOTE":
            const updatedState = [...state];
            updatedState[0] = [...updatedState[0], action.payload];
            return updatedState;
        case "DELETE_NOTE_PERMANENTLY":
            return [state[0].filter((e: any) => e.id !== +action.payload)];
        default:
            return state;
    }
}