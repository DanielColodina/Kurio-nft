import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";

mkdirSync("reports/lighthouse", { recursive: true });
const baseUrl = process.env.LIGHTHOUSE_BASE_URL ?? "http://localhost:4174";
const pages = ["/", "/nft/emerald-ape-042"];
for (const profile of ["mobile", "desktop"]) {
  for (const page of pages) {
    const slug = page === "/" ? "home" : "detail";
    for (let run = 1; run <= 3; run += 1) {
      const args = [
        "lighthouse",
        `${baseUrl}${page}`,
        "--output=html",
        "--output=json",
        `--output-path=reports/lighthouse/${slug}-${profile}-${run}`,
        "--chrome-flags=--headless --no-sandbox --disable-gpu",
        "--quiet",
      ];
      if (profile === "desktop") args.push("--preset=desktop");
      const result = spawnSync("npx", args, { stdio: "inherit", shell: true });
      if (result.status !== 0) process.exitCode = result.status ?? 1;
    }
  }
}
