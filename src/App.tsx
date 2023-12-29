import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import { store } from './store/store';
import { addNoteAction } from './actions/action';
import { useDispatch, useSelector } from 'react-redux';

function App() {

  const regex = /#\w+/g;
  const spaceBetween = " ";

  const currentTitle = useRef<string>();
  const currentText = useRef<string>();
  const currentHashTag = useRef<string[] | null | undefined>();

  const dispatch = useDispatch();
  const arrNoteObj = useSelector((state: any) => state.note[0]);

  const [areaTitle, setAreaTitle] = useState<string>();
  const [areaText, setAreaText] = useState<string>();
  const [hashTags, setHashTags] = useState<string[] | null | undefined>();
  const [colorToggler, setColorToggler] = useState<boolean>(false);

  function trackTitle(e: any) {
    currentTitle.current = e.target.value;
    setAreaTitle(currentTitle.current)
  }
  function trackText(e: any) {
    currentText.current = e.target.value;
    setAreaText(currentText.current)
    const findHashTag = currentText.current?.match(regex);
    setHashTags(findHashTag);
    currentHashTag.current = findHashTag;
  }

  //Check existence of database
  if (!('indexedDB' in window)) {
    alert("This browser doesn't support IndexedDB");
  }
  //Open database 
  const request = window.indexedDB.open("Database", 1);
  request.onerror = (e) => {
    console.error(`Error: ${e}`);
  };
  request.onupgradeneeded = (e) => {
    const db = (e.target as IDBOpenDBRequest).result;
    db.createObjectStore("notes");
  }

  //Add object to store
  function submitFunc(e: any) {
    e.preventDefault();
    const titleValue = e.target[0].value;
    const textValue = e.target[1].value;
    const hashTagValue = hashTags;

    if (e.target[0].value !== '' && e.target[1].value !== '') {
      dispatch(addNoteAction(titleValue, textValue, hashTagValue));

      const lastObjNumber = store.getState().note[0].length - 1;
      const lastObj = store.getState().note[0][lastObjNumber];

      //Add obj to a database
      const request = window.indexedDB.open("Database", 1);
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result as IDBDatabase;
        const transaction = db.transaction("notes", "readwrite");
        const objectStore = transaction.objectStore("notes");
        objectStore.add(lastObj, lastObj.id)
        request.onerror = (e) => {
          console.error(`Error: ${e}`);
        };
      }
      e.target.reset();
      setAreaTitle("")
      setAreaText("")
      currentHashTag.current = undefined;
    } else {
      return alert("you should enter title and text");
    };
  };

  // Delete obj
  const deleteNote = (event: any) => {
    event.preventDefault();
    const idNote: number = event.target.id;
    dispatch({ type: "DELETE_NOTE", payload: idNote })
    const request = window.indexedDB.open("Database", 1);
    request.onsuccess = (event: Event) => {
      const db = (event.target as IDBOpenDBRequest).result as IDBDatabase;
      const transactionNotes = db.transaction('notes', 'readwrite');
      const objectStoreNotes = transactionNotes.objectStore('notes');
      let id: number = +idNote;
      objectStoreNotes.delete(id);
    };
    request.onerror = (e) => {
      console.error(`Error: ${e}`);
    };
  };

  // Update obj
  const updateNote = (e: any) => {
    e.preventDefault();
    const idNote: number = +e.target.id;
    arrNoteObj.map((element: any) => {
      if (element.id === idNote) {
        element.text = currentText.current;
        element.title = currentTitle.current;
      }
    });
    const request = window.indexedDB.open("Database", 1);
    request.onsuccess = (e) => {
      const db = (e.target as IDBOpenDBRequest).result as IDBDatabase;
      const transactionNotes = db.transaction('notes', 'readwrite');
      const objectStoreNotes = transactionNotes.objectStore('notes');
      const getRequest = objectStoreNotes.get(idNote);
      getRequest.onsuccess = () => {
        const data = getRequest.result;
        data.text = currentText.current;
        data.title = currentTitle.current;
        objectStoreNotes.put(data, +idNote);
      }
    };
    request.onerror = (e) => {
      console.error(`Error: ${e}`);
    };
    setAreaTitle("");
    setAreaText("");
  };

  function findNote(e: any) {
    if (colorToggler === false) {
      setColorToggler(true);
    } else {
      setColorToggler(false);
    }

  }
  console.log(colorToggler)


  return (
    <div className="App">
      <header className="App-header">
        <div id='allNotes'>
          New notes:
          <ul>
            {arrNoteObj?.map((e: any) =>
              <div id="notes" key={e.id}>
                <div id='data'>
                  Title: {e.title}
                  <br />
                  Text:
                  <br />
                  {e.text}
                </div>
                <div id='buttons'>
                  <button id={e.id} onClick={updateNote}>Update</button>
                  <br />
                  <br />
                  <br />
                  <button id={e.id} onClick={deleteNote}>Delete</button>
                </div>
              </div>)}
          </ul>
        </div>
        <div>
          <div>
            <form id={"form"} onSubmit={submitFunc}>
              <label>
                Title:
                <textarea name="titleinput" id="titleinput" cols={50} rows={1} style={{ resize: "none", display: 'flex', }} value={areaTitle} onChange={trackTitle}></textarea>
              </label>
              <label>
                Text area:
                <textarea name="textinput" id="textinput" cols={50} rows={10} style={{ resize: "none", display: 'flex', }} value={areaText} onChange={trackText}></textarea>
                <button type='submit'>Submit</button>
              </label>
            </form>
            <label id='taglist'>Tag List:
              <div>
                {arrNoteObj?.map((e: any) =>
                  <span key={e.id} id={e.id} style={{ backgroundColor: `${colorToggler === true ? "red" : ""}` }} onClick={findNote}>
                    {e.hashTag ? e.hashTag.join(' ') + spaceBetween : null}
                  </span>)}
              </div>
            </label>
            {currentHashTag.current ? "New hash tag is found: " + currentHashTag.current : null}
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;


