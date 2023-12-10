import React, { useRef } from 'react';
import './Input.css'

export default function Input() {

    let onChange = {};

    let dataText = useRef("");


    function handlerFunc(e: any) {
        e.preventDefault();
        console.log(e)
    }

    return (
        <div>
            <form action='#' method='POST' onSubmit={handlerFunc}>
                <textarea name="textinput" id="textinput" cols={50} rows={10} style={{ resize: "none", display: 'flex' }} onChange={dataText}></textarea>
                {/* <input type="text" /> */}
                <button type='submit'>Submit</button>
            </form>
        </div>
    );
}

