import { MutableRefObject, useState } from 'react';
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

function EditNote(this: any, { checked, updateChecked, updateCheckedAdd, regex, currentTitle, currentText, currentHashTag, currentNoteId, updateHashTags, areaTitle, updateAreaTitle, areaText, updateAreaText, trackTitle }: EditNoteProps) {

    const dispatch = useDispatch();
    const [addFontSize, setAddFontSize] = useState(17);

    // Update note
    const updateNote = (e: any) => {
        updateChecked((prev: any) => !prev);
        updateCheckedAdd((prev: any) => !prev);
        e.preventDefault();
        const idNote = currentNoteId.current;
        const titleValue = currentTitle.current;
        const textValue = currentText.current;
        const hashTagValue = currentHashTag.current;
        dispatch(updateNoteAction(idNote, titleValue, textValue, hashTagValue));
        const request = window.indexedDB.open("Database", 2);
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
        editNote.style.display === "none" ? editNote.style.display = "block" : editNote.style.display = "none";
        formNote.style.display === "none" ? formNote.style.display = "block" : formNote.style.display = "none";
    };



    //23523523423 days lost
    function trackDivInput(e: any) {
        e.preventDefault();
        const divInput = document.getElementById('divInput') as HTMLDivElement;
        const findHashTag = divInput.textContent?.match(regex);
        updateHashTags(findHashTag);
        currentHashTag.current = findHashTag;
        const afterPut = divInput?.innerHTML.replaceAll(/<mark>|<\/mark>|<br>/g, "") as string;
        const divText = afterPut;
        const replaceText: string = divText?.replaceAll(regex, "<mark>$&</mark>") as string;
        updateAreaText(currentText.current);
        currentText.current = replaceText;

        if (e.nativeEvent.data === null || e.nativeEvent.data === ' ') {
            currentText.current = divInput.innerHTML;
            return;
        } else {
            let selection: Selection = document.getSelection() as Selection;
            for (let i = divInput.childNodes.length; i > 0; i--) {
                selection.modify('extend', "backward", "line");
            }
            const modifyDiv = currentText.current;
            selection.deleteFromDocument();
            divInput.insertAdjacentHTML('afterbegin', modifyDiv);
        }
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

    function chgFontSize(e: any) {
        const divInput = document.getElementById('divInput') as HTMLDivElement;
        const spanElement = document.createElement("span");
        e.preventDefault();
        setAddFontSize(+e.target.value);
        const selectedText = window.getSelection();
        const selectedCurrentText = window.getSelection()?.toString() as string;
        if (selectedText === null) {
            return;
        } else {
            divInput.focus();
            const selectRange = selectedText?.getRangeAt(0) as Range;
            spanElement.innerHTML = selectedCurrentText;
            spanElement.style.fontSize = e.target.value + "px";
            selectRange.deleteContents();
            selectRange.insertNode(spanElement);
        }
        currentText.current = divInput.innerHTML;
    }

    function chgStyle(e: any) {
        const divInput = document.getElementById('divInput') as HTMLDivElement;
        const span = document.createElement('span');
        e.preventDefault();

        const selectedText = window.getSelection();
        const selectedCurrentText = window.getSelection()?.toString() as string;
        if (e.target.id === 'boldChng') {
            if (selectedText === null) {
                return;
            } else {
                divInput.focus();
                if (selectedCurrentText.length > 0) {
                    document.execCommand('bold');
                }
            }
        }
        if (e.target.id === 'italicsFont') {
            if (selectedText === null) {
                return;
            } else {
                divInput.focus();
                if (selectedCurrentText.length > 0) {
                    document.execCommand('italic');
                }
            }
        }
        if (e.target.id === 'fontColor') {
            if (selectedText === null) {
                return;
            } else {
                divInput.focus();
                if (selectedCurrentText.length > 0) {
                    divInput.focus();
                    const selectRange = selectedText?.getRangeAt(0) as Range;
                    span.innerHTML = selectedCurrentText;
                    span.style.color = e.target.value;
                    selectRange.deleteContents();
                    selectRange.insertNode(span);
                }
            }
        }
    }


    return (
        <Box>
            <Fade in={checked}>
                <form id='editNote' onSubmit={updateNote} style={{ display: 'none' }}>
                    <div id='afterAdd' >
                        You are in editing note mode
                    </div>
                    <label>
                        Title:
                        <br />
                        <textarea name="titleedit" id="titleedit" rows={1} style={{ resize: "none", display: 'flex' }} value={areaTitle} onChange={trackTitle}>
                        </textarea>
                    </label>

                    Text area:
                    <br />
                    <div>
                        <div id='buttonsForText'>
                            <input id='fontSize' type="number" value={addFontSize} title='Font size' onChange={chgFontSize} />
                            <input id='boldChng' type="button" value={"B"} title='Bold font' onClick={chgStyle} />
                            <input id='italicsFont' type="button" value={"I"} title='Italic font' onClick={chgStyle} />
                            <input type="color" title='Font color' id="fontColor" onChange={chgStyle} />
                        </div>
                    </div>
                    <div contentEditable={true} id='divInput' onInput={trackDivInput} spellCheck="false" >
                    </div>
                    <Button className='subminEditMobile' variant="contained" color="success" size='small' type='submit' >Submit</Button>
                    {/* <Button className='buttonsMaterial' variant="contained" color="success" size='small' type='submit' >Submit</Button> */}
                    <Button className='cancelButton' variant="contained" color="warning" size='small' id='cancelButton' onClick={cancelEdit}>Cancel</Button>
                    <div style={{ width: "350px", wordBreak: "break-word", marginLeft: "3px", borderRadius: "3px", padding: "1px" }}>
                        {currentHashTag.current ? currentHashTag.current.join(" ") : null}
                    </div>
                </form>
            </Fade>
        </Box>
    )
}

export default EditNote