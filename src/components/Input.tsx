import React, { useRef, useState } from 'react';
import './Input.css'

export default function Input(props: any) {

    let currentData: string;
    let dataText = useRef("");
    const [notes, setNotes] = useState("");

    function submitNote(e: any) {
        e.preventDefault();
        currentData = dataText.current;
        setNotes(currentData);
        e.target.reset()
    }

    function trackerDataarea(event: React.ChangeEvent<HTMLTextAreaElement>) {
        dataText.current = event.target.value;
    }

    props.GetDataFromChild(notes);

    return (
        <div>
            <form onSubmit={submitNote} ref={form => form}>
                <textarea name="textinput" id="textinput" cols={50} rows={10} style={{ resize: "none", display: 'flex' }} onChange={trackerDataarea}></textarea>
                <button type='submit'>Submit</button>
            </form>
        </div>
    );
}

