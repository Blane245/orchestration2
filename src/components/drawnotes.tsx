import { useEffect } from 'react';
import { Accidental, Formatter, Renderer, Stave, StaveNote, Voice } from 'vexflow';
import { DisplayOption, KEYBOARD, KeySignature, KEYSIGNATURES, Mode, Pitch, Scale, VXInstrument } from '../types/types';
import { getNoteName, transposeKey, transposeNote } from '../utils/vxutils';

// using VexFlow, draw the notes requested
export interface DrawNotesProps {
    scale: Scale,
    mode: Mode,
    instrument: VXInstrument,
    pitch: Pitch,
    keySignature: KeySignature,
    displayOption: DisplayOption,
    setMessage: Function,
    width: number,
    height: number,
    setNotes: Function,
}

//folloing example at https://github.com/0xfe/vexflow/wiki/Tutorial 
export function DrawNotes(props: DrawNotesProps) {
    const { scale, mode, instrument, pitch, keySignature, displayOption, width, height, setNotes } = props;

    // when any of the parameters changes, regenerate the note display
    useEffect(() => {
        const div = document.getElementById('score');
        if (div) {
            div.innerHTML = "";
            const renderer = new Renderer(div as HTMLDivElement, Renderer.Backends.SVG);
            renderer.resize(width, height);
            const context = renderer.getContext();

            // setup stave based on the instrument's clef, the selected key signature
            //  and the instrument's clef annotation
            const stave: Stave = new Stave(10, 100, width-20);
            stave.addClef(instrument.clef.name, undefined, instrument.clef.annotation);
            const thisSignature: string = (pitch.name == 'Concert'? keySignature.rootKeyName: transposeKey(keySignature, instrument).name);
            stave.addKeySignature(thisSignature);
            stave.setContext(context).draw();

            // get the notes for the instrument
            const notes: StaveNote[] = getInstrumentNotes();
            setNotes(notes);

            // build the voice from the notes provided
            const voice = new Voice({ num_beats: notes.length, beat_value: 4 })
            voice.addTickables(notes)
            new Formatter().joinVoices([voice]).format([voice]/*, 350 */);
            voice.setContext(context);
            voice.setStave(stave);
            voice.draw();
        }

    }, [scale, mode, instrument, pitch, keySignature, width, height, displayOption])

    return (
        <>
            <div id='score'/>
        </>
    )

    // helper functions

    // get a full keyboard of accidantals based on the key signature
    function generateAccidentals(size: number, accidentals:string) :string {
        let result:string = '';
        for (let i = 0; i < size; i++) {
            const index = i % 8;
            const acc = accidentals.substring(index, index+1);
            result = result.concat(acc);
        }
        return result;
    }

    // get the stave notes for the instrument including any modifiers
    // modifiers appear on teh harmoni and melodic minor keys
    function getInstrumentNotes(): StaveNote[] {

        const notes: StaveNote[] = []; // what will be returned
        const lowNote: number = instrument.lowNote; // lowest note that the instrument can perform
        const highNote: number = instrument.highNote; // the highest note the instrument can perform
        let includedNotes: number[] = []; // this will be set based on the key signature and scale
        let currentAccidentals = generateAccidentals(KEYBOARD.length, keySignature.accidentals);
        let modifier: string = ''; // the current note modifier
        if (displayOption.includes('Ascending')) {

            // ascending sequence - get the included notes based on key, scale, mode, pitch
            includedNotes = getIncludedNotes('Ascending');

            // start the ascending sequence at the fist included note above the instrument's lowest
            // and continue to the instrument's highest
            for (let i = lowNote + includedNotes[0] + mode.nominal; i <= highNote; i++) {

                // only added a note if its nominal value is in the included list
                const nominalValue = i % 12
                if (includedNotes.find((value) => value % 12 == nominalValue) != undefined) {

                    // get the note's name based on where the key signature has sharp, flat, or no accidentals
                    let noteName: string = getNoteName(keySignature.keyAccidental, KEYBOARD[i]);
                    if (pitch.name == 'instrument') noteName = transposeNote (noteName, KEYSIGNATURES[0], instrument.instrumentPitch);

                    // get the note's modifier and track the current accidentals
                    [modifier, currentAccidentals] = getModifier(noteName, currentAccidentals)

                    // add the stave note and inclued a modifer, if present
                    const staveNote: StaveNote = new StaveNote({ keys: [noteName], duration: 'q', clef: instrument.clef.name })
                    if (modifier != '')
                        staveNote.addModifier(new Accidental(modifier));
                    staveNote.setStyle({fillStyle: 'black'});
                    console.log(staveNote.getStyle());

                    notes.push(staveNote)
                }
            }
        }
        if (displayOption.includes('Descending')) {

            // descending sequence - get the included notes based on key, scale, mode, pitch
            includedNotes = getIncludedNotes('Descending');

            // add all of the notes from the instrument's highest to the first included note above the lowest 
            for (let i = highNote; i >= lowNote + includedNotes[0] + mode.nominal; i--) {

                // only added a note if its nominal value is in the included list
                const nominalValue = i % 12
                if (includedNotes.find((value) => value % 12 == nominalValue) != undefined) {

                    // get the note's name based on where the key signature has sharp, flat, or no accidentals
                    const noteName = getNoteName(keySignature.keyAccidental, KEYBOARD[i]);

                    // get the note's modifier and track the current accidentals
                    [modifier, currentAccidentals] = getModifier(noteName, currentAccidentals)

                    // add the stave note and inclued a modifer, if present
                    const staveNote: StaveNote = new StaveNote({ keys: [noteName], duration: 'q', clef: instrument.clef.name })
                    if (modifier != '')
                        staveNote.addModifier(new Accidental(modifier));
                    staveNote.setStyle({fillStyle:'black'});
                    console.log(staveNote.getStyle());
                    notes.push(staveNote)
                }
            }
        }
        return notes;

    }

    // helper for modifying currentAccidentals in getModifier
    function replaceAt(input: string, index: number, replacement: string): string {
        return input.substring(0, index) + replacement + input.substring(index + replacement.length)
    }

    // return a natural sharp or flat modifier and update the current accidentals
    // depending on the note's current modifier and the current accidentals
    function getModifier(noteName: string, accidentals: string): [string, string] {
        const allowedNotes: string = 'CDEFGAB' // the breath of possible note names
        const noteNamePieces: string[] = noteName.split('/'); // the full note name and octave
        const baseNoteModifier = noteNamePieces[0].substring(1, 2); // get current modifier
        const octave:number = parseInt(noteNamePieces[1]);
        const nameIndex = allowedNotes.indexOf(noteNamePieces[0].substring(0, 1)) + octave * 8; // the location of the note in the list of accidentals
        let currentAccidentals: string = accidentals; // the accidentals to be changes
        let modifier: string = '';
        switch (currentAccidentals[nameIndex]) {
            case 'n':
                switch (baseNoteModifier) {
                    case '':
                        break;
                    case '#':
                        modifier = '#'
                        currentAccidentals = replaceAt(currentAccidentals, nameIndex, '#')
                        break;
                    case 'b':
                        modifier = 'b'
                        currentAccidentals = replaceAt(currentAccidentals, nameIndex, 'b')
                        break;
                    default:
                        break;
                }
                break;
            case '#':
                switch (baseNoteModifier) {
                    case '#':
                        break;
                    case '':
                        modifier = 'n'
                        currentAccidentals = replaceAt(currentAccidentals, nameIndex, 'n')
                        break;
                    case 'b':
                        modifier = 'b'
                        currentAccidentals = replaceAt(currentAccidentals, nameIndex, 'b')
                        break;
                    default:
                        break;
                }
                break;
            case 'b':
                switch (baseNoteModifier) {
                    case 'b':
                        break;
                    case '#':
                        modifier = '#'
                        currentAccidentals = replaceAt(currentAccidentals, nameIndex, '#')
                        break;
                    case '':
                        modifier = 'n'
                        currentAccidentals = replaceAt(currentAccidentals, nameIndex, 'n')
                        break;
                    default:
                        break;
                }
                break;
            default:
                break;
        }
        return [modifier, currentAccidentals]

    }

    // get the included notes based on key, scale, pitch
    // currently only all keys, and the diatonic scale are implemented
    function getIncludedNotes(direction: string): number[] {

        if (scale.name == 'Diatonic')
            if (direction == 'Ascending')
                return keySignature.ascendingValues;
            else
                return keySignature.descendingValues;

        // not quite complete - need to descrimate
        // between major and minor pentatonic, thirds, fourths, fifths
        return scale.nominalSequence;
    }
}
