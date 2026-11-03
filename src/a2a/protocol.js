export const OWNER = Object.freeze({
  quoteSent: "buyer", counterSent: "seller", heldOut: "buyer",
  askedAlex: "seller", v3Sent: "seller", accepted: "buyer", ordered: "buyer",
});

export const validRoom = (room) => typeof room === "string" && /^[A-Za-z0-9_-]{16,64}$/.test(room);

export function validMessage(m) {
  if (!m || typeof m !== "object" || Array.isArray(m) ||
      typeof m.id !== "string" || !/^[A-Za-z0-9_-]{1,64}$/.test(m.id) ||
      !["buyer", "seller"].includes(m.side)) return false;
  const kinds = {
    here: ["hello"], beat: ["beat"], jump: ["from"], pause: ["paused"],
  };
  if (typeof m.kind !== "string" || !Object.hasOwn(kinds, m.kind)) return false;
  const fields = kinds[m.kind];
  if (Object.keys(m).some((k) => !["id", "side", "kind", ...fields].includes(k))) return false;
  if (m.kind === "here") return m.hello === undefined || typeof m.hello === "boolean";
  if (m.kind === "beat") return typeof m.beat === "string" && Object.hasOwn(OWNER, m.beat) && OWNER[m.beat] === m.side;
  if (m.kind === "jump") return Number.isInteger(m.from) && m.from >= 1 && m.from <= 15;
  return typeof m.paused === "boolean";
}
