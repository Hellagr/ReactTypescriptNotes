import { useRef, useState } from 'react'
import AddNote from './forms/AddNote';
import EditNote from './forms/EditNote';
import AllNotes from './forms/AllNotes';
import { Grid } from '@mui/material';
import DeletedNotes from './forms/DeletedNotes';

function AppLogic() {

    const regex = /#\w+/g;
    const currentTitle = useRef<string>("");
    const currentText = useRef<string>("");

    const currentHashTag = useRef<string[] | null | undefined>();
    const currentNoteId = useRef(0);

    const [areaTitle, setAreaTitle] = useState<string>();
    const updateAreaTitle = (update: string) => {
        setAreaTitle(update);
    }
    const [areaText, setAreaText] = useState<string>();
    const updateAreaText = (update: string) => {
        setAreaText(update);
    }
    const [hashTags, setHashTags] = useState<string[] | null | undefined>();
    const updateHashTags = (update: string[] | null | undefined) => {
        setHashTags(update);
    }
    const [checked, setChecked] = useState<boolean>(false);
    const updateChecked = (update: any) => {
        setChecked(update);
    }

    //Check existence of database
    if (!('indexedDB' in window)) {
        alert("This browser doesn't support IndexedDB");
    }
    //Open database 
    const request = window.indexedDB.open("Database", 2);
    request.onerror = (e) => {
        console.error(`Error: ${e}`);
    };
    request.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        db.createObjectStore("notes");
    }

    //trackers for main form
    function trackTitle(e: any) {
        currentTitle.current = e.target.value;
        setAreaTitle(currentTitle.current)
    }

    return (
        <div className="App">
            <header className="App-header">
                <Grid container spacing={2}>
                    <Grid item lg={4} md={6} sm={12} xs={12} style={{ display: 'flex', justifyContent: 'center' }}>
                        <AddNote hashTags={hashTags} currentTitle={currentTitle} updateHashTags={updateHashTags} updateAreaTitle={updateAreaTitle} updateAreaText={updateAreaText} currentHashTag={currentHashTag} areaTitle={areaTitle} trackTitle={trackTitle} areaText={areaText} currentText={currentText} regex={regex} />
                        <EditNote currentTitle={currentTitle} updateHashTags={updateHashTags} updateAreaTitle={updateAreaTitle} updateAreaText={updateAreaText} currentHashTag={currentHashTag} areaTitle={areaTitle} trackTitle={trackTitle} currentText={currentText} regex={regex} currentNoteId={currentNoteId} checked={checked} updateChecked={updateChecked} areaText={areaText} />
                    </Grid>
                    <Grid item lg={4} md={6} sm={12} xs={12} style={{ display: 'flex', justifyContent: 'center' }}>
                        <AllNotes currentTitle={currentTitle} updateHashTags={updateHashTags} updateAreaTitle={updateAreaTitle} currentHashTag={currentHashTag} currentText={currentText} regex={regex} currentNoteId={currentNoteId} updateChecked={updateChecked} />
                    </Grid>
                    <Grid item lg={4} md={12} sm={12} xs={12} style={{ display: 'flex', justifyContent: 'center' }}>
                        <DeletedNotes />
                    </Grid>
                </Grid>
            </header>
        </div>
    )
}

export default AppLogic;