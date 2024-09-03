import React, { useEffect, useState } from 'react'
import { Box, Grid } from '@mui/material'
import { DisplayOption, DISPLAYOPTIONS, SFInstrument, SFINSTRUMENTS, KeySignature, KEYSIGNATURES, Mode, MODES, Pitch, PITCHES, Scale, SCALES } from '../types/types'
import { HEADER, SPACING } from './config-layout';
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
    const [instrument, setInstrument] = useState<SFInstrument>();
    const [pitch, setPitch] = useState<Pitch>();
    const [keySignature, setKeySignature] = useState<KeySignature>()
    const [displayOption, setDisplayOption] = useState<DisplayOption>();
    const [notes, setNotes] = useState<StaveNote[]>([]);

    // initialize all parameters
    useEffect(() => {
        setScale(SCALES[0]);
        setMode(MODES[0]);
        setKeySignature(KEYSIGNATURES[0]);
        setInstrument(SFINSTRUMENTS[0]);
        setPitch(PITCHES[0]);
        setDisplayOption(DISPLAYOPTIONS[0])
        props.setMessage({ error: false, text: 'Welcome to Instrument Notes' });
        UpdateStatus(SFINSTRUMENTS[0], SCALES[0], MODES[0], PITCHES[0], KEYSIGNATURES[0], DISPLAYOPTIONS[0]);
    }, [props.setMessage, props.setStatus])

    function UpdateStatus(inst: SFInstrument | undefined, scal: Scale | undefined, mod: Mode | undefined, pitc: Pitch | undefined, key: KeySignature | undefined, display: DisplayOption | undefined) {
        // this will update the display based on the current props values
        if (inst != undefined &&
            scal != undefined &&
            mod != undefined &&
            pitc != undefined &&
            key != undefined &&
            display != undefined
        )
            props.setStatus(`Instrument: ${inst.name}, key: ${key.name} scale: ${scal.name}, mode: ${mod.name}, pitch: ${pitc}, display: ${display}`);
    }

    function HandleInstrumentChange(event: React.ChangeEvent<HTMLSelectElement>): void {
        const instName: string = event.target.value;
        const inst: SFInstrument | undefined = SFINSTRUMENTS.find((i) => i.name == instName);
        if (inst !== undefined) {
            setInstrument(inst);
            UpdateStatus(inst, scale, mode, pitch, keySignature, displayOption);
        } else {
            props.setMessage({ error: true, text: `instrument error - ${instName} not found` });
        }
    }

    function HandleScaleChange(event: React.ChangeEvent<HTMLSelectElement>): void {
        const scaleName: string = event.target.value;
        const scal: Scale | undefined = SCALES.find((s) => s.name == scaleName);
        if (scal !== undefined) {
            setScale(scal);
            UpdateStatus(instrument, scal, mode, pitch, keySignature, displayOption);
        } else {
            props.setMessage({ error: true, text: `scale error - ${scaleName} not found` });
        }
    }

    function HandleModeChange(event: React.ChangeEvent<HTMLSelectElement>): void {
        const modeName: string = event.target.value;
        const mod: Mode | undefined = MODES.find((m) => m.name == modeName);
        if (mod !== undefined) {
            setMode(mod);
            UpdateStatus(instrument, scale, mod, pitch, keySignature, displayOption);
        } else {
            props.setMessage({ error: true, text: `mode error - ${modeName} not found` });
        }
    }

    function HandlePitchChange(event: React.ChangeEvent<HTMLSelectElement>): void {
        const pitchName: string = event.target.value;
        const pitc: Pitch | undefined = PITCHES.find((p) => p == pitchName);
        if (pitc !== undefined) {
            setPitch(pitc);
            UpdateStatus(instrument, scale, mode, pitc, keySignature, displayOption);
        } else {
            props.setMessage({ error: true, text: `pitch error - ${pitchName} not found` });
        }
    }

    function HandleKeyChange(event: React.ChangeEvent<HTMLSelectElement>): void {
        const keyName: string = event.target.value;
        const key: KeySignature | undefined = KEYSIGNATURES.find((k) => k.name == keyName);
        if (key !== undefined) {
            setKeySignature(key);
            UpdateStatus(instrument, scale, mode, pitch, key, displayOption);
        } else {
            props.setMessage({ error: true, text: `key error - ${keyName} not found` });
        }
    }

    function HandleDisplayChange(event: React.ChangeEvent<HTMLSelectElement>): void {
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
        <Box
            component='main'
            sx={{
                flexGrow: 1,
                minHeight: 1,
                display: 'flex',
                flexDirection: 'column',
                px: 2,
                py: `${HEADER.H_DESKTOP} + ${SPACING}px`
            }}
        >
            <Grid container direction='column'>
                <Grid container direction='row'>
                    <Grid item>
                        {/* select instrument */}
                        <label htmlFor='instrument'>&nbsp;Instrument: </label>
                        <select
                            id='instrument'
                            value={instrument != undefined ? instrument.name : SFINSTRUMENTS[0].name}
                            onChange={((event: React.ChangeEvent<HTMLSelectElement>) =>
                                HandleInstrumentChange(event))}
                        >
                            {SFINSTRUMENTS.map((i) => (
                                <option key={i.name} value={i.name}>{i.name}</option>
                            ))}
                        </select>
                    </Grid>
                    <Grid item>
                        {/* select scale */}
                        <label htmlFor='scale'>&nbsp;Scale: </label>
                        <select
                            id='scale'
                            value={scale != undefined ? scale.name : SCALES[0].name}
                            onChange={((event: React.ChangeEvent<HTMLSelectElement>) =>
                                HandleScaleChange(event))}
                        >
                            {SCALES.map((s) => (
                                <option key={s.name} value={s.name}>{s.name}</option>
                            ))}
                        </select>
                    </Grid>
                    <Grid item>
                        {/* select mode */}
                        <label htmlFor='mode'>&nbsp;Mode: </label>
                        <select
                            id='mode'
                            value={mode != undefined ? mode.name : MODES[0].name}
                            onChange={((event: React.ChangeEvent<HTMLSelectElement>) =>
                                HandleModeChange(event))}
                        >
                            {MODES.map((m) => (
                                <option key={m.name} value={m.name}>{m.name}</option>
                            ))}
                        </select>
                    </Grid>
                    <Grid item>
                        {/* select key */}
                        <label htmlFor='key'>&nbsp;Key: </label>
                        <select
                            id='key'
                            value={keySignature != undefined ? keySignature.name : KEYSIGNATURES[0].name}
                            onChange={((event: React.ChangeEvent<HTMLSelectElement>) =>
                                HandleKeyChange(event))}
                        >
                            {KEYSIGNATURES.map((k) => (
                                <option key={k.name} value={k.name}>{k.name}</option>
                            ))}
                        </select>
                    </Grid>
                    <Grid item>
                        {/* select pitch */}
                        <label htmlFor='pitch'>&nbsp;Pitch: </label>
                        <select
                            id='pitch'
                            value={pitch != undefined ? pitch : PITCHES[0]}
                            onChange={((event: React.ChangeEvent<HTMLSelectElement>) =>
                                HandlePitchChange(event))}
                        >
                            {PITCHES.map((p) => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                    </Grid>
                    <Grid item>
                        {/* select display option */}
                        <label htmlFor='display'>&nbsp;Display Option: </label>
                        <select
                            id='display'
                            value={displayOption != undefined ? displayOption : DISPLAYOPTIONS[0]}
                            onChange={((event: React.ChangeEvent<HTMLSelectElement>) =>
                                HandleDisplayChange(event))}
                        >
                            {DISPLAYOPTIONS.map((d) => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </Grid>
                </Grid>
                <Grid container direction='row' justifyContent='flex-start'>
                    <Grid item sm={'auto'}>
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
                                    height={500}
                                    setMessage={props.setMessage}
                                    setNotes={setNotes}
                                />
                                : null}
                        </Box>
                    </Grid>
                </Grid>
                <Grid container direction='row' justifyContent={'flex-start'}>
                    <PlayNotes
                        notes={notes}
                        SFinstrument={instrument}
                        setMessage={props.setMessage}
                    />
                </Grid>
            </Grid>
        </Box>
    )
}