import { Instrument, InstrumentZone, Preset, PresetZone } from '../types/soundfonttypes'

// http://www.synthfont.com/SFSPEC21.PDF page 38
export const generators:Record<number, string>  = {
  0: 'startAddrOffset',
  1: 'endAddrOffset',
  2: 'startloopAddrsOffset',
  3: 'endloopAddrsOffset',
  4: 'startAddrsCoarseOffset',
  5: 'modLfoToPitch',
  6: 'vibLfoToPitch',
  7: 'modEnvToPitch',
  8: 'initialFilterFc',
  9: 'initialFilterQ',
  10: 'modLfoToFilterFc',
  11: 'modEnvToFilterFc',
  12: 'endAddrsCoarseOffset',
  13: 'modLfoToVolume',
  14: 'unused1',
  15: 'chorusEffectsSend',
  16: 'reverbEffectsSend',
  17: 'pan',
  18: 'unused2',
  19: 'unused3',
  20: 'unused4',
  21: 'delayModLFO',
  22: 'freqModLFO',
  23: 'delayVibLFO',
  24: 'freqVibLFO',
  25: 'delayModEnv', 
  26: 'attackModEnv',
  27: 'holdModEnv', 
  28: 'decayModEnv', 
  29: 'sustainModEnv', 
  30: 'releaseModEnv', 
  31: 'keyNumToModEnvHold',
  32: 'keyNumToModEnvDecay',
  33: 'delayVolEnv', // timecents: delay until attackphase starts. default: -12000
  34: 'attackVolEnv',  // timecents: attack time. default: -12000
  35: 'holdVolEnv', // timecents: hold time. default: -12000
  36: 'decayVolEnv', // timecents: decay time. default: -12000
  37: 'sustainVolEnv', // in 0.1% units: sustain level. default: 0 = full level, per mille, clamp(0, 1000),
  38: 'releaseVolEnv', // timecents: decay time. default: -12000
  39: 'keyNumToVolEnvHold',
  40: 'keyNumToVolEnvDecay',
  41: 'instrument',
  42: 'reserved1',
  43: 'keyRange',
  44: 'velRange',
  45: 'startloopAddrsCoarseOffset',
  46: 'keyNum',
  47: 'velocity',
  48: 'initialAttenuation',
  49: 'reserved2',
  50: 'endloopAddrsCoarseOffset',
  51: 'coarseTune',
  52: 'fineTune',
  53: 'sampleID',
  54: 'sampleModes',
  55: 'reserved3',
  56: 'scaleTuning',
  57: 'exclusiveClass',
  58: 'overridingRootKey',
  59: 'unused5',
  60: 'endOper',
};

// export const defaultGeneratorValues = Object.fromEntries(
//   Object.entries(DEFAULT_GENERATOR_VALUES).map(([key, value]) => [generators[key], value]),
// );

// export const getGeneratorValue(generator: string, preset, ) {

export const getGeneratorValue = (
  index: number,
  izone: InstrumentZone,
  instrument: Instrument,
  pzone: PresetZone,
  preset: Preset,
): number => {
  /*
8.5 Precedence and Absolute and Relative values.
Most SoundFont generators are available at both the Instrument and Preset Levels, as well as having a default value.
Generators at the Instrument Level are considered “absolute” and determine an actual physical value for the associated
synthesis parameter, which is used instead of the default. For example, a value of 1200 for the attackVolEnv generator
would produce an absolute time of 1200 timecents or 2 seconds of attack time for the volume envelope, instead of the
default value of -12000 timecents or 1 msec.
Generators at the Preset Level are instead considered “relative” and additive to all the default or instrument level generators
within the Preset Zone. For example, a value of 2400 timecents for the attackVolEnv generator in a preset zone containing
an instrument with two zones, one with the default attackVelEnv and one with an absolute attackVolEnv generator value of
1200 timecents would cause the default zone to actually have a value of -9600 timecents or 4 msec, and the other to have a
value of 3600 timecents or 8 seconds attack time.
  */
// const defaultValue = DEFAULT_GENERATOR_VALUES[index];
// const defaultValue = defaultGeneratorValues[index];
// if (typeof defaultValue !== 'number') {
  //   throw new Error(`no default value found for generator with index ${index}`);
  // }
  // save generators to dedicated variables to make typescript happy
  const izoneGenerator = izone.generators[index];
  const izoneGlobalGenerator = instrument.globalZone?.generators?.[index];

  const pzoneGenerator = pzone?.generators?.[index];
  const pzoneGlobalGenerator = preset.globalZone?.generators?.[index];
  const izoneValue = izoneGenerator && 'value' in izoneGenerator ? izoneGenerator.value : undefined;
  const izoneGlobalValue =
    izoneGlobalGenerator && 'value' in izoneGlobalGenerator ? izoneGlobalGenerator.value : undefined;
  const pzoneValue = pzoneGenerator && 'value' in pzoneGenerator ? pzoneGenerator.value : undefined;
  const pzoneGlobalValue =
    pzoneGlobalGenerator && 'value' in pzoneGlobalGenerator ? pzoneGlobalGenerator.value : undefined;
  const absoluteValue = izoneValue ?? izoneGlobalValue ?? 0 /*defaultValue */;
  const relativeValue = pzoneValue ?? pzoneGlobalValue ?? 0;
  /* if (index === 38) {
    console.log('get 38', absoluteValue, relativeValue);
  } */
  return absoluteValue + relativeValue;
};

// export const hasDefaultValue = (index:number) => {
//   return DEFAULT_GENERATOR_VALUES[index] !== undefined;
// };
// export const hasDefaultValue = (index:string) => {
//   return defaultGeneratorValues[index] !== undefined;
// };

// console.log('DEFAULT_GENERATOR_VALUES',DEFAULT_GENERATOR_VALUES);

export const getGeneratorValues = (izone: InstrumentZone, pzone: PresetZone, preset: Preset) => {
  const generatorValues = 
  Object.fromEntries(
    Array.from(
      new Set(
        [
          Object.keys(preset.globalZone?.generators ?? {}),
          Object.keys(pzone.generators),
          Object.keys(pzone.instrument.globalZone?.generators ?? {}),
          Object.keys(izone.generators),
        ].flat(),
      ),
    )
      // .filter((index)=>hasDefaultValue(index))
      .map((key) => [generators[parseInt(key)], getGeneratorValue(parseInt(key), izone, pzone.instrument, pzone, preset)]),
  );
  console.log(generatorValues);
  return generatorValues;
};
