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
        <div >
            <div id='deletedNotesLabel'>
                Deleted notes:
                <div style={{ height: '15px' }}></div>
            </div>
            <div>
                <TransitionGroup>
                    {arrDeletedNoteObj?.map((element: any) =>
                        <Collapse key={element.id}>
                            <div key={element.id} id='topNotes' style={{ borderRadius: "5px" }}>
                                <div id="notes" key={element.id} style={{ backgroundColor: "#a39193", }}>
                                    <div>
                                        <div id='deletedData' style={{ display: 'block' }}>
                                            <div><b>{element?.title}</b></div>
                                            <div> {parse(element?.text)}</div>
                                        </div>
                                        <div id='deletedInfo'>
                                            {'Deleted: ' + element.deletetime}
                                        </div>
                                    </div>
                                    <div id='buttons'>
                                        <br />
                                        <br />
                                        <br />
                                        <Button className='deleteButtons' id={element.id} onClick={deleteNote} variant="outlined" color='error' >x</Button>
                                    </div>
                                </div>
                                <div id='hashTag'>
                                    {element.hashTag?.map((e: string, index: string) => <span key={index} style={{ marginLeft: "3px", borderRadius: "3px", padding: "1px", wordBreak: "break-word" }}>{e}</span>)}
                                </div>
                            </div>
                        </Collapse>
                    )
                    }
                    <div id='allNotes'>
                        <div id='noNotes'>{arrDeletedNoteObj?.length === 0 ? "There's no notes" : null}</div>
                    </div>
                </TransitionGroup>
            </div>
        </div >
    )
}

export default DeletedNotes