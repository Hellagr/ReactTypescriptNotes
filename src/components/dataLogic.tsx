import React from 'react'
import { useEffect } from 'react';

function DataLogic(props: any) {
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
            props.setCurrentValue(event.target[0].value);
            if (props.currentValue === event.target[0].value) {
                //Add obj to a database
                request.onsuccess = (event) => {
                    const db = (event.target as IDBOpenDBRequest).result as IDBDatabase;
                    const transaction = db.transaction("notes", "readwrite");
                    const objectStore = transaction.objectStore("notes");
                    let note = {
                        text: props.currentValue
                    }
                    if (props.currentValue === "") {
                        return
                    } else {
                        const addObj = objectStore.add(note);
                        addObj.onsuccess = () => {
                            // For update page through the useEffect
                            props.setCurrentValue("");

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
        props.setCurrentValue(event.target.value);
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
                props.setDataBase(dataNotes);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.dataBase, props.currentValue])

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
                    props.setDataBase(dataNotes);
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
                if (props.currentValue === '') { return } else {
                    data.text = props.currentValue;
                    objectStoreNotes.put(data);
                    props.setCurrentValue("");
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
                        {props.dataBase.map((e: any) =>
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
                            <textarea name="textinput" id="textinput" cols={50} rows={10} style={{ resize: "none", display: 'flex', fontSize: 22 }} value={props.currentValue} onChange={currentValues}></textarea>
                            <button type='submit'>Submit</button>
                        </form>
                    </div>
                </div>
                <div>
                    Deleted notes:
                </div>
            </header>
        </div>
    )
}

export default DataLogic;