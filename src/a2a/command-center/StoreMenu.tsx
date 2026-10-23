import { copy } from "../../copy/copy";
import { Dropdown } from "./Dropdown";

const t = copy.a2a.commandCenter.storeScope;

const options = t.options.map((o) => ({ value: o, label: o }));

/** StoreMenu — which stores the figures cover: All stores, or Fizz Drinks B2B
 *  (the default). Presentational for now. */
export function StoreMenu() {
  return <Dropdown label={t.label} options={options} initial={t.default} />;
}
