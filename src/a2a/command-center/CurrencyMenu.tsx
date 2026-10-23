import { copy } from "../../copy/copy";
import { Dropdown } from "./Dropdown";
import { Flag } from "./Flag";

const t = copy.a2a.commandCenter.currency;

const options = t.options.map((o) => ({
  value: o.code,
  label: o.name,
  short: o.code,
  mark: <Flag code={o.code} />,
}));

/** CurrencyMenu — the currency dropdown: a flag and the code, opening the full
 *  names (Indian Rupee, US Dollar, British Pound). The figures don't convert (yet). */
export function CurrencyMenu() {
  return <Dropdown label={t.label} options={options} initial={t.default} />;
}
