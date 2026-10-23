import { FileImage, FileSpreadsheet, FileText } from "lucide-react";

/** A file's icon, by its extension: sheets, images, then everything else as a page. */
export function fileIcon(name: string) {
  if (/\.(xlsx|csv)$/i.test(name)) return FileSpreadsheet;
  if (/\.(jpe?g|png|heic)$/i.test(name)) return FileImage;
  return FileText;
}
