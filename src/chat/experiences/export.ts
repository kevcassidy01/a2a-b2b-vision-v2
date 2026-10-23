import type { FileRef, ReportPage, ScriptedResponse } from "../types";

/**
 * A one-page PDF of a single view, for the record-style journeys (quote,
 * checkout). Played by a card's Export icon or the full-screen Export report
 * (`export|title|id`); the journey supplies the page for the id. Merchant
 * insights builds multi-page reports with a cover in its own `exportFile`.
 */
export function onePageExport(title: string, page: ReportPage): ScriptedResponse {
  const file: FileRef = { id: `export-${Date.now()}`, title, format: "PDF", pages: [page] };
  return {
    activity: "Ran 2 commands, created a file",
    // An export can come at any point, so none of its chips play a beat.
    suggestions: [{ label: "Email it to Morton" }, { label: "Share it with the team" }, { label: "Export as a spreadsheet" }],
    thinking: [
      { label: "Laying out the page", delay: 1000 },
      { label: "Saving the PDF", delay: 700 },
    ],
    response: [
      { type: "text", content: `Here's **${page.title}** as a one-page PDF, with the figures as of today.` },
      { type: "file", file },
    ],
  };
}

/** Split an `export|title|id` action key; undefined for any other key. */
export function parseExport(key: string): { title: string; id: string } | undefined {
  const [name, title = "", id = ""] = key.split("|");
  return name === "export" ? { title, id } : undefined;
}
