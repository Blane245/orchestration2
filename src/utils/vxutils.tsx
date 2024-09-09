import { ACCIDENTAL, BaseNote, KEYBOARD, KeySignature, KEYSIGNATURES, VXInstrument} from "../types/types";

// get the note name based on the key signature's accidental
export function getNoteName(keyAccidental: ACCIDENTAL, thisNote: BaseNote): string {
    let noteName: string = 'C/4';
    switch (keyAccidental) {
        case ACCIDENTAL.none:
            if (thisNote.naturalName) noteName = thisNote.naturalName;
            else noteName = thisNote.sharpName as string;
            break;
        case ACCIDENTAL.flat:
            if (thisNote.flatName) noteName = thisNote.flatName;
            else noteName = thisNote.naturalName as string;
            break;
        case ACCIDENTAL.sharp:
            if (thisNote.sharpName) noteName = thisNote.sharpName;
            else noteName = thisNote.naturalName as string;
            break;
        default:
            break;
    }
    return noteName;
}


// transpose a note from one key signature to anouther
export function transposeNote(note: string, fromKey: KeySignature, toKey: KeySignature): string {

    // get the number of semitones between the from key to the to key
    const semiTones = toKey.ascendingValues[0] - fromKey.ascendingValues[0]

    // get the note parts
    // get the basenote
    const baseIndex: number = KEYBOARD.findIndex((b) => {
        if (b.naturalName != undefined && b.naturalName == note) return true;
        if (b.flatName != undefined && b.naturalName == note) return true;
        if (b.sharpName != undefined && b.sharpName == note) return true;
        return false;
    })

    // return the original note if not found
    if (baseIndex == -1) return note;

    const newIndex = baseIndex + semiTones;
    if (newIndex < 0 || newIndex > KEYBOARD.length - 1) return note;

    // get the new note name depending on the tosignature accidentals
    const newNote = getNoteName(toKey.keyAccidental, KEYBOARD[newIndex]);
    return newNote;
}

// transpose the key signature from that selected to the instruments key
export function transposeKey (fromKey: KeySignature, instrument: VXInstrument): KeySignature {
    const newKeyName:string = transposeNote (fromKey.rootKeyName+'/0', KEYSIGNATURES[0], instrument.instrumentPitch);
    const keyParts: string[] = newKeyName.split('/');
    const newKey: KeySignature | undefined = KEYSIGNATURES.find((k) => (k.name == keyParts[0]));
    if (newKey == undefined) return fromKey;
    return newKey;
}