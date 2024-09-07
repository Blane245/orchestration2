import React, { useEffect, useState } from 'react'
import { Box, Grid, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material'
import Grid2 from '@mui/material/Unstable_Grid2'
import { DisplayOption, DISPLAYOPTIONS, VXInstrument, VXInstruments, KeySignature, KEYSIGNATURES, Mode, MODES, Pitch, PITCHES, Scale, SCALES } from '../types/types'
import { DrawNotes } from '../components/drawnotes';
import PlayNotes from '../components/playnotes';
import { StaveNote } from 'vexflow';

export interface BodyProps {
    setMessage: Function,
    setStatus: Function
}
export default function Body(props: BodyProps) {

    const [scale, setScale] = useState<Scale>();
    const [mode, setMode] = useState<Mode>();
    const [instrument, setInstrument] = useState<VXInstrument>();
    const [pitch, setPitch] = useState<Pitch>();
    const [keySignature, setKeySignature] = useState<KeySignature>()
    const [displayOption, setDisplayOption] = useState<DisplayOption>();
    const [notes, setNotes] = useState<StaveNote[]>([]);

    // initialize all parameters
    useEffect(() => {
        setScale(SCALES[0]);
        setMode(MODES[0]);
        setKeySignature(KEYSIGNATURES[0]);
        setInstrument(VXInstruments[0]);
        setPitch(PITCHES[0]);
        setDisplayOption(DISPLAYOPTIONS[0])
        props.setMessage({ error: false, text: 'Welcome to Instrument Notes' });
        UpdateStatus(VXInstruments[0], SCALES[0], MODES[0], PITCHES[0], KEYSIGNATURES[0], DISPLAYOPTIONS[0]);
    }, [props.setMessage, props.setStatus])

    function UpdateStatus(inst: VXInstrument | undefined, scal: Scale | undefined, mod: Mode | undefined, pitc: Pitch | undefined, key: KeySignature | undefined, display: DisplayOption | undefined) {
        // this will update the display based on the current props values
        if (inst != undefined &&
            scal != undefined &&
            mod != undefined &&
            pitc != undefined &&
            key != undefined &&
            display != undefined
        )
            props.setStatus(`Instrument: ${inst.name}, key: ${key.name} scale: ${scal.name}, mode: ${mod.name}, pitch: ${pitc.name}, display: ${display}`);
    }

    function HandleInstrumentChange(event: SelectChangeEvent): void {
        const instName: string = event.target.value;
        const inst: VXInstrument | undefined = VXInstruments.find((i) => i.name == instName);
        if (inst !== undefined) {
            setInstrument(inst);
            UpdateStatus(inst, scale, mode, pitch, keySignature, displayOption);
        } else {
            props.setMessage({ error: true, text: `instrument error - ${instName} not found` });
        }
    }

    function HandleScaleChange(event: SelectChangeEvent): void {
        const scaleName: string = event.target.value;
        const scal: Scale | undefined = SCALES.find((s) => s.name == scaleName);
        if (scal !== undefined) {
            setScale(scal);
            UpdateStatus(instrument, scal, mode, pitch, keySignature, displayOption);
        } else {
            props.setMessage({ error: true, text: `scale error - ${scaleName} not found` });
        }
    }

    function HandleModeChange(event: SelectChangeEvent): void {
        const modeName: string = event.target.value;
        const mod: Mode | undefined = MODES.find((m) => m.name == modeName);
        if (mod !== undefined) {
            setMode(mod);
            UpdateStatus(instrument, scale, mod, pitch, keySignature, displayOption);
        } else {
            props.setMessage({ error: true, text: `mode error - ${modeName} not found` });
        }
    }

    function HandlePitchChange(event: SelectChangeEvent): void {
        const pitchName: string = event.target.value;
        const pitc: Pitch | undefined = PITCHES.find((p) => p.name == pitchName);
        if (pitc !== undefined) {
            setPitch(pitc);
            UpdateStatus(instrument, scale, mode, pitc, keySignature, displayOption);
        } else {
            props.setMessage({ error: true, text: `pitch error - ${pitchName} not found` });
        }
    }

    function HandleKeyChange(event: SelectChangeEvent): void {
        const keyName: string = event.target.value;
        const key: KeySignature | undefined = KEYSIGNATURES.find((k) => k.name == keyName);
        if (key !== undefined) {
            setKeySignature(key);
            UpdateStatus(instrument, scale, mode, pitch, key, displayOption);
        } else {
            props.setMessage({ error: true, text: `key error - ${keyName} not found` });
        }
    }

    function HandleDisplayChange(event: SelectChangeEvent): void {
        const displayName: string = event.target.value;
        const display: DisplayOption | undefined = DISPLAYOPTIONS.find((d) => d == displayName);
        if (display !== undefined) {
            setDisplayOption(display);
            UpdateStatus(instrument, scale, mode, pitch, keySignature, display);
        } else {
            props.setMessage({ error: true, text: `display error - ${displayName} not found` });
        }
    }

    return (
        <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={2}>
                <Grid item xs={2}>
                    {/* select instrument */}
                    <InputLabel id='instrument-label'>Instrument</InputLabel>
                    <Select
                        labelId='instrument-label'
                        id='instrument-select'
                        value={instrument != undefined ? instrument.name : VXInstruments[0].name}
                        onChange={HandleInstrumentChange}
                    >
                        {VXInstruments.map((i) => (
                            <MenuItem key={'instrument-' + i.name} value={i.name}>{i.name}</MenuItem>
                        ))}
                    </Select>

                </Grid>
                <Grid item xs={2}>
                    {/* select scale */}
                    <InputLabel id='scale-label'>Scale</InputLabel>
                    <Select
                        labelId='scale-label'
                        id='scale-select'
                        value={scale != undefined ? scale.name : SCALES[0].name}
                        onChange={HandleScaleChange}
                    >
                        {SCALES.map((i) => (
                            <MenuItem key={'scale-' + i.name} value={i.name}>{i.name}</MenuItem>
                        ))}
                    </Select>

                </Grid>
                <Grid item xs={2}>
                    {/* select mode */}
                    <InputLabel id='mode-label'>Mode</InputLabel>
                    <Select
                        labelId='mode-label'
                        id='mode-select'
                        value={mode != undefined ? mode.name : MODES[0].name}
                        onChange={HandleModeChange}
                    >
                        {MODES.map((i) => (
                            <MenuItem key={'mode-' + i.name} value={i.name}>{i.name}</MenuItem>
                        ))}
                    </Select>

                </Grid>
                <Grid item xs={2}>
                    {/* select key */}
                    <InputLabel id='key-label'>Key</InputLabel>
                    <Select
                        labelId='key-label'
                        id='key-select'
                        value={keySignature != undefined ? keySignature.name : KEYSIGNATURES[0].name}
                        onChange={HandleKeyChange}
                    >
                        {KEYSIGNATURES.map((i) => (
                            <MenuItem key={'key-' + i.name} value={i.name}>{i.name}</MenuItem>
                        ))}
                    </Select>

                </Grid>
                <Grid item xs={2}>
                    {/* select pitch */}
                    <InputLabel id='pitch-label'>Key</InputLabel>
                    <Select
                        labelId='pitch-label'
                        id='pitch-select'
                        value={pitch != undefined ? pitch.name : PITCHES[0].name}
                        onChange={HandlePitchChange}
                    >
                        {PITCHES.map((i) => (
                            <MenuItem key={'pitch-' + i.name} value={i.name}>{i.name}</MenuItem>
                        ))}
                    </Select>

                </Grid>
                <Grid item xs={2}>
                    {/* select display option */}
                    <InputLabel id='display-label'>Key</InputLabel>
                    <Select
                        labelId='display-label'
                        id='display-select'
                        value={displayOption != undefined ? displayOption : DISPLAYOPTIONS[0]}
                        onChange={HandleDisplayChange}
                    >
                        {DISPLAYOPTIONS.map((i) => (
                            <MenuItem key={'pitch-' + i} value={i}>{i}</MenuItem>
                        ))}
                    </Select>

                </Grid>
            </Grid>
            <Grid item xs={12}>
                <Box display='flex' justifyContent='flex-start'>
                    {scale != undefined && keySignature != undefined && pitch != undefined && mode != undefined && instrument != undefined && displayOption != undefined ?
                        <DrawNotes
                            scale={scale}
                            pitch={pitch}
                            mode={mode}
                            instrument={instrument}
                            keySignature={keySignature}
                            displayOption={displayOption}
                            width={1200}
                            height={300}
                            setMessage={props.setMessage}
                            setNotes={setNotes}
                        />
                        : null}
                </Box>
            </Grid>
            <Grid container spacing={2}>
                {instrument && pitch ?
                    <PlayNotes
                        notes={notes}
                        VXInstrument={instrument}
                        pitch={pitch}
                        setMessage={props.setMessage}
                    /> : null}
            </Grid>
        </Box>

    )
}