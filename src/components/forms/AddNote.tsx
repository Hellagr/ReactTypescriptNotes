import { MutableRefObject, useState } from 'react'
import { useDispatch } from 'react-redux';
import { addNoteAction } from '../../actions/action';
import { store } from '../../store/store';
import { Button, Fade } from '@mui/material';
import Box from '@mui/material/Box';


interface AddNoteProps {
    regex: RegExp
    hashTags: string[] | null | undefined
    currentTitle: MutableRefObject<string>
    currentText: MutableRefObject<string>
    currentHashTag: MutableRefObject<string[] | null | undefined>
    updateHashTags: (update: string[] | null | undefined) => void
    areaTitle: string | undefined
    updateAreaTitle: (update: string) => void
    areaText: string | undefined
    updateAreaText: (update: string) => void
    trackTitle: any
    checkedAdd: boolean
}


function AddNote({ regex, hashTags, currentTitle, currentText, currentHashTag, updateHashTags, areaTitle, updateAreaTitle, areaText, updateAreaText, trackTitle, checkedAdd }: AddNoteProps) {

    const dispatch = useDispatch();
    const [addFontSize, setAddFontSize] = useState(17);
    const spanElement = document.createElement("span");


    //Add object to store
    function submitFunc(e: any) {
        const addDivInput = document.getElementById('addDivInput') as HTMLDivElement;
        console.log('addPre::: ', addDivInput);
        e.preventDefault();
        const titleValue = e.target[0].value;
        const textValue = addDivInput.innerHTML;
        const hashTagValue = hashTags;

        if (e.target[0].value !== '' && e.target[1].value !== '') {
            dispatch(addNoteAction(titleValue, textValue, hashTagValue));
            const lastObjNumber = store.getState().note[0].length - 1;
            const lastObj = store.getState().note[0][lastObjNumber];
            //Add obj to a database
            const request = window.indexedDB.open("Database", 2);
            request.onsuccess = (event) => {
                const db = (event.target as IDBOpenDBRequest).result as IDBDatabase;
                const transaction = db.transaction("notes", "readwrite");
                const objectStore = transaction.objectStore("notes");
                objectStore.add(lastObj, lastObj.id)
                request.onerror = (e) => {
                    console.error(`Error: ${e}`);
                };
            }

            currentTitle.current = titleValue;
            updateAreaTitle("");
            updateAreaText("");
            currentHashTag.current = undefined;
        } else {
            return alert("you should enter title and text");
        };
        e.target.reset();
    };

    function trackDivInput(e: any) {
        e.preventDefault();
        const addDivInput = document.getElementById('addDivInput') as HTMLDivElement;
        const findHashTag = addDivInput.textContent?.match(regex);
        updateHashTags(findHashTag);
        currentHashTag.current = findHashTag;
        currentText.current = addDivInput.textContent!;
        updateAreaText(currentText.current);
    }

    function chgFontSize(e: any) {
        e.preventDefault();
        setAddFontSize(+e.target.value);
        const selectedText = window.getSelection();
        const selectedCurrentText = window.getSelection()?.toString() as string;
        const selectRange = selectedText?.getRangeAt(0) as Range;
        spanElement.innerHTML = selectedCurrentText;
        selectRange.getClientRects();
        selectRange.deleteContents()
        spanElement.style.fontSize = e.target.value + "px";
        selectRange.insertNode(spanElement);
    }

    return (
        <>
            <Box>
                <Fade in={checkedAdd}>
                    <form id="form" onSubmit={submitFunc} >
                        <div >
                            Add note:
                        </div>
                        <div style={{ marginTop: "1rem" }}></div>
                        <label >
                            Title:
                            <textarea name="titleinput" id="titleinput" rows={1} style={{ resize: "none", display: "flex", width: "350px" }} value={areaTitle} onChange={trackTitle}></textarea>
                        </label>

                        Text area:
                        <br />
                        <div>
                            <div>
                                <input id='fontSize' type="number" value={addFontSize} style={{ width: "40px", marginBottom: "5px" }} title='Font size' onChange={chgFontSize} />
                            </div>
                            {/* <div id='addPre'></div> */}
                            <div contentEditable={true} id='addDivInput' spellCheck="false" onInput={trackDivInput}></div>
                        </div>
                        <Button variant="contained" color="success" size='small' type='submit'>Add note</Button>
                        <br />
                        <div style={{ width: "350px", wordBreak: "break-word", marginLeft: "3px", borderRadius: "3px", padding: "1px" }}>
                            {currentHashTag.current ? currentHashTag.current.join(" ") : null}
                        </div>
                    </form>
                </Fade>
            </Box >
        </>
    )
}

export default AddNote