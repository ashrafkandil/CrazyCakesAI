import { statSync } from "node:fs";
import path from "node:path";

export function versionedImageUrl(src: string) {
  if (!src.startsWith("/")) return src;

  try {
    const pathname = src.slice(1).split("?")[0] ?? src.slice(1);
    const filePath = path.join(process.cwd(), "public", pathname);
    const version = statSync(filePath).mtimeMs.toString(36);
    return `${src}${src.includes("?") ? "&" : "?"}v=${version}`;
  } catch {
    return src;
  }
}
