import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import {
  exceedsSrpExportBudget,
  hasAtomicStageDirs,
} from "@awb/architecture";

function findSiteRoot(): string {
  const starts = [process.cwd()];
  const srcdir = process.env.TEST_SRCDIR;
  const workspace = process.env.TEST_WORKSPACE ?? "_main";
  if (srcdir) {
    starts.push(path.join(srcdir, workspace, "sites", "rent-or-buy"));
    starts.push(path.join(srcdir, "sites", "rent-or-buy"));
  }
  if (process.env.RUNFILES_DIR) {
    starts.push(
      path.join(process.env.RUNFILES_DIR, workspace, "sites", "rent-or-buy"),
    );
  }

  for (const start of starts) {
    let dir = start;
    for (let depth = 0; depth < 8; depth += 1) {
      const components = path.join(dir, "app", "components");
      const compare = path.join(dir, "app", "lib", "compare.ts");
      if (existsSync(components) && existsSync(compare)) {
        return dir;
      }
      const parent = path.dirname(dir);
      if (parent === dir) {
        break;
      }
      dir = parent;
    }
  }

  throw new Error(
    `rent-or-buy site root not found from ${starts.join(", ")}`,
  );
}

describe("rent-or-buy architecture", () => {
  const siteRoot = findSiteRoot();

  it("keeps atomic design stage directories", () => {
    expect(hasAtomicStageDirs(path.join(siteRoot, "app", "components"))).toBe(
      true,
    );
  });

  it("keeps the comparison module inside the export budget", () => {
    const source = readFileSync(
      path.join(siteRoot, "app", "lib", "compare.ts"),
      "utf8",
    );
    expect(exceedsSrpExportBudget(source)).toBe(false);
  });
});
