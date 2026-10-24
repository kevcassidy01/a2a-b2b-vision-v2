/**
 * A notification ding, made with Web Audio: two bright, glassy notes, the
 * second higher, each ringing out (a sine and a quieter overtone). Apple's own
 * sounds can't ship with the demo, so this is ours, in their spirit. Browsers
 * only play sound after a tap on the page; the Log in tap is that tap.
 */
let ctx: AudioContext | null = null;

export function ding() {
  try {
    ctx ??= new AudioContext();
    void ctx.resume();
    const now = ctx.currentTime + 0.02;
    const out = ctx.createGain();
    out.gain.value = 0.22;
    out.connect(ctx.destination);
    [
      { f: 1318.5, at: 0 }, // E6
      { f: 1760, at: 0.13 }, // A6
    ].forEach(({ f, at }) => {
      [
        { mult: 1, gain: 1 },
        { mult: 2.76, gain: 0.12 },
      ].forEach(({ mult, gain }) => {
        const osc = ctx!.createOscillator();
        const env = ctx!.createGain();
        osc.type = "sine";
        osc.frequency.value = f * mult;
        env.gain.setValueAtTime(0, now + at);
        env.gain.linearRampToValueAtTime(gain, now + at + 0.006);
        env.gain.exponentialRampToValueAtTime(0.0001, now + at + 0.9);
        osc.connect(env).connect(out);
        osc.start(now + at);
        osc.stop(now + at + 1);
      });
    });
  } catch {
    // No sound, no harm: the badge and the card still arrive.
  }
}
