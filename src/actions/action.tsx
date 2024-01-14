const ADD_NOTE = "ADD_NOTE";
const UPDATE_NOTE = "UPDATE_NOTE";

export function addNoteAction(title: any, text: any, hashTag?: any) {
    return {
        type: ADD_NOTE,
        payload: {
            id: Date.now(),
            title,
            text,
            hashTag
        }
    }
}

export function updateNoteAction(id: number, title: any, text: any, hashTag?: any) {
    return {
        type: UPDATE_NOTE,
        payload: {
            id,
            title,
            text,
            hashTag
        }
    }
}

