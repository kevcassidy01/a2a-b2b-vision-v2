/**
 * Menu-bar glyphs — stand-ins drawn to match SF Symbols' shapes, since SF
 * Symbols can't be shipped. Swap for real assets in src/assets/desktop/menubar/
 * if Somnath supplies them. All use currentColor except the Agentforce and Salesforce marks.
 */
import agentforceMark from "../assets/desktop/menubar/agentforce.png";
import salesforceMark from "../assets/desktop/menubar/salesforce.png";

type P = { className?: string };

/** Apple logo (simple-icons path, CC0). */
export function AppleLogo({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
    </svg>
  );
}

/** Wi-Fi: three filled arcs fanning up from a dot (SF "wifi"). */
export function WifiGlyph({ className }: P) {
  return (
    <svg viewBox="0 0 20 15" className={className} fill="currentColor" aria-hidden>
      <path d="M10 2.2c3 0 5.8 1.15 7.9 3.1.3.28.77.27 1.05-.03l.83-.86a.73.73 0 0 0-.02-1.04A13.6 13.6 0 0 0 10 0 13.6 13.6 0 0 0 .24 3.37a.73.73 0 0 0-.02 1.04l.83.86c.28.3.75.31 1.05.03A11.5 11.5 0 0 1 10 2.2Z" />
      <path d="M10 6.1c1.95 0 3.75.73 5.13 1.96.3.27.76.25 1.04-.04l.83-.86a.73.73 0 0 0-.03-1.05A9.6 9.6 0 0 0 10 3.9a9.6 9.6 0 0 0-6.97 2.21.73.73 0 0 0-.03 1.05l.83.86c.28.29.74.31 1.04.04A7.6 7.6 0 0 1 10 6.1Z" />
      <path d="M10 10c.92 0 1.77.33 2.43.89.3.25.74.23 1.01-.05l.86-.89a.72.72 0 0 0-.04-1.06A6 6 0 0 0 10 7.8a6 6 0 0 0-4.26 1.09.72.72 0 0 0-.04 1.06l.86.89c.27.28.71.3 1.01.05A3.8 3.8 0 0 1 10 10Z" />
      <path d="M10.53 14.47a.75.75 0 0 1-1.06 0l-1.6-1.66a.72.72 0 0 1 .06-1.06 3.6 3.6 0 0 1 4.14 0c.35.26.38.76.06 1.06l-1.6 1.66Z" />
    </svg>
  );
}

/** Battery: rounded outline, a mostly-full fill, and the terminal nub. */
export function BatteryGlyph({ className }: P) {
  return (
    <svg viewBox="0 0 25 12" className={className} aria-hidden>
      <rect x="0.5" y="0.5" width="21" height="11" rx="3.2" fill="none" stroke="currentColor" strokeOpacity="0.45" />
      <rect x="2" y="2" width="15" height="8" rx="1.8" fill="currentColor" />
      <path d="M23 4.2v3.6a1.9 1.9 0 0 0 0-3.6Z" fill="currentColor" fillOpacity="0.45" />
    </svg>
  );
}

/** Spotlight magnifying glass. */
export function SearchGlyph({ className }: P) {
  return (
    <svg viewBox="0 0 14 14" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
      <circle cx="5.8" cy="5.8" r="4.6" />
      <path d="m9.3 9.3 3.7 3.7" />
    </svg>
  );
}

/** Control Center: two stacked toggle pills, knobs on opposite sides. */
export function ControlCenterGlyph({ className }: P) {
  return (
    <svg viewBox="0 0 15 13" className={className} aria-hidden>
      <rect x="0.75" y="0.75" width="13.5" height="5" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="11.75" cy="3.25" r="1.6" fill="currentColor" />
      <rect x="0.75" y="7.25" width="13.5" height="5" rx="2.5" fill="currentColor" />
      <circle cx="3.25" cy="9.75" r="1.6" fill="black" fillOpacity="0.55" />
    </svg>
  );
}

/** Salesforce cloud logo (Somnath's supplied PNG), in full color to sit alongside the Agentforce mark. */
export function SalesforceGlyph({ className }: P) {
  return <img src={salesforceMark} alt="" aria-hidden draggable={false} className={className} />;
}

/** Agentforce mark (Somnath's supplied PNG), kept in full color: it's a mascot, so a silhouette would lose the face. */
export function AgentforceGlyph({ className }: P) {
  return <img src={agentforceMark} alt="" aria-hidden draggable={false} className={className} />;
}
