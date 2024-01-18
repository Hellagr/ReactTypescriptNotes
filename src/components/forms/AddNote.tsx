import { MutableRefObject, useState } from 'react'
import { useDispatch } from 'react-redux';
import { addNoteAction } from '../../actions/action';
import { store } from '../../store/store';
import { Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import Fade from '@mui/material/Fade';
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
}

function AddNote({ regex, hashTags, currentTitle, currentText, currentHashTag, updateHashTags, areaTitle, updateAreaTitle, areaText, updateAreaText, trackTitle }: AddNoteProps) {

    const [checked, setChecked] = useState<boolean>(false);
    const dispatch = useDispatch();


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
            updateAreaTitle("");
            updateAreaText("");
            currentHashTag.current = undefined;
        } else {
            return alert("you should enter title and text");
        };
    };

    function trackText(e: any) {
        currentText.current = e.target.value;
        updateAreaText(currentText.current);
        const findHashTag = currentText.current?.match(regex);
        updateHashTags(findHashTag);
        currentHashTag.current = findHashTag;
    }

    function toggleForm() {
        setChecked((prev) => !prev);
        const form = document.getElementById("form") as HTMLFormElement;
        const addButton = document.getElementById('addButton') as HTMLButtonElement;
        addButton.style.display === "none" ? addButton.style.display = "flex" : addButton.style.display = "none";
        form.style.display === "none" ? form.style.display = "block" : form.style.display = "none";
        updateAreaTitle("");
        updateAreaText("");
        currentHashTag.current = [];
    }

    return (
        <>
            <Button variant="contained" color="success" id='addButton' size='small' startIcon={<AddIcon />} onClick={toggleForm} style={{ marginRight: "20px", }}>Add note</Button>
            <Box>
                <Fade in={checked}>
                    <form id="form" onSubmit={submitFunc} style={{ display: 'none', paddingTop: '50px' }}>
                        <label>
                            Title:
                            <textarea name="titleinput" id="titleinput" cols={50} rows={1} style={{ resize: "none", display: 'flex', }} value={areaTitle} onChange={trackTitle}></textarea>
                        </label>
                        <label>
                            Text area:
                            <textarea name="textinput" id="textinput" cols={50} rows={10} style={{ resize: "none", display: 'flex', }} value={areaText} onChange={trackText}></textarea>
                            <Button variant="contained" color="success" size='small' type='submit'>Submit</Button>
                            <Button variant="contained" color="warning" size='small' id='cancelButton' onClick={toggleForm}>Cancel</Button>
                        </label>
                        <br />
                        {currentHashTag.current ? currentHashTag.current : null}
                    </form>
                </Fade>
            </Box>
        </>
    )
}

export default AddNote