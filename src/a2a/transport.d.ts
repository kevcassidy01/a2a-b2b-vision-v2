export function relayAddress(base: string | undefined, room: string | null): string | undefined;
export function connectRelay(url: string, onMessage: (m: unknown) => void, onOpen: () => void, onClose: () => void): { send(m: unknown): void; close(): void };
