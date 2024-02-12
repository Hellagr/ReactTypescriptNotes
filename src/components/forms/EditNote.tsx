import { MutableRefObject, useState } from 'react';
import { updateNoteAction } from '../../actions/action';
import { useDispatch } from 'react-redux';
import { Button, MenuItem, OutlinedInput, Select, ToggleButtonGroup } from '@mui/material';
import Fade from '@mui/material/Fade';
import Box from '@mui/material/Box';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatColorFillIcon from '@mui/icons-material/FormatColorFill';
import ToggleButton from '@mui/material/ToggleButton';
import React from 'react';
import { SketchPicker } from 'react-color';



const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        },
    },
};

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
    const [addFontSize, setAddFontSize] = useState(20);
    const [color, setColor] = useState<any>("black");
    const spanElement = document.createElement("span");
    const variantsOfFonts = [];
    for (let i = 6; i <= 36; i++) {
        variantsOfFonts.push(<MenuItem key={i} value={i}>{i}</MenuItem>)
    }

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
            // console.error(`Error: ${e}`);
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



    //23523523423 days lost (needs rework)
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

        // if (e.nativeEvent.data === null || e.nativeEvent.data === ' ') {
        //     currentText.current = divInput.innerHTML;
        //     return;
        // } else {
        //     let selection: Selection = document.getSelection() as Selection;
        //     for (let i = divInput.childNodes.length; i > 0; i--) {
        //         selection.modify('extend', "backward", "line");
        //     }
        //     const modifyDiv = currentText.current;
        //     selection.deleteFromDocument();
        //     divInput.insertAdjacentHTML('afterbegin', modifyDiv);
        //     for (let i = divInput.childNodes.length; i > 0; i--) {
        //         selection.deleteFromDocument();
        //         selection.modify('extend', "forward", "line");

        //     }

        // }
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

    function selection() {
        let selection = document.getSelection() as Selection;
        let range = selection.getRangeAt(0) as Range;
        spanElement.style.fontSize = addFontSize.toString() + "px";
        const rgbColor = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
        spanElement.style.color = rgbColor;
        if (range.toString() === "") {
            range.insertNode(spanElement);
            range.selectNodeContents(spanElement);
        }
    }


    function chgFontSize(e: any) {
        e.preventDefault();
        setAddFontSize(+e.target.value);
    }

    function chgStyle(e: any) {
        const divInput = document.getElementById('divInput') as HTMLDivElement;
        e.preventDefault();
        const selectedCurrentText = window.getSelection()?.toString() as string;

        if (e.target.value === 'boldChng' || e.target.viewportElement?.id === "boldChg" || e.target.id === 'boldChg') {
            if (selectedCurrentText === "") {
                document.execCommand('bold');
                divInput.focus();
            } else {
                if (selectedCurrentText.length > 0) {
                    document.execCommand('bold');
                }
            }
        }

        if (e.target.value === 'italicsFont' || e.target.viewportElement?.id === "italFont" || e.target.id === 'italFont') {
            if (selectedCurrentText === "") {
                document.execCommand('italic');
                divInput.focus();
            } else {
                if (selectedCurrentText.length > 0) {
                    document.execCommand('italic');
                }
            }
        }

        if (e.target.value === 'underlined' || e.target.viewportElement?.id === "under" || e.target.id === 'under') {
            if (selectedCurrentText === "") {
                document.execCommand('underline');
                divInput.focus();
            } else {
                if (selectedCurrentText.length > 0) {
                    document.execCommand('underline');
                }
            }
        }

    }

    function chooseColor(e: any) {
        setColor(e.rgb)
        let divInput = document.getElementById('divInput') as HTMLDivElement;
        const selection = document.getSelection() as Selection;
        const selectedCurrentText = window.getSelection()?.toString() as string;
        const rgbColor = `rgba(${e.rgb.r}, ${e.rgb.g}, ${e.rgb.b}, ${e.rgb.a})`;
        if (selectedCurrentText === "") {
            document.execCommand('foreColor', false, rgbColor);
            divInput.focus();
            selection.removeAllRanges();
        } else {
            if (selectedCurrentText.length > 0) {
                document.execCommand('foreColor', false, rgbColor);
            }
        }
    }

    function visibleColorPicker() {
        const colorPicker = document.getElementById('colorPicker') as HTMLElement;
        colorPicker.style.display === "" ? colorPicker.style.display = "flex" : colorPicker.style.display = "";
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

                    Text:
                    <br />
                    <div>
                        <div>
                            <ToggleButtonGroup
                                aria-label="text formatting"
                                size='small'
                            >

                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={addFontSize}
                                    label="Age"
                                    onChange={chgFontSize}
                                    size='small'
                                    MenuProps={MenuProps}
                                    input={<OutlinedInput label="Font size" />}
                                >
                                    {variantsOfFonts}
                                </Select>
                                <ToggleButton value="boldChng" aria-label="bold" onClick={chgStyle} >
                                    <FormatBoldIcon id="boldChg" onClick={() => chgStyle} />
                                </ToggleButton>
                                <ToggleButton value="italicsFont" aria-label="italic" onClick={chgStyle}>
                                    <FormatItalicIcon id="italFont" onClick={() => chgStyle} />
                                </ToggleButton>
                                <ToggleButton value="underlined" aria-label="underlined" onClick={chgStyle}>
                                    <FormatUnderlinedIcon id="under" onClick={() => chgStyle} />
                                </ToggleButton>
                                <ToggleButton value="color" aria-label="color" onClick={visibleColorPicker}>
                                    <FormatColorFillIcon />
                                </ToggleButton>
                            </ToggleButtonGroup>
                            <div id='colorPicker'>
                                <SketchPicker onChange={chooseColor} color={color} />
                            </div>
                        </div>
                    </div>
                    <div contentEditable={true} id='divInput' onInput={trackDivInput} spellCheck="false" onClick={selection} defaultValue={currentText.current}>
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

export default EditNote;