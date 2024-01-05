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
  const currentDiv = useRef<string>("");
  const currentHashTag = useRef<string[] | null | undefined>();
  const currentNoteId = useRef(0);

  const dispatch = useDispatch();
  const arrNoteObj = useSelector((state: any) => state.note[0]);

  const [areaTitle, setAreaTitle] = useState<string>();
  const [areaText, setAreaText] = useState<string>();
  const [divText, setDivText] = useState<string>("");
  const [hashTags, setHashTags] = useState<string[] | null | undefined>();
  const [colorToggler, setColorToggler] = useState<boolean>(false);

  //trackers for main form
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

  function trackDivInput(e: any) {
    e.preventDefault();
    let divInput = document.getElementById('divInput') as HTMLDivElement;
    const findHashTag = divInput.textContent?.match(regex);
    setHashTags(findHashTag);
    currentHashTag.current = findHashTag;

    const divText = divInput.textContent;
    const replaceText: any = divText?.replaceAll(regex, "<mark>$&</mark>");
    divInput.innerHTML = replaceText;
    const range = document.createRange();
    console.log('range::: ', range);
    const selection = window.getSelection();

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

    const idNote = currentNoteId.current;
    arrNoteObj.map((element: any) => {
      if (element.id === idNote) {
        element.text = currentText.current;
        element.title = currentTitle.current;
        element.hashTag = currentHashTag.current;
      }
    });
    console.log('arrNoteObj::: ', arrNoteObj);
    // const some = arrNoteObj.map((element: any) => {

    //   return element;
    // });
    // console.log('some::: ', some);
    // const request = window.indexedDB.open("Database", 1);
    // request.onsuccess = (e) => {
    //   const db = (e.target as IDBOpenDBRequest).result as IDBDatabase;
    //   const transactionNotes = db.transaction('notes', 'readwrite');
    //   const objectStoreNotes = transactionNotes.objectStore('notes');
    //   const getRequest = objectStoreNotes.get(+idNote);
    //   getRequest.onsuccess = () => {
    //     const data = getRequest.result;
    //     data.text = currentText.current;
    //     data.title = currentTitle.current;
    //     data.hashTag = currentHashTag.current;
    //     objectStoreNotes.put(data, +idNote);
    //   }
    // };
    // request.onerror = (e) => {
    //   console.error(`Error: ${e}`);
    // };
    e.target.reset();
    const editNote = document.getElementById("editNote") as HTMLFormElement;
    editNote.style.display === "none" ? editNote.style.display = "block" : editNote.style.display = "none";
    const addButton = document.getElementById('addButton') as HTMLButtonElement;
    addButton.style.display === "none" ? addButton.style.display = "block" : addButton.style.display = "none";
  };

  function findNote(e: any) {
    if (colorToggler === false) {
      setColorToggler(true);
    } else {
      setColorToggler(false);
    }

  }
  function toggleForm() {
    const form = document.getElementById("form") as HTMLFormElement;
    const addButton = document.getElementById('addButton') as HTMLButtonElement;
    addButton.style.display === "none" ? addButton.style.display = "block" : addButton.style.display = "none";
    form.style.display === "none" ? form.style.display = "block" : form.style.display = "none";
  }

  function showHideEdit(e: any) {
    const idNote = e.target.id;
    currentNoteId.current = +idNote;
    const formNote = document.getElementById('form') as HTMLFormElement;
    const editNote = document.getElementById('editNote') as HTMLFormElement;
    const editTitle = document.getElementById("titleedit") as HTMLTextAreaElement;
    const editText = document.getElementById("textedit") as HTMLTextAreaElement;
    const addButton = document.getElementById('addButton') as HTMLButtonElement;
    let divInput = document.getElementById('divInput') as HTMLDivElement;
    if (formNote.style.display === 'block') {
      alert("Finish the creating note!")
    } else {
      addButton.style.display === "none" ? addButton.style.display = "block" : addButton.style.display = "none";
      editNote.style.display === "none" ? editNote.style.display = "block" : editNote.style.display = "none";
      const objFromStore = arrNoteObj.filter((e: any) => +idNote === e.id && e);
      editTitle.value = objFromStore[0].title;
      setAreaTitle(objFromStore[0].title);

      const valInput = objFromStore[0].text.replaceAll(regex, "<mark>$&</mark>");
      divInput.innerHTML = valInput;
      currentDiv.current = valInput;

      const findHashTag = divInput.textContent?.match(regex);
      setHashTags(findHashTag);
      currentHashTag.current = objFromStore[0].hashTag;

    }
  }

  function cancelEdit() {
    const editNote = document.getElementById("editNote") as HTMLFormElement;
    const editTitle = document.getElementById("titleedit") as HTMLTextAreaElement;
    const editText = document.getElementById("textedit") as HTMLTextAreaElement;
    const addButton = document.getElementById('addButton') as HTMLButtonElement;
    editTitle.value = "";
    editText.value = "";
    editNote.style.display === "none" ? editNote.style.display = "block" : editNote.style.display = "none";
    addButton.style.display === "none" ? addButton.style.display = "block" : addButton.style.display = "none";
  }

  return (
    <div className="App">
      <header className="App-header">
        <div id='allNotes'>
          New notes:
          <br />
          <label id='taglist'>All tags:
            {arrNoteObj?.map((e: any) =>
              <span key={e.id} id={e.id} style={{ backgroundColor: `${colorToggler === true ? "red" : ""}` }} onClick={findNote}>
                {e.hashTag ? spaceBetween + e.hashTag.join(' ') + spaceBetween : null}
              </span>)}
          </label>
          <ul>
            {arrNoteObj?.map((e: any) =>
              <div key={e.id} id='topNotes'>
                <div id="notes" key={e.id}>
                  <div id='data'>
                    Title: {e.title}
                    <br />
                    Text:
                    <br />
                    {e.text}
                  </div>
                  <div id='buttons'>
                    <button id={e.id} onClick={showHideEdit}>Edit</button>
                    <br />
                    <br />
                    <br />
                    <button id={e.id} onClick={deleteNote}>Delete</button>
                  </div>
                </div>
                <div id='hashTag' onClick={findNote} style={{ backgroundColor: `${colorToggler === true ? "yellow" : ""}` }} >
                  {e.hashTag}
                </div>
              </div>)}
          </ul>
        </div>
        <div>
          <div>
            <button id='addButton' onClick={toggleForm} style={{ marginRight: "20px", }}>Add note +</button>
          </div>
          <div >
            <form id={"form"} onSubmit={submitFunc} style={{ display: 'none', paddingTop: '50px' }}>
              <label>
                Title:
                <textarea name="titleinput" id="titleinput" cols={50} rows={1} style={{ resize: "none", display: 'flex', }} value={areaTitle} onChange={trackTitle}></textarea>
              </label>
              <label>
                Text area:
                <textarea name="textinput" id="textinput" cols={50} rows={10} style={{ resize: "none", display: 'flex', }} value={areaText} onChange={trackText}></textarea>
                <button type='submit'>Submit</button>
                <input type="button" id='cancelButton' value="Cancel" onClick={toggleForm} />
              </label>
              <br />
              {currentHashTag.current ? currentHashTag.current : null}
            </form>
            <form id='editNote' onSubmit={updateNote} style={{ display: 'none', paddingTop: '50px' }}>
              <label>
                Edit Note
                <br />
                Title:
                <textarea name="titleedit" id="titleedit" cols={50} rows={1} style={{ resize: "none", display: 'flex', }} value={areaTitle} onChange={trackTitle}>

                </textarea>
              </label>
              <label id='labelText'>
                Text area:
                {/* <textarea name="textedit" id="textedit" cols={50} rows={10} style={{ resize: "none", display: 'flex', }} onChange={trackText}><div>asd</div></textarea>
                <input type="text" /> */}
                <div contentEditable={true} id='divInput' onInput={trackDivInput}></div>
              </label>
              <button type='submit'>Update</button>
              <input type="button" id='cancelButton' value="Cancel" onClick={cancelEdit} />
              <div>
                {currentHashTag.current ? currentHashTag.current : null}
              </div>
            </form>
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;