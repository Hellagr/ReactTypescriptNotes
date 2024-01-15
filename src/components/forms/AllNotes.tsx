import { MutableRefObject, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

interface AllNoteProps {
    regex: RegExp
    currentTitle: MutableRefObject<string>
    currentText: MutableRefObject<string>
    currentHashTag: MutableRefObject<string[] | null | undefined>
    currentNoteId: MutableRefObject<number>
    updateHashTags: (update: string[] | null | undefined) => void
    updateAreaTitle: (update: string) => void
}

function AllNotes({ regex, currentTitle, currentText, currentHashTag, currentNoteId, updateHashTags, updateAreaTitle }: AllNoteProps) {

    const dispatch = useDispatch();
    const arrNoteObj = useSelector((state: any) => state.note[0]);

    const currentDiv = useRef<string>("");
    const pickedHashTag = useRef<string>();
    const [ifActive, setIfActive] = useState<boolean>(false);

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

    function findNote(e: any) {
        pickedHashTag.current = e.target.textContent;
        ifActive === true ? setIfActive(false) : setIfActive(true);
        ifActive === true ? e.nativeEvent.target.style.backgroundColor = "white" : e.nativeEvent.target.style.backgroundColor = "#1a75ff";
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
            updateAreaTitle(objFromStore[0].title);
            const valInput = objFromStore[0].text.replaceAll(regex, "<mark>$&</mark>");
            divInput.innerHTML = valInput;
            currentText.current = divInput.textContent!;
            pre.innerHTML = valInput;
            currentDiv.current = valInput;
            const findHashTag = divInput.textContent?.match(regex);
            updateHashTags(findHashTag);
            currentHashTag.current = objFromStore[0].hashTag;
        }
    }

    //delete double tags
    const arrHashTags = arrNoteObj?.map((e: any) => e?.hashTag?.map((el: any) => el)).flat().reduce((acum: Array<string>, curr: string) => [...acum.filter((e: any) => e !== curr), curr], []);

    return (
        <div id='allNotes'>
            New notes:
            <br />
            <label id='taglist'>All tags:
                {arrHashTags?.map((e: any, index: string) => <span key={index} id={index} onClick={findNote} style={{ marginLeft: "3px", borderRadius: "4px", padding: "2px" }}>{e}</span>)}
            </label>
            <ul>
                {ifActive ?
                    //If a user start searching a note through a hashTag
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
                    //All notes
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
    )
}

export default AllNotes