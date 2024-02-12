import { MutableRefObject, useState } from 'react'
import { useDispatch } from 'react-redux';
import { addNoteAction } from '../../actions/action';
import { store } from '../../store/store';
import { Button, Fade, MenuItem, OutlinedInput, Select, ToggleButton, ToggleButtonGroup } from '@mui/material';
import Box from '@mui/material/Box';
import { SketchPicker } from 'react-color';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatColorFillIcon from '@mui/icons-material/FormatColorFill';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        },
    },
};

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
    const [addFontSize, setAddFontSize] = useState(20);
    const [color, setColor] = useState<any>("black");
    const spanElement = document.createElement("span");
    const variantsOfFonts = [];
    for (let i = 6; i <= 36; i++) {
        variantsOfFonts.push(<MenuItem key={i} value={i}>{i}</MenuItem>)
    }

    //Add object to store
    function submitFunc(e: any) {
        const addDivInput = document.getElementById('addDivInput') as HTMLDivElement;
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
        addDivInput.textContent = '';
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
        const addDivInput = document.getElementById('addDivInput') as HTMLDivElement;
        e.preventDefault();
        const selectedCurrentText = window.getSelection()?.toString() as string;

        if (e.target.value === 'boldChng' || e.target.viewportElement?.id === "boldChg" || e.target.id === 'boldChg') {
            if (selectedCurrentText === "") {
                document.execCommand('bold');
                addDivInput.focus();
            } else {
                if (selectedCurrentText.length > 0) {
                    document.execCommand('bold');
                }
            }
        }

        if (e.target.value === 'italicsFont' || e.target.viewportElement?.id === "italFont" || e.target.id === 'italFont') {
            if (selectedCurrentText === "") {
                document.execCommand('italic');
                addDivInput.focus();
            } else {
                if (selectedCurrentText.length > 0) {
                    document.execCommand('italic');
                }
            }
        }

        if (e.target.value === 'underlined' || e.target.viewportElement?.id === "under" || e.target.id === 'under') {
            if (selectedCurrentText === "") {
                document.execCommand('underline');
                addDivInput.focus();
            } else {
                if (selectedCurrentText.length > 0) {
                    document.execCommand('underline');
                }
            }
        }

    }

    function chooseColor(e: any) {
        setColor(e.rgb)
        let addDivInput = document.getElementById('addDivInput') as HTMLDivElement;
        const selection = document.getSelection() as Selection;
        const selectedCurrentText = window.getSelection()?.toString() as string;
        const rgbColor = `rgba(${e.rgb.r}, ${e.rgb.g}, ${e.rgb.b}, ${e.rgb.a})`;
        if (selectedCurrentText === "") {
            document.execCommand('foreColor', false, rgbColor);
            addDivInput.focus();
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
        <>
            <Box>
                <Fade in={checkedAdd}>
                    <form id="form" onSubmit={submitFunc}>
                        <div id='afterAdd' style={{ marginTop: "1rem" }}></div>
                        <label >
                            Title:
                            <textarea name="titleinput" id="titleinput" rows={1} value={areaTitle} onChange={trackTitle}></textarea>
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
                            <div contentEditable={true} id='addDivInput' spellCheck="false" onClick={selection} onInput={trackDivInput}></div>
                        </div>
                        <Button className='buttonsMaterial' variant="contained" color="success" size='small' type='submit'>Add note</Button>
                        <div style={{ display: 'flex' }}>
                            <div id='hiddenAdd'>
                                <Button className='hiddenAdd' variant="contained" color="success" size='small' type='submit'>ADD</Button>
                            </div>
                            <div id='onlineTagsAddHiiden' style={{ width: "227px", wordBreak: "break-word", marginLeft: "3px", borderRadius: "3px", paddingLeft: "5px" }}>
                                {currentHashTag.current ? currentHashTag.current.join(" ") : null}
                            </div>
                        </div>

                        <div id='onlineTagsAdd' style={{ width: "350px", wordBreak: "break-word", marginLeft: "3px", borderRadius: "3px", padding: "1px" }}>
                            {currentHashTag.current ? currentHashTag.current.join(" ") : null}
                        </div>
                    </form>
                </Fade>
            </Box >
        </>
    )
}

export default AddNote