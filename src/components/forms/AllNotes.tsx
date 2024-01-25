import { MutableRefObject, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Collapse } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { TransitionGroup } from 'react-transition-group';
import { addDeletedNote } from '../../actions/action';

interface AllNoteProps {
    updateChecked: (update: any) => void
    regex: RegExp
    currentTitle: MutableRefObject<string>
    currentText: MutableRefObject<string>
    currentHashTag: MutableRefObject<string[] | null | undefined>
    currentNoteId: MutableRefObject<number>
    updateHashTags: (update: string[] | null | undefined) => void
    updateAreaTitle: (update: string) => void
}

function AllNotes({ updateChecked, regex, currentTitle, currentText, currentHashTag, currentNoteId, updateHashTags, updateAreaTitle }: AllNoteProps) {

    const dispatch = useDispatch();
    const arrNoteObj = useSelector((state: any) => state.note[0]);
    const arrDeletedNoteObj = useSelector((state: any) => state.deletedNote[0]);
    console.log('arrDeletedNoteObj::: ', arrDeletedNoteObj);
    const currentDiv = useRef<string>("");
    const [ifActive, setIfActive] = useState<boolean>(false);
    const [currHash, setCurrHash] = useState<string[]>([]);

    // Delete obj
    const deleteNote = (event: any) => {
        event.preventDefault();
        const idNote: number = event.target.id;
        dispatch({ type: "DELETE_NOTE", payload: +idNote });
        const request = window.indexedDB.open("Database", 2);
        request.onsuccess = (event: Event) => {
            const db = (event.target as IDBOpenDBRequest).result as IDBDatabase;

            const transactionNotes = db.transaction('notes', 'readwrite');
            const objectStoreNotes = transactionNotes.objectStore('notes');

            const getRequestNotes = objectStoreNotes.get(+idNote);
            getRequestNotes.onsuccess = () => {
                const data = getRequestNotes.result;
                data.deletetime = new Date().toString();
                dispatch(addDeletedNote(data.id, data.title, data.text, data.deletetime, data.hashTag));
                const requestDeletedNotes = window.indexedDB.open("Database", 2);
                requestDeletedNotes.onsuccess = () => {
                    const transactionDeletedNotes = db.transaction('deletedNotes', 'readwrite');
                    const objectStoreDeletedNotes = transactionDeletedNotes.objectStore('deletedNotes');
                    objectStoreDeletedNotes.add(data, data.id);
                };
                let id: number = +idNote;
                objectStoreNotes.delete(id);
                requestDeletedNotes.onerror = (e) => {
                    console.error(`Error: ${e}`);
                };
            };
        };
        request.onerror = (e) => {
            console.error(`Error: ${e}`);
        };
    };

    function findNote(e: any) {
        const findNoteTag: any = e.target.textContent;
        currHash.includes(findNoteTag) ? setCurrHash(currHash.filter((e: any) => e !== findNoteTag)) : setCurrHash([...currHash, findNoteTag]);
        e.target.style.backgroundColor === "" ? e.target.style.backgroundColor = "#1a75ff" : e.target.style.backgroundColor = "";
    }

    useEffect(() => currHash.length > 0 ? setIfActive(true) : setIfActive(false), [currHash.length]);

    function showHideEdit(e: any) {
        updateChecked((prev: boolean) => !prev);
        let idNote = e.target.id;
        currentNoteId.current = +idNote;

        const formNote = document.getElementById('form') as HTMLFormElement;
        const editNote = document.getElementById('editNote') as HTMLFormElement;
        const editTitle = document.getElementById("titleedit") as HTMLTextAreaElement;
        let divInput = document.getElementById('divInput') as HTMLDivElement;
        let pre = document.getElementById('pre') as HTMLDivElement;

        formNote.style.display === "none" ? formNote.style.display = "block" : formNote.style.display = "none";
        editNote.style.display === "none" ? editNote.style.display = "block" : editNote.style.display = "none";

        const objFromStore = arrNoteObj.filter((el: any) => el.id === +idNote && el);

        editTitle.value = objFromStore[0].title;
        currentTitle.current = objFromStore[0].title;
        updateAreaTitle(objFromStore[0].title);
        const valInput = objFromStore[0].text.replaceAll(regex, "<mark>$&</mark>");
        divInput.innerHTML = valInput;
        currentText.current = divInput.textContent!;
        pre.innerHTML = valInput;
        currentDiv.current = valInput;
        const findHashTag = divInput.textContent?.match(regex);
        updateHashTags(findHashTag);
        currentHashTag.current = objFromStore[0].hashTag;
        if (editNote.style.display === "none") {
            updateAreaTitle("");
            currentHashTag.current = [];
        }

    }

    //delete double tags
    const arrHashTags = arrNoteObj?.map((e: any) => e?.hashTag?.map((el: any) => el)).flat().reduce((acum: Array<string>, curr: string) => [...acum.filter((e: any) => e !== curr), curr], []);

    return (
        <div id='allNotes'>
            Created notes:
            <br />
            <label id='taglist'>All tags:
                {arrHashTags?.map((e: any, index: string) => <span key={index} id={index} onClick={findNote} style={{ marginLeft: "3px", borderRadius: "4px", padding: "2px" }}>{e}</span>)}
            </label>
            <ul>
                <TransitionGroup>
                    {ifActive === true ?
                        //If a user start searching a note through a hashTag
                        arrNoteObj.map((el: any) =>
                            el.hashTag.some((e: string) => currHash.some((el: string) => el === e)) &&
                            <Collapse key={el.id}>
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
                                            <Button variant="contained" color="info" size="small" startIcon={<EditIcon />} id={el.id} onClick={showHideEdit}>Edit</Button>
                                            <br />
                                            <br />
                                            <br />
                                            <Button variant="contained" color="error" size="small" startIcon={<DeleteIcon />} id={el.id} onClick={deleteNote}>Delete</Button>
                                        </div>
                                    </div>
                                    <div id='hashTag'>
                                        <span >
                                            {el.hashTag.map((e: string, index: string) => <span key={index} style={{ marginLeft: "3px", borderRadius: "3px", padding: "1px" }}>{e}</span>)}
                                        </span>
                                    </div>
                                </div>

                            </Collapse>
                        )
                        :
                        //All notes
                        arrNoteObj?.map((element: any) =>
                            <Collapse key={element.id}>
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
                                            <Button variant="contained" color="info" size="small" id={element?.id} onClick={showHideEdit}>Edit</Button>
                                            <br />
                                            <br />
                                            <br />
                                            <Button variant="contained" color="error" size="small" id={element?.id} onClick={deleteNote}>Delete</Button>
                                        </div>
                                    </div>
                                    <div id='hashTag'>
                                        {element.hashTag?.map((e: string, index: string) => <span key={index} style={{ marginLeft: "3px", borderRadius: "3px", padding: "1px", wordBreak: "break-word" }}>{e}</span>)}
                                    </div>
                                </div>
                            </Collapse>
                        )
                    }
                </TransitionGroup>
            </ul >
        </div >
    )
}

export default AllNotes