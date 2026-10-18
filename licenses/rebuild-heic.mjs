// Reproduce the shipped library from the exact upstream JavaScript source.
// Run with Node 22+ from a downloaded directory containing sources/.
import { readFile, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
const archive = new URL("sources/heic-to-1.6.6.tgz", import.meta.url);
const sha = (b) => createHash("sha256").update(b).digest("hex");
if (
  sha(await readFile(archive)) !==
  "6dc4703e62048c372ebef9632ce8613d53598ceaccf0d891fbe0a533909cf1a5"
)
  throw new Error("Unexpected source archive");
const { fileURLToPath } = await import("node:url");
const source = execFileSync(
  "tar",
  [
    "-xOf",
    fileURLToPath(archive),
    "package/src/lib/libheif-without-unsafe-eval.js",
  ],
  { maxBuffer: 8 * 1024 * 1024 },
);
if (
  sha(source) !==
  "d6ad000a632567ef3b8ff13063fdaa0d6b9fa3a51f49f2e91aa15c994965ade8"
)
  throw new Error("Unexpected upstream library");
const before = "moduleRtn=Module;";
const after =
  'moduleRtn=Module;Object.defineProperty(Module,"HEAPU8",{get:()=>HEAPU8});';
if (source.toString().split(before).length !== 2)
  throw new Error("The library patch did not match uniquely");
const modified =
  "// Des Studio modification: expose a live HEAPU8 view for image color-profile reads. See ../licenses/HEIC.txt.\n" +
  source.toString().replace(before, after);
const destination =
  process.argv[2] ||
  fileURLToPath(new URL("../codecs/libheif-1.23.6.js", import.meta.url));
await writeFile(destination, modified);
console.log(sha(modified) + "  " + destination);
