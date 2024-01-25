import { MutableRefObject } from 'react'
import { useDispatch } from 'react-redux';
import { addNoteAction } from '../../actions/action';
import { store } from '../../store/store';
import { Button } from '@mui/material';
import Box from '@mui/material/Box';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers-pro';
import Clock from 'react-live-clock';

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

    // function toggleForm() {
    //     setChecked((prev) => !prev);
    //     const form = document.getElementById("form") as HTMLFormElement;
    //     const addButton = document.getElementById('addButton') as HTMLButtonElement;
    //     addButton.style.display === "none" ? addButton.style.display = "flex" : addButton.style.display = "none";
    //     form.style.display === "none" ? form.style.display = "block" : form.style.display = "none";
    //     updateAreaTitle("");
    //     updateAreaText("");
    //     currentHashTag.current = [];
    // }

    return (
        <>
            {/* <Button variant="contained" color="success" id='addButton' size='small' startIcon={<AddIcon />} onClick={toggleForm} style={{ marginRight: "20px", }}>Add note</Button> */}
            <Box>
                <form id="form" onSubmit={submitFunc} >
                    <div >
                        Add note:
                    </div>
                    <div style={{ marginTop: "1rem" }}></div>
                    <label >
                        Title:
                        <textarea name="titleinput" id="titleinput" rows={1} style={{ resize: "none", display: "flex", width: "350px" }} value={areaTitle} onChange={trackTitle}></textarea>
                    </label>
                    <label>
                        Text area:
                        <textarea name="textinput" id="textinput" rows={10} style={{ resize: "none", display: "flex", width: "350px" }} value={areaText} onChange={trackText}></textarea>
                        <Button variant="contained" color="success" size='small' type='submit'>Add note</Button>
                        {/* <Button variant="contained" color="warning" size='small' id='cancelButton' onClick={toggleForm}>Cancel</Button> */}
                    </label>
                    <br />
                    <div style={{ width: "350px", wordBreak: "break-word", marginLeft: "3px", borderRadius: "3px", padding: "1px" }}>
                        {currentHashTag.current ? currentHashTag.current.join(" ") : null}
                    </div>
                </form>
                <div style={{ marginTop: "10px", justifyContent: "center", display: "flex", fontSize: 30, border: "2px gray solid", borderRadius: "5px" }}>
                    <Clock format="HH:mm:ss" interval={1000} ticking={true} />
                </div>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateCalendar showDaysOutsideCurrentMonth fixedWeekNumber={6} />
                </LocalizationProvider>
            </Box >
        </>
    )
}

export default AddNote