import React, { useRef, useState } from 'react'
import AddNote from './forms/AddNote';
import EditNote from './forms/EditNote';
import AllNotes from './forms/AllNotes';
import { Grid } from '@mui/material';
import DeletedNotes from './forms/DeletedNotes';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimeField } from '@mui/x-date-pickers-pro';
import dayjs, { Dayjs } from 'dayjs';

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

    const [checkedAdd, setCheckedAdd] = useState<boolean>(true);
    const updateCheckedAdd = (update: any) => {
        setCheckedAdd(update);
    }

    const [value, setValue] = React.useState<Dayjs | null>(dayjs());


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
            <div className="App-header">
                <Grid container spacing={2} >
                    <Grid item lg={4} md={6} sm={12} xs={12} >
                        <AddNote hashTags={hashTags} currentTitle={currentTitle} updateHashTags={updateHashTags} updateAreaTitle={updateAreaTitle} updateAreaText={updateAreaText} currentHashTag={currentHashTag} areaTitle={areaTitle} trackTitle={trackTitle} areaText={areaText} currentText={currentText} regex={regex} checkedAdd={checkedAdd} />
                        <EditNote currentTitle={currentTitle} updateHashTags={updateHashTags} updateAreaTitle={updateAreaTitle} updateAreaText={updateAreaText} currentHashTag={currentHashTag} areaTitle={areaTitle} trackTitle={trackTitle} currentText={currentText} regex={regex} currentNoteId={currentNoteId} checked={checked} updateChecked={updateChecked} areaText={areaText} updateCheckedAdd={updateCheckedAdd} />
                        <div style={{ display: 'flex', marginTop: '1rem' }}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DateTimeField
                                    label="Date and time"
                                    value={value}
                                    onChange={(newValue) => setValue(newValue)}
                                    format="LLLL hh:mm"
                                    style={{ display: 'flex', justifyContent: 'center', width: '357px' }}
                                />
                            </LocalizationProvider>
                        </div>
                    </Grid>
                    <Grid item lg={4} md={6} sm={12} xs={12} style={{ display: 'grid', justifyContent: 'center' }}>
                        <AllNotes currentTitle={currentTitle} updateHashTags={updateHashTags} updateAreaTitle={updateAreaTitle} currentHashTag={currentHashTag} currentText={currentText} regex={regex} currentNoteId={currentNoteId} updateChecked={updateChecked} updateCheckedAdd={updateCheckedAdd} />
                    </Grid>
                    <Grid item lg={4} md={12} sm={12} xs={12} style={{ display: 'grid', justifyContent: 'center' }}>
                        <DeletedNotes />
                    </Grid>
                </Grid>
            </div>
        </div>
    )
}

export default AppLogic;