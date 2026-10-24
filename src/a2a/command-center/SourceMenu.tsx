import { copy } from "../../copy/copy";
import { Dropdown } from "./Dropdown";

const t = copy.a2a.commandCenter.source;

const options = t.options.map((o) => ({ value: o, label: o }));

/** SourceMenu — where the figures come from: Org data (the default) or Demo
 *  data. Presentational for now. */
export function SourceMenu() {
  return <Dropdown label={t.label} options={options} initial={t.options[0]} />;
}
