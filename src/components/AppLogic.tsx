import React, { useRef, useState } from 'react'
import { store } from '../store/store';
import { addNoteAction, updateNoteAction } from '../actions/action';
import { useDispatch, useSelector } from 'react-redux';


function AppLogic() {

    const regex = /#\w+/g;
    const currentTitle = useRef<string>("");
    const currentText = useRef<string>("");
    const currentDiv = useRef<string>("");
    const currentHashTag = useRef<string[] | null | undefined>();
    const currentNoteId = useRef(0);
    const pickedHashTag = useRef<string>();

    const dispatch = useDispatch();
    const arrNoteObj = useSelector((state: any) => state.note[0]);

    const [areaTitle, setAreaTitle] = useState<string>();
    const [areaText, setAreaText] = useState<string>();
    const [ifActive, setIfActive] = useState<boolean>(false);
    const [hashTags, setHashTags] = useState<string[] | null | undefined>();

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
            currentTitle.current = titleValue;
            setAreaTitle("");
            setAreaText("");
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

    // Update note
    const updateNote = (e: any) => {
        e.preventDefault();
        const idNote = currentNoteId.current;
        const titleValue = currentTitle.current;
        const textValue = currentText.current;
        const hashTagValue = currentHashTag.current;
        dispatch(updateNoteAction(idNote, titleValue, textValue, hashTagValue));
        const request = window.indexedDB.open("Database", 1);
        request.onsuccess = (e) => {
            const db = (e.target as IDBOpenDBRequest).result as IDBDatabase;
            const transactionNotes = db.transaction('notes', 'readwrite');
            const objectStoreNotes = transactionNotes.objectStore('notes');
            const getRequest = objectStoreNotes.get(+idNote);
            getRequest.onsuccess = () => {
                const data = getRequest.result;
                data.title = titleValue;
                data.text = textValue;
                data.hashTag = hashTagValue;
                objectStoreNotes.put(data, +idNote);
            }
        };
        request.onerror = (e) => {
            console.error(`Error: ${e}`);
        };
        e.target.reset();
        setAreaTitle("");
        setAreaText("");
        currentHashTag.current = undefined;
        const editNote = document.getElementById("editNote") as HTMLFormElement;
        editNote.style.display === "none" ? editNote.style.display = "block" : editNote.style.display = "none";
        const addButton = document.getElementById('addButton') as HTMLButtonElement;
        addButton.style.display === "none" ? addButton.style.display = "block" : addButton.style.display = "none";
    };

    //trackers for main form
    function trackTitle(e: any) {
        currentTitle.current = e.target.value;
        setAreaTitle(currentTitle.current)
    }
    function trackText(e: any) {
        currentText.current = e.target.value;
        setAreaText(currentText.current);
        const findHashTag = currentText.current?.match(regex);

        setHashTags(findHashTag);
        currentHashTag.current = findHashTag;
    }

    function trackDivInput(e: any) {
        e.preventDefault();
        const divInput = document.getElementById('divInput') as HTMLDivElement;
        const pre = document.getElementById('pre') as HTMLDivElement;
        const findHashTag = divInput.textContent?.match(regex);
        setHashTags(findHashTag);
        currentHashTag.current = findHashTag;
        const divText = divInput.textContent;
        const replaceText: any = divText?.replaceAll(regex, "<mark>$&</mark>");
        pre.innerHTML = replaceText;
        currentText.current = divInput.textContent!;
        setAreaText(currentText.current);
    }

    function scrollMinor() {
        const divInput = document.getElementById('divInput') as HTMLDivElement;
        const pre = document.getElementById('pre') as HTMLDivElement;
        pre.scrollTo(divInput.scrollLeft, divInput.scrollTop);
    }

    function findNote(e: any) {
        pickedHashTag.current = e.target.textContent;
        ifActive === true ? setIfActive(false) : setIfActive(true);
        ifActive === true ? e.nativeEvent.target.style.backgroundColor = "white" : e.nativeEvent.target.style.backgroundColor = "#1a75ff";
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
        const addButton = document.getElementById('addButton') as HTMLButtonElement;
        let divInput = document.getElementById('divInput') as HTMLDivElement;
        let pre = document.getElementById('pre') as HTMLDivElement;

        if (formNote.style.display === 'block') {
            alert("Finish the creating note!")
        } else {
            addButton.style.display === "none" ? addButton.style.display = "block" : addButton.style.display = "none";
            editNote.style.display === "none" ? editNote.style.display = "block" : editNote.style.display = "none";
            const objFromStore = arrNoteObj.filter((e: any) => +idNote === e.id && e);
            editTitle.value = objFromStore[0].title;
            editTitle.value = currentTitle.current;
            setAreaTitle(objFromStore[0].title);
            const valInput = objFromStore[0].text.replaceAll(regex, "<mark>$&</mark>");
            divInput.innerHTML = valInput;
            currentText.current = divInput.textContent!;
            pre.innerHTML = valInput;
            currentDiv.current = valInput;
            const findHashTag = divInput.textContent?.match(regex);
            setHashTags(findHashTag);
            currentHashTag.current = objFromStore[0].hashTag;
        }
    }

    function cancelEdit() {
        const editNote = document.getElementById("editNote") as HTMLFormElement;
        const addButton = document.getElementById('addButton') as HTMLButtonElement;
        editNote.style.display === "none" ? editNote.style.display = "block" : editNote.style.display = "none";
        addButton.style.display === "none" ? addButton.style.display = "block" : addButton.style.display = "none";
        setAreaTitle("");
    }

    //delete double tags
    const arrHashTags = arrNoteObj?.map((e: any) => e?.hashTag?.map((el: any) => el)).flat().reduce((acum: Array<string>, curr: string) => [...acum.filter((e: any) => e !== curr), curr], []);

    return (
        <div className="App">
            <header className="App-header">
                <div id='allNotes'>
                    New notes:
                    <br />
                    <label id='taglist'>All tags:
                        {arrHashTags?.map((e: any, index: string) => <span key={index} id={index} onClick={findNote} style={{ marginLeft: "3px", borderRadius: "4px", padding: "2px" }}>{e}</span>)}
                    </label>
                    <ul>
                        {ifActive ?
                            arrNoteObj.map((el: any) =>
                                el.hashTag.some((e: string) => pickedHashTag.current === e) &&
                                <div key={el.id} id='topNotes'>
                                    <div id="notes" key={el.id}>
                                        <div id='data'>
                                            Title: {el.title}
                                            <br />
                                            Text:
                                            <br />
                                            {el.text}
                                        </div>
                                        <div id='buttons'>
                                            <button id={el.id} onClick={showHideEdit}>Edit</button>
                                            <br />
                                            <br />
                                            <br />
                                            <button id={el.id} onClick={deleteNote}>Delete</button>
                                        </div>
                                    </div>
                                    <div id='hashTag'>
                                        <span onClick={findNote}>
                                            {el.hashTag.map((e: string, index: string) => <span key={index} style={{ marginLeft: "3px", borderRadius: "3px", padding: "1px" }}>{e}</span>)}
                                        </span>
                                    </div>
                                </div>
                            )
                            :
                            arrNoteObj?.map((element: any) =>
                                <div key={element?.id} id='topNotes'>
                                    <div id="notes" key={element?.id}>
                                        <div id='data'>
                                            Title: {element?.title}
                                            <br />
                                            Text:
                                            <br />
                                            {element?.text}
                                        </div>
                                        <div id='buttons'>
                                            <button id={element?.id} onClick={showHideEdit}>Edit</button>
                                            <br />
                                            <br />
                                            <br />
                                            <button id={element?.id} onClick={deleteNote}>Delete</button>
                                        </div>
                                    </div>
                                    <div id='hashTag'>
                                        <span onClick={findNote}>{element?.hashTag?.map((e: string, index: string) => <span key={index} style={{ marginLeft: "3px", borderRadius: "3px", padding: "1px" }}>
                                            {e}
                                        </span>)}
                                        </span>
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
                            {/* {currentHashTag.current ? <span style={{ marginRight: "3px" }}>{currentHashTag.current}</span> : null} */}
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
                                <div id='pre'></div>
                                <div contentEditable={true} id='divInput' unselectable='on' onScroll={scrollMinor} spellCheck="false" onInput={trackDivInput}></div>
                            </label>
                            <button type='submit'>Update</button>
                            <input type="button" id='cancelButton' value="Cancel" onClick={cancelEdit} />
                            <div>
                                {/* {currentHashTag.current ? currentHashTag.current : null} */}
                            </div>

                        </form>
                    </div>
                </div>
            </header>
        </div>
    )
}

export default AppLogic;