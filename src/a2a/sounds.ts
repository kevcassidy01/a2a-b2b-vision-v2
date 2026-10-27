import mailWav from "../assets/a2a/sounds/mail.wav";
import notifyWav from "../assets/a2a/sounds/notify.wav";

/**
 * The demo's two sounds, both from Mixkit (free to use): the tone when Mike's
 * notification reaches John on the storefront, and the woosh of Gmail's
 * notification on Alex's Mac. Loaded up front so each plays the moment its
 * notification lands. Browsers only play sound after a tap on the page; the
 * Log in tap is that tap.
 */
function sound(src: string, volume: number) {
  const audio = new Audio(src);
  audio.preload = "auto";
  audio.volume = volume;
  return () => {
    audio.currentTime = 0;
    // No sound, no harm: the notification still arrives.
    audio.play().catch(() => {});
  };
}

export const ding = sound(notifyWav, 0.6);
export const woosh = sound(mailWav, 0.6);
