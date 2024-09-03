import { precision } from '..';
export function dahdsr(
    gain: AudioParam,
    time: number,
    min: number,
    max: number,
    delay: number,
    attack: number,
    hold: number,
    decay: number,
    sustain: number,
    release: number): Function {
    attack = Math.max(precision(attack, 4), 0.001);
    decay = Math.max(precision(decay, 4), 0.001);
    release = precision(release, 4);
    min = Math.max(min, 0.001);
    // console.log(min, '-', max);
    // console.log('A', attack, 'H', hold, 'D', decay, 'S', sustain, 'R', release);
    let t = time;
    gain.setValueAtTime(min, t); // origin time
    // delay
    gain.setValueAtTime(min, (t += delay));
    // attack
    gain.exponentialRampToValueAtTime(max, (t += attack)); // attack
    // hold
    gain.setValueAtTime(max, (t += hold));
    // decay
    gain.exponentialRampToValueAtTime(Math.max(sustain * max, 0.001), (t += decay));

    /*
When 96 dB (0.04) of attenuation is reached in the final gain amplifier, an abrupt jump to zero gain (infinite dB
of attenuation) occurs. In a 16-bit system, this jump is inaudible. 
*/
    // release function
    return (end: number, value: number) => {
        gain.cancelAndHoldAtTime(end);
        const target = Math.max(value ?? min, 0.001); // 0 is not allowed here..
        gain.exponentialRampToValueAtTime(target, end + release); // release
    }
}

