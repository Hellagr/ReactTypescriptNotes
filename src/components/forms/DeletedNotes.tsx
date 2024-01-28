import { useDispatch, useSelector } from 'react-redux';
import { Button, Collapse } from '@mui/material';
import { TransitionGroup } from 'react-transition-group';
import parse from 'html-react-parser';

function DeletedNotes() {
    const dispatch = useDispatch();
    const arrDeletedNoteObj = useSelector((state: any) => state.deletedNote[0]);



    // Delete obj permanently
    function deleteNote(event: any) {
        event.preventDefault();
        const idNote: number = +event.target.id;
        dispatch({ type: "DELETE_NOTE_PERMANENTLY", payload: +idNote });
        const request = window.indexedDB.open("Database", 2);
        request.onsuccess = (event: Event) => {
            const db = (event.target as IDBOpenDBRequest).result as IDBDatabase;
            const transactionNotes = db.transaction('deletedNotes', 'readwrite');
            const objectStoreNotes = transactionNotes.objectStore('deletedNotes');
            const getRequestNotes = objectStoreNotes.get(+idNote);
            getRequestNotes.onsuccess = () => {
                objectStoreNotes.delete(+idNote);
            };
        };
        request.onerror = (e) => {
            console.error(`Error: ${e}`);
        };
    };

    return (

        <div>
            <div style={{ marginBottom: "2.25rem" }}>
                Deleted notes:
            </div>
            <TransitionGroup>
                {arrDeletedNoteObj?.map((element: any) =>
                    <Collapse key={element.id}>
                        <div key={element.id} id='topNotes' style={{ borderRadius: "5px" }}>
                            <div id="notes" key={element.id} style={{ backgroundColor: "#cdcdcd", }}>
                                <div>
                                    <div id='deletedData' style={{ display: 'block' }}>
                                        <div>Title: {element?.title}</div>
                                        <div>Text: <br /> {parse(element?.text)}</div>
                                    </div>
                                    <div style={{ fontSize: "10px", height: "15px" }}>
                                        {'Deletion date: ' + element.deletetime}
                                    </div>
                                </div>
                                <div id='buttons'>
                                    <br />
                                    <br />
                                    <br />
                                    <Button id={element.id} onClick={deleteNote} variant="outlined" color='error' style={{ maxWidth: '30px', maxHeight: '30px', minWidth: '30px', minHeight: '30px' }} >x</Button>
                                </div>
                            </div>
                            <div id='hashTag'>
                                {element.hashTag?.map((e: string, index: string) => <span key={index} style={{ marginLeft: "3px", borderRadius: "3px", padding: "1px", wordBreak: "break-word" }}>{e}</span>)}
                            </div>
                        </div>
                    </Collapse>
                )
                }
            </TransitionGroup>
        </div >
    )
}

export default DeletedNotes