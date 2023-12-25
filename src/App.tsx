import React, { useCallback, useState } from 'react';
import './App.css';
import { store } from './store/store';
import { addNoteAction } from './actions/action';
import { useDispatch, useSelector } from 'react-redux';

function App() {
  const dispatch = useDispatch();
  // const arrDatabaseObj = useSelector((state: any) => state.dataBase[0]);
  const arrNoteObj = useSelector((state: any) => state.note[0]);

  //For re-render component
  const [, updateState] = useState({});
  const forceUpdate = useCallback(() => {
    updateState({});
  }, []);

  //Check existence of database
  if (!('indexedDB' in window)) {
    alert("This browser doesn't support IndexedDB");
  }
  //Open database 
  const request = window.indexedDB.open("Database", 1);
  request.onerror = (event) => {
    console.error(`Error: ${event}`);
  };
  request.onupgradeneeded = (event) => {
    const db = (event.target as IDBOpenDBRequest).result;
    db.createObjectStore("notes");
  }

  //Add object to store
  function submitFunc(e: any) {
    e.preventDefault();
    const titleValue = e.target[0].value;
    const textValue = e.target[1].value;

    if (e.target[0].value !== '' && e.target[1].value !== '') {
      dispatch(addNoteAction(titleValue, textValue));

      const lastObjNumber = store.getState().note[0].length - 1;
      const lastObj = store.getState().note[0][lastObjNumber];

      //Add obj to a database
      const request = window.indexedDB.open("Database", 1);
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result as IDBDatabase;
        const transaction = db.transaction("notes", "readwrite");
        const objectStore = transaction.objectStore("notes");

        objectStore.add(lastObj, lastObj.id)
        request.onerror = (error) => {
          console.error(`Error: ${error}`);
        };
      }
      e.target.reset();
      forceUpdate();
    } else {
      return alert("you should enter title and text");
    };
  };

  // Delete obj
  const deleteNote = (event: any) => {
    event.preventDefault();
    const idNote: number = event.target.id;
    dispatch({ type: "DELETE_NOTE", payload: idNote })
    console.log(store.getState().note[0])
    const request = window.indexedDB.open("Database", 1);
    request.onsuccess = (event: Event) => {
      const db = (event.target as IDBOpenDBRequest).result as IDBDatabase;
      const transactionNotes = db.transaction('notes', 'readwrite');
      const objectStoreNotes = transactionNotes.objectStore('notes');
      let id: number = +idNote;
      objectStoreNotes.delete(id);
    };
    request.onerror = (event) => {
      console.error(`Error: ${event}`);
    };
  };



  return (
    <div className="App">
      <header className="App-header">
        <div>
          New notes:
          <ul>
            {arrNoteObj?.map((e: any) =>
              <li key={e.id}>
                <div>
                  {e.title}
                  <br />
                  {e.text}
                </div>
                <button id={e.id} onClick={deleteNote}>Delete</button>
              </li>)}
          </ul>
        </div>
        <div>
          <div>
            <form onSubmit={submitFunc}>
              <label>
                Title:
                <textarea name="textinput" id="textinput" cols={50} rows={1} style={{ resize: "none", display: 'flex', }}></textarea>
              </label>
              <label>
                Text area:
                <textarea name="textinput" id="textinput" cols={50} rows={10} style={{ resize: "none", display: 'flex', }}></textarea>
                <button type='submit'>Submit</button>
              </label>
            </form>
          </div>
        </div>

      </header>
    </div>
  );
}

export default App;


