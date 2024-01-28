import { MutableRefObject } from 'react';
import { updateNoteAction } from '../../actions/action';
import { useDispatch } from 'react-redux';
import { Button } from '@mui/material';
import Fade from '@mui/material/Fade';
import Box from '@mui/material/Box';


interface EditNoteProps {
    checked: boolean
    updateChecked: (update: any) => void
    updateCheckedAdd: (update: any) => void
    regex: RegExp
    currentTitle: MutableRefObject<string>
    currentText: MutableRefObject<string>
    currentHashTag: MutableRefObject<string[] | null | undefined>
    currentNoteId: MutableRefObject<number>
    updateHashTags: (update: string[] | null | undefined) => void
    areaTitle: string | undefined
    areaText: string | undefined
    updateAreaTitle: (update: string) => void
    updateAreaText: (update: string) => void
    trackTitle: any
}

function EditNote({ checked, updateChecked, updateCheckedAdd, regex, currentTitle, currentText, currentHashTag, currentNoteId, updateHashTags, areaTitle, updateAreaTitle, areaText, updateAreaText, trackTitle }: EditNoteProps) {

    const dispatch = useDispatch();

    // Update note
    const updateNote = (e: any) => {
        updateChecked((prev: any) => !prev);
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
        updateAreaTitle("");
        updateAreaText("");
        currentHashTag.current = undefined;
        const editNote = document.getElementById("editNote") as HTMLFormElement;
        const formNote = document.getElementById('form') as HTMLFormElement;
        formNote.style.display === "none" ? formNote.style.display = "block" : formNote.style.display = "none";
        editNote.style.display === "none" ? editNote.style.display = "block" : editNote.style.display = "none";
    };

    function trackDivInput(e: any) {
        e.preventDefault();
        const divInput = document.getElementById('divInput') as HTMLDivElement;
        const pre = document.getElementById('pre') as HTMLDivElement;
        const findHashTag = divInput.textContent?.match(regex);
        updateHashTags(findHashTag);
        currentHashTag.current = findHashTag;
        const divText = divInput.textContent;
        const replaceText: any = divText?.replaceAll(regex, "<mark>$&</mark>");
        pre.innerHTML = replaceText;
        currentText.current = divInput.textContent!;
        updateAreaText(currentText.current);
    }

    function scrollMinor() {
        const divInput = document.getElementById('divInput') as HTMLDivElement;
        const pre = document.getElementById('pre') as HTMLDivElement;
        pre.scrollTo(divInput.scrollLeft, divInput.scrollTop);
    }

    function cancelEdit() {
        updateChecked((prev: any) => !prev);
        updateCheckedAdd((prev: boolean) => !prev);
        const editNote = document.getElementById("editNote") as HTMLFormElement;
        const formNote = document.getElementById('form') as HTMLFormElement;
        formNote.style.display === "none" ? formNote.style.display = "block" : formNote.style.display = "none";
        editNote.style.display === "none" ? editNote.style.display = "block" : editNote.style.display = "none";
        updateAreaTitle("");
        currentHashTag.current = [];
    }

    return (
        <Box>
            <Fade in={checked}>
                <form id='editNote' onSubmit={updateNote} style={{ display: 'none', marginTop: '0.95rem' }}>
                    <div>
                        Edit note:
                    </div>
                    <label>
                        Title:
                        <br />
                        <textarea name="titleedit" id="titleedit" rows={1} style={{ resize: "none", display: 'flex', width: "350px" }} value={areaTitle} onChange={trackTitle}>
                        </textarea>
                    </label>
                    <label id='labelText'>
                        Text area:
                        <div id='pre' ></div>
                        <div contentEditable={true} id='divInput' unselectable='on' onScroll={scrollMinor} spellCheck="false" onInput={trackDivInput}></div>
                    </label>
                    <Button variant="contained" color="success" size='small' type='submit' style={{ marginTop: "1rem" }}>Submit</Button>
                    <Button variant="contained" color="warning" size='small' id='cancelButton' style={{ marginTop: "1rem" }} onClick={cancelEdit}>Cancel</Button>
                    <div style={{ marginTop: "0.5rem" }}>
                        {currentHashTag.current ? currentHashTag.current : null}
                    </div>
                </form>
            </Fade>
        </Box>
    )
}

export default EditNote