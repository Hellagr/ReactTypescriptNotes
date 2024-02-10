import React, { useRef, useState } from 'react'
import AddNote from './forms/AddNote';
import EditNote from './forms/EditNote';
import AllNotes from './forms/AllNotes';
import DeletedNotes from './forms/DeletedNotes';
import Clock from 'react-live-clock';

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
                <div>
                    <div>
                        <div id='clock'>
                            <Clock
                                ticking={true}
                                format={'MMMM Mo | dddd '} />
                            <Clock
                                ticking={true}
                                format={'h:mm:ss A'} />
                        </div>
                    </div>
                    <AddNote hashTags={hashTags} currentTitle={currentTitle} updateHashTags={updateHashTags} updateAreaTitle={updateAreaTitle} updateAreaText={updateAreaText} currentHashTag={currentHashTag} areaTitle={areaTitle} trackTitle={trackTitle} areaText={areaText} currentText={currentText} regex={regex} checkedAdd={checkedAdd} />
                    <EditNote currentTitle={currentTitle} updateHashTags={updateHashTags} updateAreaTitle={updateAreaTitle} updateAreaText={updateAreaText} currentHashTag={currentHashTag} areaTitle={areaTitle} trackTitle={trackTitle} currentText={currentText} regex={regex} currentNoteId={currentNoteId} checked={checked} updateChecked={updateChecked} areaText={areaText} updateCheckedAdd={updateCheckedAdd} />
                    <div id='formobile'>
                        <div id='allForMobile'>
                            <AllNotes currentTitle={currentTitle} updateHashTags={updateHashTags} updateAreaTitle={updateAreaTitle} currentHashTag={currentHashTag} currentText={currentText} regex={regex} currentNoteId={currentNoteId} updateChecked={updateChecked} updateCheckedAdd={updateCheckedAdd} />
                        </div>
                        <div id='line3'></div>
                        <div id='allDeletedNotesForTablet'>
                            <DeletedNotes />
                        </div>
                    </div>
                </div>
                <div id='line'></div>
                <div id='allNotesForPC'>
                    <AllNotes currentTitle={currentTitle} updateHashTags={updateHashTags} updateAreaTitle={updateAreaTitle} currentHashTag={currentHashTag} currentText={currentText} regex={regex} currentNoteId={currentNoteId} updateChecked={updateChecked} updateCheckedAdd={updateCheckedAdd} />
                </div>
                <div id='line2'></div>
                <div id='allDeletedNotes'>
                    <DeletedNotes />
                </div>
            </div>
        </div>
    )
}

export default AppLogic;