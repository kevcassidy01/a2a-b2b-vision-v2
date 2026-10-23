import { createContext, useContext } from "react";

/** The id of the message a card renders in, so a card can tell whether a chip
 *  already did its button's job (`useFired`). */
export const MessageIdContext = createContext<string | undefined>(undefined);
export const useMessageId = () => useContext(MessageIdContext);
