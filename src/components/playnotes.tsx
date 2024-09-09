// TODO stop button not working
// TODO widgets are too close together
// TODO notes are being played too short
import { Button, Grid, Slider, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { StaveNote } from "vexflow";
import { VXInstrument, Message, KEYSIGNATURES, Pitch } from "../types/types";
import { SoundFont2 } from "soundfont2";
import { loadSoundFont } from "../utils/soundfont";
import { getBufferSourceNodeFromSample, precision, tc2s, toMidi } from "../utils/soundfont2utils";
import { Envelop, Preset } from "../types/soundfonttypes";
import { transposeNote } from "../utils/vxutils";

// may add sound file selector 
export interface PlayNotesProps {
    VXInstrument: VXInstrument,
    notes: StaveNote[],
    pitch: Pitch,
    setMessage: Function,
}

const SOUNDFONTFILE = './src/soundfonts/Symphony.SF2'
// realtime processing constants
const LOOKAHEAD: number = 25.0; // how frequently to call the schedule function (ms)
// this is about 10 times the fastest BPM
const SCHEDULEAHEADTIME = 0.1 // how far ahead to schedule audio (seconds)
const DEFAULTNOTEFILL = 'black'
const HIGHLIGHTNOTEFILL = 'red'

// the mutable variables of this component
let currentNote: number = 0; // the note being played
let nextNoteTime = 0.0; // when the next note is due
let timerID: number = 0; // the timer used to set the schedule 
let sampleSequence: {
    buffer: AudioBufferSourceNode,
    envelop: Envelop,
    noteElement: Element
}[] = [];
let context: AudioContext | undefined = undefined;
let stopRunning: boolean = false;
let currentTempo: number = 60;
let currentVolume: number = 50;
let staveNoteElements: HTMLCollectionOf<Element> = document.getElementsByClassName('');

export default function PlayNotes(props: PlayNotesProps) {
    const [running, setRunning] = useState<boolean>(false);
    const [tempo, setTempo] = useState<number>(60);
    const [volume, setVolume] = useState<number>(50);
    const [presets, setPresets] = useState<Preset[]>([]);
    const { notes, pitch, VXInstrument, setMessage } = props;

    // load the soundfont file when initializing
    //TODO deconflict Preset interface 
    useEffect(() => {
        loadSoundFont(SOUNDFONTFILE, getSoundFont);
        function getSoundFont(sf: SoundFont2) {
            if (sf != undefined) {
                const thesePresets: Preset[] = [];
                for (let i = 0; i < sf.presets.length; i++) {
                    // only load presets that have one zone (a single instrument)
                    if (sf.presets[i].zones.length == 1)
                        thesePresets.push(sf.presets[i] as Preset);
                    console.log(`loaded preset for ${sf.presets[i].header.name} at ${i}`);
                }
                setPresets(thesePresets);
            }
        }
    }, []);

    // turn playing on and off when start/stop button clicked
    // for now, we will start at the begining every time the start button is pressed
    // when the last note is hit, a stop is simulated
    useEffect(() => {

        // wait for the everthing to be ready
        if (presets == undefined || presets.length == 0 || VXInstrument == undefined)
            return;

        // the business end of note playing
        if (running) {
            const preset: Preset | undefined = presets.find((p) => p.header.name == VXInstrument.presetName);
            if (preset == undefined) {
                setMessage({ error: true, text: `no soundfont for ${VXInstrument.name}` });
                return;
            } else {
                context = new AudioContext();
                // setup the note sequencing
                const { sources, message } = setupNoteSequence(preset, context, notes, VXInstrument, pitch);
                if (message.error) {
                    setMessage(message);
                } else {
                    currentNote = 0;
                    nextNoteTime = 0.0
                    sampleSequence = sources;
                    stopRunning = false;
                    scheduler();
                }
            }
        } else {
            // handle stopping
            if (context != undefined) {
                context.close();
                context = undefined;
            }
        }

    }, [running, presets, notes, VXInstrument]);

    return (
        <>
            <Grid item xs={4}>
                <Button
                    onClick={() => { if (running) stopRunning = true; setRunning(!running) }}
                    disabled={presets == undefined || presets.length == 0 || VXInstrument == undefined}
                >
                    {running ? 'Stop' : 'Start'}
                </Button>
            </Grid>
            <Grid item xs={4}>
                <Typography id='speed-slider' gutterBottom>
                    BPM: {tempo}
                </Typography>
                <Slider
                    aria-label='BPM'
                    value={tempo}
                    valueLabelDisplay='auto'
                    min={40}
                    max={220}
                    onChange={(_, value) => { currentTempo = value as number; setTempo(value as number) }}
                    disabled={presets == undefined || presets.length == 0 || VXInstrument == undefined}
                />
            </Grid>
            <Grid item xs={4}>
                <Typography id='volume-slider' gutterBottom>
                    Volume: {volume}
                </Typography>
                <Slider
                    aria-label='Volume'
                    value={volume}
                    valueLabelDisplay='auto'
                    min={0}
                    max={100}
                    onChange={(_, value) => { currentVolume = value as number; setVolume(value as number) }}
                    disabled={presets == undefined || presets.length == 0 || VXInstrument == undefined}
                />
            </Grid>
        </>
    )

    // helper functions and variables

    // set up the note sequence when the soundfont, the notes, the instrument, or the context changes
    // this pokes at the soundfont for the named instrument and stavenote name to 
    // get the sample
    // the volume setting is applied to the gain
    // when mature, this will have attack, sustain, and decay 
    function setupNoteSequence(preset: Preset, context: AudioContext, notes: StaveNote[], instrument: VXInstrument, pitch: Pitch): {
        sources: {
            buffer: AudioBufferSourceNode,
            envelop: Envelop,
            noteElement: Element
        }[],
        message: Message
    } {
        // get all of the stavenote components from the HTML
        staveNoteElements = document.getElementsByClassName("vf-stavenote");

        // get all of the notes for the preset into an array
        const result: { buffer: AudioBufferSourceNode, envelop: Envelop, noteElement: Element }[] = [];
        let message: Message = { error: false, text: '' };
        notes.every((note, index) => {
            let noteName = note.keys[0];
            if (pitch.name == 'instrument') noteName = transposeNote (noteName, instrument.instrumentPitch, KEYSIGNATURES[0]);
            const midi: number | undefined = toMidi(noteName);
            if (midi == undefined) {
                message = { error: true, text: `Note ${noteName} has no midi number.` };
                return false;
            }
            // construct the note from the instrument zones, generators, and the midi number
            const { source, message: thisMessage } = getBufferSourceNodeFromSample(context, preset, midi);
            if (thisMessage.error) {
                message = thisMessage;
                return false;
            }
            const noteElement: Element = staveNoteElements[index];
            result.push({ buffer: source.buffer, envelop: source.envelop, noteElement: noteElement });
            return true;
        });

        return { sources: result, message: message }
    }

    // loop through the samplenode
    // get the sample for 1/tempo seconds from the soundfont
    // while there are notes that will need to be played before the next
    function scheduler(): void {
        if (currentNote >= 0 && context != undefined && !stopRunning) {
            if (nextNoteTime < context.currentTime + SCHEDULEAHEADTIME) {
                scheduleNote(currentNote, nextNoteTime);
                nextNote();
            }

            // reschedule 
            timerID = window.setTimeout(scheduler, LOOKAHEAD);

        }
        else {
            clearTimeout(timerID);
            setRunning(false);
            // set all note styles to default
            for (let i = 0; i < staveNoteElements.length; i++) {
                staveNoteElements[i].setAttribute('fill', DEFAULTNOTEFILL)
            }
        }
    }

    // play the specific note based on the current note pointer
    function scheduleNote(currentNote: number, time: number): void {
        if (currentNote >= 0) {
            if (currentNote < sampleSequence.length) {
                highlightDisplayedNote(currentNote);
                console.log(`play note ${currentNote} at time ${time}`);
                playNoteSample(currentNote, time);
            }
        }
    }

    // get the next note pointer and update the next note time
    // current note pointer is -1 when the end of the array is hit
    function nextNote() {
        console.log(currentTempo);
        const secondsPerBeat = 60 / currentTempo;
        nextNoteTime += secondsPerBeat;
        currentNote = (currentNote >= sampleSequence.length ? currentNote = -1 : currentNote + 1);
        console.log(`current note is ${currentNote}, sample sequence length ${sampleSequence.length}, next note time ${nextNoteTime}`);
        if (currentNote < 0)
            highlightDisplayedNote(currentNote);
    }

    // will highlight the note being played and return the previous not to its origianl style

    // trying a 'trick' that may or nat not work
    // the svg elements for the notes have class='vf-stavenote' and id='vf-autonnnn'
    // they are in the same order that the notes were added to the voice
    // the idea is the change the fill of the svg as each note is being played

    function highlightDisplayedNote(currentNote: number): void {

        if (context != undefined) {

            // unhighlight previously highlighted stavenote
            let previousIndex = currentNote - 1;
            if (currentNote <= 0)
                previousIndex = sampleSequence.length - 1;
            else
                previousIndex = currentNote - 1;
            const previousElement = staveNoteElements[previousIndex];
            previousElement.setAttribute('fill', DEFAULTNOTEFILL);

            if (currentNote >= 0) {
                console.log(`changing style for ${currentNote}`)
                const thisElement: Element = staveNoteElements[currentNote];
                if (thisElement) thisElement.setAttribute('fill', HIGHLIGHTNOTEFILL);
            }
        }
    }

    function setGainEnvelop(gain: AudioParam, volume: number, envelop: Envelop, time: number): void {
        const { attackVolEnv, decayVolEnv, velocity } = envelop;
        const attack: number = Math.max(precision(tc2s(attackVolEnv), 4), 0.001);
        const decay: number = Math.max(precision(tc2s(decayVolEnv), 4), 0.001);
        const minVelocity: number = 0.001;
        const maxVelocity: number = Math.max((velocity ? velocity * volume : minVelocity), minVelocity);
        const secondsPerBeat: number = 60.0 / tempo;

        // calcucate the hold time duration
        // if less than zero, then eliminate the attack and decay and set the 
        // hold time to secondsperbeat
        const holdTime: number = secondsPerBeat - attack - decay
        if (holdTime > 0) {
            gain.setValueAtTime(minVelocity, time);
            gain.exponentialRampToValueAtTime(maxVelocity, time + attack);
            gain.exponentialRampToValueAtTime(minVelocity, time + attack + holdTime + decay);
        } else {
            gain.setValueAtTime(maxVelocity, time)
            gain.setValueAtTime(minVelocity, time + secondsPerBeat)
        }


    }
    // play the next note in the buffer array
    // the envelop needs to be calculated at this point based on the time
    // that the note is to be played
    function playNoteSample(currentNote: number, time: number): void {
        if (context != undefined) {
            const { buffer: thisNoteBuffer, envelop } = sampleSequence[currentNote];
            const vol = context.createGain();
            setGainEnvelop(vol.gain, currentVolume, envelop, time);
            const panner: StereoPannerNode = context.createStereoPanner();
            panner.pan.value = 0;
            thisNoteBuffer.connect(vol);
            vol.connect(panner);
            panner.connect(context.destination);
            // console.log(
            //     'currentnote', currentNote,
            //     'gain', vol.gain.value,
            //     'channel count', thisNoteBuffer.channelCount,
            //     'detune', thisNoteBuffer.detune.value,
            //     'loopstart', thisNoteBuffer.loopStart,
            //     'loopend', thisNoteBuffer.loopEnd,
            //     'loop', thisNoteBuffer.loop,
            //     'numberofinputs', thisNoteBuffer.numberOfInputs,
            //     'playbackrate', thisNoteBuffer.playbackRate.value,
            // )
            thisNoteBuffer.start(time);
            thisNoteBuffer.stop(time + 60.0 / tempo);
        }
    }

} 
