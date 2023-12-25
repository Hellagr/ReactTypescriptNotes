const ADD_NOTE = "ADD_NOTE";

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

