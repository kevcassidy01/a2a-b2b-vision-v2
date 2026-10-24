import { createContext, useContext } from "react";

/** What any page of Fizz Partners can open: the menu drawer, and John's agent (`assign`: with Mike's cart handed to it). `notified`: Mike's cart notification has arrived (a moment after John logs in). */
export type Site = {
  menuOpen: boolean;
  notified: boolean;
  openMenu: () => void;
  openAgent: (assign?: boolean) => void;
};

export const SiteContext = createContext<Site>({ menuOpen: false, notified: false, openMenu: () => {}, openAgent: () => {} });

export const useSite = () => useContext(SiteContext);
