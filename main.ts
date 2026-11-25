import { copyFileSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// The entry is the post: POST.json names it, and the picture beside it is the
// photo the post carries. This program checks both, then lays them out where
// the house looks: /output/POST.json is the file the gate reads.
const root = dirname(fileURLToPath(import.meta.url));
const post = join(root, "POST.json");
const photo = join(root, "photo.png");
const drop = process.env.MAKEFUN_OUTPUT_DIR || "/output";

const raw = readFileSync(post);
if (raw.length > 16384) throw new Error("POST.json is " + raw.length + " bytes, over the 16384 the house reads");
const named = JSON.parse(raw.toString("utf8"));
const address = String(named.url ?? "").trim();
if (address && !/^https:\/\/(www\.|mobile\.)?(x|twitter)\.com\/\S+\/status\/\d+/.test(address)) {
  throw new Error("POST.json names no post address: " + address);
}
if (!address) console.log("POST.json is still empty: fill the post address in before entering");

const picture = readFileSync(photo);
const wants = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
for (let i = 0; i < wants.length; i += 1) {
  if (picture[i] !== wants[i]) throw new Error("photo.png is not a PNG file");
}

mkdirSync(drop, { recursive: true });
copyFileSync(post, join(drop, "POST.json"));
copyFileSync(photo, join(drop, "entry.png"));
console.log("POST.json (" + raw.length + " bytes) and entry.png (" + statSync(photo).size + " bytes) written to " + drop);