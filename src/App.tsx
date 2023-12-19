import React from 'react';
import './App.css';
import { useState, useEffect } from 'react';


function App() {

  const [currentValue, setCurrentValue] = useState<string>("");
  const [dataBase, setDataBase] = useState<{ text: string, id: number }[]>([]);

  if (!('indexedDB' in window)) {
    alert("This browser doesn't support IndexedDB");
  }

  const request = window.indexedDB.open("Database", 1);

  request.onerror = (event) => {
    console.error(`Error: ${event}`);
  };

  request.onupgradeneeded = (event) => {
    const db = (event.target as IDBOpenDBRequest).result;
    db.createObjectStore("notes", { keyPath: "id", autoIncrement: true });
  }


  const submitNote = (event: any) => {
    event.preventDefault();
    if (event.target[0].value === "" || event.target[0].value === null || event.target[0].value === undefined) {
      return;
    } else {
      setCurrentValue(event.target[0].value);
      if (currentValue === event.target[0].value) {
        //Add obj to a database
        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result as IDBDatabase;
          const transaction = db.transaction("notes", "readwrite");
          const objectStore = transaction.objectStore("notes");
          let note = {
            text: currentValue
          }
          if (currentValue === "") {
            return
          } else {
            const addObj = objectStore.add(note);
            addObj.onsuccess = () => {
              // For update page through the useEffect
              setCurrentValue("");

            }
            request.onerror = (event) => {
              console.error(`Error: ${event}`);
            };
          }
        };
      }
    }
    event.target.reset();
  }

  function currentValues(event: any) {
    setCurrentValue(event.target.value);
  }

  //Get all obj
  useEffect(() => {
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result as IDBDatabase;
      const transactionNotes = db.transaction('notes', 'readonly');
      const objectStoreNotes = transactionNotes.objectStore('notes');
      const getRequest = objectStoreNotes.getAll();
      getRequest.onsuccess = function (event) {
        const dataNotes = (event.target as IDBRequest).result;
        setDataBase(dataNotes);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataBase, currentValue])

  //Delete obj
  const deleteNote = (event: any) => {
    event.preventDefault();
    const idNote: number = event.target.id;
    const request = window.indexedDB.open("Database", 1);
    request.onsuccess = (event: Event) => {
      const db = (event.target as IDBOpenDBRequest).result as IDBDatabase;
      const transactionNotes = db.transaction('notes', 'readwrite');
      const objectStoreNotes = transactionNotes.objectStore('notes');
      let id: number = +idNote;
      const deleteId = objectStoreNotes.delete(id);
      deleteId.onsuccess = () => {
        const transactionNotes = db.transaction('notes', 'readonly');
        const objectStoreNotes = transactionNotes.objectStore('notes');
        const getRequest = objectStoreNotes.getAll();
        getRequest.onsuccess = function (event) {
          const dataNotes = (event.target as IDBRequest).result;
          setDataBase(dataNotes);
        };
      };
      request.onerror = (event) => {
        console.error(`Error: ${event}`);
      };
    };
  };

  // Update obj
  const updateNote = (event: any) => {
    event.preventDefault();
    const idNote: number = +event.target.id;
    const request = window.indexedDB.open("Database", 1);
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result as IDBDatabase;
      const transactionNotes = db.transaction('notes', 'readwrite');
      const objectStoreNotes = transactionNotes.objectStore('notes');
      const getRequest = objectStoreNotes.get(idNote);
      getRequest.onsuccess = () => {
        const data = getRequest.result;
        if (currentValue === '') { return } else {
          data.text = currentValue;
          objectStoreNotes.put(data);
          setCurrentValue("");
        }

      };
      request.onerror = (event) => {
        console.error(`Error: ${event}`);
      };
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
            {dataBase.map((e) =>
              <div key={e.id}>{e.text}
                <a><button key={e.id} id={e.id.toString()} onClick={deleteNote}>x</button></a>
                <a><button key={e.id} id={e.id.toString()} onClick={updateNote}>update</button></a>
              </div>)}
          </ul>

        </div>
        <div>
          <div>
            <select name="fontsSize" id="fontsSize">
              <option value={10}>10 px</option>
              <option value={14}>14 px</option>
              <option value={24}>20 px</option>
              <option value={36}>36 px</option>
            </select>
            <form onSubmit={submitNote}>
              <textarea name="textinput" id="textinput" cols={50} rows={10} style={{ resize: "none", display: 'flex', fontSize: 22 }} value={currentValue} onChange={currentValues}></textarea>
              <button type='submit'>Submit</button>
            </form>
          </div>
        </div>
        <div>
          Deleted notes:
        </div>
      </header>
    </div>
  );
}

export default App;


