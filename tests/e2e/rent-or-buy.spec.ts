import { expect, test, type Locator, type Page } from "@playwright/test";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const siteRoot = join(dirname(fileURLToPath(import.meta.url)), "../..");

const WHITE = "rgb(255, 255, 255)";
const INK = "rgb(34, 34, 34)";
const MUTE = "rgb(106, 106, 106)";
const RAUSCH = "rgb(255, 56, 92)";

const INVALID: Array<[string, string, string, string]> = [
  ["Home price", "price", "0", "price"],
  ["Home price", "price", "abc", "price"],
  ["Home price", "price", "20,000", "price"],
  ["Home price", "price", "-1", "price"],
  ["Down payment", "downPayment", "100001", "down payment"],
  ["Down payment", "downPayment", "-1", "down payment"],
  ["Mortgage rate", "mortgageRatePercent", "25.01", "mortgage rate"],
  ["Mortgage rate", "mortgageRatePercent", "-0.1", "mortgage rate"],
  ["Mortgage rate", "mortgageRatePercent", "6%", "mortgage rate"],
  ["Loan term", "termYears", "1.5", "loan term"],
  ["Loan term", "termYears", "0", "loan term"],
  ["Loan term", "termYears", "41", "loan term"],
  ["Rent growth", "rentGrowthPercent", "-1", "rent growth"],
  ["Rent growth", "rentGrowthPercent", "20.1", "rent growth"],
  ["Property tax", "taxPercent", "11", "property tax"],
  ["Property tax", "taxPercent", "-0.1", "property tax"],
  ["Maintenance", "maintenancePercent", "-0.1", "maintenance"],
  ["Maintenance", "maintenancePercent", "10.1", "maintenance"],
  ["Monthly rent", "monthlyRent", "-1", "monthly rent"],
  ["Insurance", "insuranceAnnual", "-1", "insurance"],
  ["Appreciation", "appreciationPercent", "-20.1", "appreciation"],
  ["Appreciation", "appreciationPercent", "30.1", "appreciation"],
  ["Investment return", "investmentReturnPercent", "30.1", "investment return"],
  ["Investment return", "investmentReturnPercent", "-20.1", "investment return"],
];

const ACCEPTED: Array<[string, string, string]> = [
  ["Mortgage rate", "0", "$479.64"],
  ["Mortgage rate", "25", "$479.64"],
  ["Loan term", "1", "$479.64"],
  ["Loan term", "40", "$479.64"],
  ["Down payment", "0", "$479.64"],
  ["Monthly rent", "0", "$44,597"],
  ["Rent growth", "0", "$44,597"],
  ["Rent growth", "20", "$44,597"],
  ["Property tax", "0", "$42,397"],
  ["Property tax", "10", "$42,397"],
  ["Maintenance", "0", "$42,397"],
  ["Maintenance", "10", "$42,397"],
  ["Insurance", "0", "$42,397"],
  ["Appreciation", "-20", "$41,484"],
  ["Appreciation", "30", "$41,484"],
  ["Investment return", "-20", "$28,353"],
  ["Investment return", "30", "$28,353"],
];

function channel(value: number): number {
  const s = value / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function contrast(foreground: string, background: string): number {
  const lum = (rgb: string) => {
    const parts = rgb.match(/[\d.]+/g)?.slice(0, 3).map(Number) ?? [0, 0, 0];
    const [r, g, b] = parts.map(channel);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const lighter = Math.max(lum(foreground), lum(background));
  const darker = Math.min(lum(foreground), lum(background));
  return (lighter + 0.05) / (darker + 0.05);
}

function shown(page: Page, text: string): Locator {
  return page.getByText(text, { exact: true }).locator("visible=true");
}

async function open(page: Page, width = 1280, height = 900): Promise<void> {
  await page.setViewportSize({ width, height });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
}

async function commit(page: Page, edits: Array<[string, string]>): Promise<void> {
  for (const [label, value] of edits) {
    await page.getByLabel(label).fill(value);
  }
  await expect(page.locator("output")).not.toHaveText("Updating");
}

async function yearCell(page: Page, rowName: string, index: number): Promise<string> {
  const cell = page.getByRole("row", { name: rowName }).getByRole("cell").nth(index);
  return (await cell.innerText()).trim();
}

test.describe("rent or buy", () => {
  test("AC-01 shows the headline", async ({ page }) => {
    await open(page);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Rent or Buy? Let the numbers decide.",
    );
  });

  test("AC-02 sets the document title", async ({ page }) => {
    await open(page);
    await expect(page).toHaveTitle("Rent or Buy? Let the numbers decide.");
  });

  test("AC-03 describes the comparison and no account", async ({ page }) => {
    await open(page);
    const description = await page.locator('meta[name="description"]').getAttribute("content");
    expect(description).toBe(
      "Compare the cash, equity, and invested down payment of buying or renting. No account.",
    );
  });

  test("AC-04 sets language and viewport", async ({ page }) => {
    await open(page);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    const viewport = await page.locator('meta[name="viewport"]').getAttribute("content");
    expect(viewport).toContain("width=device-width");
  });

  test("AC-05 has no account controls", async ({ page }) => {
    await open(page);
    await expect(page.getByRole("button", { name: /sign up|log in|create account/i })).toHaveCount(0);
    await expect(page.getByRole("link", { name: /sign up|log in|create account/i })).toHaveCount(0);
  });

  test("AC-06 does not offer a second product page at /signup", async ({ page }) => {
    const response = await page.goto("/signup");
    expect(response?.status() ?? 0).toBeGreaterThanOrEqual(400);
    await expect(page.getByLabel(/password|email/i)).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Rent or Buy? Let the numbers decide." })).toHaveCount(0);
  });

  test("AC-07 has no chart surface", async ({ page }) => {
    await open(page);
    await expect(page.locator("canvas, svg")).toHaveCount(0);
  });

  test("AC-08 has no theme toggle", async ({ page }) => {
    await open(page);
    await expect(page.getByRole("switch")).toHaveCount(0);
    await expect(page.getByRole("button", { name: /theme|dark mode/i })).toHaveCount(0);
  });

  test("AC-09 has no testimonials or fake statistics", async ({ page }) => {
    await open(page);
    await expect(page.getByText(/testimonial|trusted by \d|★★★★★/i)).toHaveCount(0);
  });

  test("AC-10 prefills the sample inputs", async ({ page }) => {
    await open(page);
    await expect(page.getByLabel("Home price")).toHaveValue("100000");
    await expect(page.getByLabel("Down payment")).toHaveValue("20000");
    await expect(page.getByLabel("Mortgage rate")).toHaveValue("6");
    await expect(page.getByLabel("Loan term")).toHaveValue("30");
    await expect(page.getByLabel("Monthly rent")).toHaveValue("700");
    await expect(page.getByLabel("Rent growth")).toHaveValue("3");
    await expect(page.getByLabel("Property tax")).toHaveValue("1");
    await expect(page.getByLabel("Maintenance")).toHaveValue("1");
    await expect(page.getByLabel("Insurance")).toHaveValue("600");
    await expect(page.getByLabel("Appreciation")).toHaveValue("3");
    await expect(page.getByLabel("Investment return")).toHaveValue("7");
  });

  test("AC-11 calls the entries a sample, not a forecast", async ({ page }) => {
    await open(page);
    await expect(
      page.getByText(
        "One page for your price, rent, and loan. No account. The sample is a starting point, not a forecast.",
      ),
    ).toBeVisible();
    await expect(page.getByText("These entries start as a sample, not a forecast.")).toBeVisible();
  });

  test("AC-12 shows the sample mortgage payment", async ({ page }) => {
    await open(page);
    await expect(page.getByText("Monthly mortgage payment")).toBeVisible();
    await expect(shown(page, "$479.64")).toHaveCount(1);
  });

  test("AC-13 shows the year-5 matrix", async ({ page }) => {
    await open(page);
    expect(await yearCell(page, "Cumulative rent", 0)).toBe("$44,597");
    expect(await yearCell(page, "Cumulative owning cost", 0)).toBe("$42,397");
    expect(await yearCell(page, "Equity", 0)).toBe("$41,484");
    expect(await yearCell(page, "Down payment future value", 0)).toBe("$28,353");
  });

  test("AC-14 shows the year-10 matrix", async ({ page }) => {
    await open(page);
    expect(await yearCell(page, "Cumulative rent", 1)).toBe("$96,297");
    expect(await yearCell(page, "Cumulative owning cost", 1)).toBe("$86,485");
    expect(await yearCell(page, "Equity", 1)).toBe("$67,443");
    expect(await yearCell(page, "Down payment future value", 1)).toBe("$40,193");
  });

  test("AC-15 shows the year-20 matrix", async ({ page }) => {
    await open(page);
    expect(await yearCell(page, "Cumulative rent", 2)).toBe("$225,711");
    expect(await yearCell(page, "Cumulative owning cost", 2)).toBe("$180,854");
    expect(await yearCell(page, "Equity", 2)).toBe("$137,408");
    expect(await yearCell(page, "Down payment future value", 2)).toBe("$80,775");
  });

  test("AC-16 says owning is ahead from year 1", async ({ page }) => {
    await open(page);
    await expect(page.locator("output")).toHaveText("Owning is ahead from year 1.");
  });

  test("AC-17 shows only years 5, 10, and 20", async ({ page }) => {
    await open(page);
    const headers = await page.getByRole("columnheader").allInnerTexts();
    expect(headers.map((header) => header.trim()).filter((header) => header.startsWith("Year"))).toEqual([
      "Year 5",
      "Year 10",
      "Year 20",
    ]);
  });

  test("AC-18 keeps cents on the payment and whole dollars in the table", async ({ page }) => {
    await open(page);
    expect(await yearCell(page, "Cumulative rent", 0)).toMatch(/^\$\d{1,3}(,\d{3})*$/);
    await expect(shown(page, "$479.64")).toHaveCount(1);
  });

  test("AC-19 clears the figures when price is blank", async ({ page }) => {
    await open(page);
    await commit(page, [["Home price", ""]]);
    await expect(page.locator("output")).toHaveText("Enter every field to see the comparison.");
    await expect(page.locator("#year-table")).toHaveText("Enter every field to see the comparison.");
    await expect(page.getByText("$479.64")).toHaveCount(0);
    await expect(page.getByText("$44,597")).toHaveCount(0);
  });

  test("AC-20 treats a whitespace price as blank", async ({ page }) => {
    await open(page);
    await commit(page, [["Home price", "   "]]);
    await expect(page.locator("output")).toHaveText("Enter every field to see the comparison.");
    await expect(page.getByText("$44,597")).toHaveCount(0);
  });

  for (const [label, id, value, field] of INVALID) {
    test(`AC-21 rejects ${label} value ${value}`, async ({ page }) => {
      await open(page);
      await commit(page, [[label, value]]);
      await expect(page.locator("output")).toHaveText(`No projection. Check the ${field}.`);
      await expect(page.locator(`#${id}-error`)).toHaveText(`Check the ${field}.`);
      await expect(page.getByLabel(label)).toHaveAttribute("aria-invalid", "true");
      await expect(page.getByText("$479.64")).toHaveCount(0);
      await expect(page.getByText("$44,597")).toHaveCount(0);
      await expect(page.getByRole("heading", { name: "Years 5, 10, and 20" })).toHaveCount(0);
    });
  }

  for (const [label, value, sampleFigure] of ACCEPTED) {
    test(`AC-22 accepts ${label} value ${value}`, async ({ page }) => {
      await open(page);
      await commit(page, [[label, value]]);
      await expect(shown(page, sampleFigure)).toHaveCount(0);
      await expect(page.locator("output")).not.toHaveText(/No projection|Enter every field|Updating/);
      await expect(page.getByRole("heading", { name: "Years 5, 10, and 20" })).toBeVisible();
      await expect(page.getByRole("columnheader", { name: "Year 5" })).toBeVisible();
      await expect(page.getByRole("columnheader", { name: "Year 20" })).toBeVisible();
    });
  }

  test("AC-23 shows a zero payment for a cash purchase", async ({ page }) => {
    await open(page);
    await commit(page, [["Down payment", "100000"]]);
    await expect(shown(page, "$0.00")).toHaveCount(1);
    await expect(page.getByRole("heading", { name: "Years 5, 10, and 20" })).toBeVisible();
  });

  test("AC-24 divides a zero-rate loan by the months", async ({ page }) => {
    await open(page);
    await commit(page, [
      ["Home price", "120000"],
      ["Down payment", "0"],
      ["Mortgage rate", "0"],
      ["Loan term", "10"],
    ]);
    await expect(shown(page, "$1,000.00")).toHaveCount(1);
  });

  test("AC-25 stops adding mortgage payments after payoff", async ({ page }) => {
    await open(page);
    await commit(page, [
      ["Home price", "12000"],
      ["Down payment", "0"],
      ["Mortgage rate", "0"],
      ["Loan term", "1"],
      ["Monthly rent", "0"],
      ["Rent growth", "0"],
      ["Property tax", "0"],
      ["Maintenance", "0"],
      ["Insurance", "0"],
      ["Appreciation", "0"],
      ["Investment return", "0"],
    ]);
    await expect(shown(page, "$1,000.00")).toHaveCount(1);
    expect(await yearCell(page, "Cumulative owning cost", 0)).toBe("$12,000");
  });

  test("AC-26 still shows the table when value falls", async ({ page }) => {
    await open(page);
    await commit(page, [["Appreciation", "-5"]]);
    await expect(page.getByRole("heading", { name: "Years 5, 10, and 20" })).toBeVisible();
    const year5 = Number((await yearCell(page, "Equity", 0)).replace(/[^0-9.-]/g, ""));
    const year10 = Number((await yearCell(page, "Equity", 1)).replace(/[^0-9.-]/g, ""));
    expect(year10).toBeLessThan(year5);
  });

  test("AC-27 names a later break-even year", async ({ page }) => {
    await open(page);
    await commit(page, [
      ["Home price", "400000"],
      ["Down payment", "80000"],
      ["Mortgage rate", "6.5"],
      ["Loan term", "30"],
      ["Monthly rent", "2800"],
      ["Rent growth", "3"],
      ["Property tax", "1.1"],
      ["Maintenance", "1"],
      ["Insurance", "1500"],
      ["Appreciation", "-2"],
      ["Investment return", "0"],
    ]);
    await expect(page.locator("output")).toHaveText("Owning pulls ahead in year 8.");
  });

  test("AC-28 says renting stays ahead through the horizon", async ({ page }) => {
    await open(page);
    await commit(page, [
      ["Home price", "100000"],
      ["Down payment", "100000"],
      ["Mortgage rate", "0"],
      ["Monthly rent", "0"],
      ["Rent growth", "0"],
      ["Property tax", "10"],
      ["Maintenance", "10"],
      ["Insurance", "10000"],
      ["Appreciation", "-20"],
      ["Investment return", "30"],
    ]);
    await expect(page.locator("output")).toHaveText("Renting stays ahead through the horizon.");
  });

  test("AC-29 shows Updating and a busy year region for 100ms", async ({ page }) => {
    await open(page);
    await page.clock.install();
    await page.getByLabel("Down payment").fill("25000");
    await expect(page.locator("output")).toHaveText("Updating");
    await expect(page.locator("#year-table")).toHaveAttribute("aria-busy", "true");
    await page.clock.runFor(100);
    await expect(page.locator("output")).toHaveText("Owning is ahead from year 1.");
    await expect(page.locator("#year-table")).not.toHaveAttribute("aria-busy");
    await expect(page.getByText("$479.64")).toHaveCount(0);
  });

  test("AC-30 keeps verdict, fields, table, then assumptions", async ({ page }) => {
    await open(page);
    const order = await page.evaluate(() => {
      const nodes = [
        document.querySelector("output"),
        document.querySelector('[aria-label="Your figures"]'),
        document.querySelector("#year-table"),
        document.querySelector("#assumptions-title"),
      ];
      return nodes.every((node, index) => {
        const next = nodes[index + 1];
        if (!node || !next) {
          return Boolean(node);
        }
        return Boolean(node.compareDocumentPosition(next) & Node.DOCUMENT_POSITION_FOLLOWING);
      });
    });
    expect(order).toBe(true);
  });

  test("AC-31 stacks the form above the years on a phone", async ({ page }) => {
    await open(page, 390, 844);
    const fields = await page.getByRole("region", { name: "Your figures" }).boundingBox();
    const table = await page.getByRole("region", { name: "Year comparison" }).boundingBox();
    expect(fields).not.toBeNull();
    expect(table).not.toBeNull();
    expect(fields!.y + fields!.height).toBeLessThanOrEqual(table!.y + 1);
    expect(Math.abs(fields!.x - table!.x)).toBeLessThan(8);
    await expect(page.getByRole("table")).toBeHidden();
    await expect(page.getByRole("heading", { name: "Year 5" })).toBeVisible();
    await expect(shown(page, "$44,597")).toHaveCount(1);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test("AC-32 uses two field columns and a year table at 40rem", async ({ page }) => {
    await open(page, 640, 900);
    const price = await page.getByLabel("Home price").boundingBox();
    const down = await page.getByLabel("Down payment").boundingBox();
    expect(price).not.toBeNull();
    expect(down).not.toBeNull();
    expect(Math.abs(price!.y - down!.y)).toBeLessThan(8);
    expect(down!.x).toBeGreaterThan(price!.x + price!.width - 4);
    await expect(page.getByRole("table")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Year 5" })).toBeHidden();
  });

  test("AC-33 places the form beside the table on a wide screen", async ({ page }) => {
    await open(page, 1280, 900);
    const fields = await page.getByRole("region", { name: "Your figures" }).boundingBox();
    const table = await page.getByRole("region", { name: "Year comparison" }).boundingBox();
    expect(fields).not.toBeNull();
    expect(table).not.toBeNull();
    expect(table!.x).toBeGreaterThan(fields!.x + fields!.width * 0.5);
    expect(Math.abs(fields!.y - table!.y)).toBeLessThan(40);
  });

  test("AC-34 keeps a large price inside the phone viewport", async ({ page }) => {
    await open(page, 390, 844);
    await commit(page, [["Home price", "100000000000"]]);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test("AC-35 shows an ink focus outline on a field", async ({ page }) => {
    await open(page);
    const field = page.getByLabel("Home price");
    for (let step = 0; step < 8; step += 1) {
      await page.keyboard.press("Tab");
      if (await field.evaluate((element) => element === document.activeElement)) {
        break;
      }
    }
    await expect(field).toBeFocused();
    const outline = await field.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        style: style.outlineStyle,
        width: Number.parseFloat(style.outlineWidth),
        color: style.outlineColor,
      };
    });
    expect(outline.style).toBe("solid");
    expect(outline.width).toBeGreaterThanOrEqual(2);
    expect(outline.color).toBe(INK);
  });

  test("AC-36 moves focus to the year table from the skip link", async ({ page }) => {
    await open(page);
    const skip = page.getByRole("link", { name: "Skip to the year table" });
    for (let step = 0; step < 6; step += 1) {
      await page.keyboard.press("Tab");
      if (await skip.evaluate((element) => element === document.activeElement)) {
        break;
      }
    }
    await expect(skip).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("#year-table")).toBeFocused();
  });

  test("AC-37 labels every field", async ({ page }) => {
    await open(page);
    for (const label of [
      "Currency",
      "Home price",
      "Down payment",
      "Mortgage rate",
      "Loan term",
      "Monthly rent",
      "Rent growth",
      "Property tax",
      "Maintenance",
      "Insurance",
      "Appreciation",
      "Investment return",
    ]) {
      await expect(page.getByLabel(label)).toBeVisible();
    }
  });

  test("AC-38 uses one h1 and the two section h2 headings", async ({ page }) => {
    await open(page);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 2, name: "Years 5, 10, and 20" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "What the numbers include" })).toBeVisible();
  });

  test("AC-39 keeps ink on white at 4.5:1 or better", async ({ page }) => {
    await open(page);
    const colors = await page.locator("body").evaluate((element) => {
      const style = getComputedStyle(element);
      return { color: style.color, background: style.backgroundColor };
    });
    expect(colors.color).toBe(INK);
    expect(colors.background).toBe(WHITE);
    expect(contrast(colors.color, colors.background)).toBeGreaterThanOrEqual(4.5);
  });

  test("AC-40 sets the payment at 24px with large-text contrast", async ({ page }) => {
    await open(page);
    const payment = shown(page, "$479.64");
    await expect(payment).toHaveCSS("color", RAUSCH);
    await expect(payment).toHaveCSS("font-size", "24px");
    expect(contrast(RAUSCH, WHITE)).toBeGreaterThanOrEqual(3);
  });

  test("AC-41 gives the field border a 3:1 edge", async ({ page }) => {
    await open(page);
    const border = await page.getByLabel("Home price").evaluate((element) => getComputedStyle(element).borderTopColor);
    expect(contrast(border, WHITE)).toBeGreaterThanOrEqual(3);
  });

  test("AC-42 keeps mute text at 4.5:1", async ({ page }) => {
    await open(page);
    const note = page.getByText("These entries start as a sample, not a forecast.");
    await expect(note).toHaveCSS("color", MUTE);
    expect(contrast(MUTE, WHITE)).toBeGreaterThanOrEqual(4.5);
  });

  test("AC-43 uses the white canvas, ink, and Public Sans", async ({ page }) => {
    await open(page);
    const font = await page.locator("body").evaluate((element) => getComputedStyle(element).fontFamily);
    expect(font.toLowerCase()).toContain("public sans");
    await expect(page.locator("body")).toHaveCSS("background-color", WHITE);
    await expect(page.locator("body")).toHaveCSS("color", INK);
  });

  test("AC-44 rounds inputs at 14px and the year panel at 20px", async ({ page }) => {
    await open(page);
    await expect(page.getByLabel("Home price")).toHaveCSS("border-radius", "14px");
    await expect(page.locator("#year-table")).toHaveCSS("border-radius", "20px");
  });

  test("AC-45 keeps Rausch on the payment only", async ({ page }) => {
    await open(page);
    await expect(shown(page, "$479.64")).toHaveCSS("color", RAUSCH);
    await expect(page.getByRole("link", { name: "Site" })).not.toHaveCSS("border-bottom-color", RAUSCH);
  });

  test("AC-46 limits gray to suffixes and the sample note", async ({ page }) => {
    await open(page);
    await expect(page.getByText("percent per year").first()).toHaveCSS("color", MUTE);
    await expect(page.getByText("These entries start as a sample, not a forecast.")).toHaveCSS("color", MUTE);
    expect.soft(
      await page.getByText("Same numbers, in the currency you pick. No exchange rate.").evaluate((element) => getComputedStyle(element).color),
    ).not.toBe(MUTE);
    expect.soft(
      await page.getByRole("link", { name: "Storybook" }).evaluate((element) => getComputedStyle(element).color),
    ).not.toBe(MUTE);
  });

  test("AC-47 defaults the currency to USD", async ({ page }) => {
    await open(page);
    await expect(page.getByLabel("Currency")).toHaveValue("USD");
    await expect(page.getByText("USD per month")).toBeVisible();
    await expect(page.getByText("Figures are nominal USD.")).toBeVisible();
  });

  test("AC-48 relabels EUR without converting the amount", async ({ page }) => {
    await open(page);
    await page.getByLabel("Currency").selectOption("EUR");
    await expect(shown(page, "€479.64")).toHaveCount(1);
    await expect(shown(page, "€44,597")).toHaveCount(1);
    await expect(page.getByText("$44,597")).toHaveCount(0);
    await expect(page.getByText("EUR per month")).toBeVisible();
    await expect(page.getByText("Figures are nominal EUR.")).toBeVisible();
  });

  test("AC-49 rounds the JPY payment to yen and keeps the whole-dollar rent", async ({ page }) => {
    await open(page);
    await page.getByLabel("Currency").selectOption("JPY");
    await expect(shown(page, "¥480")).toHaveCount(1);
    await expect(shown(page, "¥44,597")).toHaveCount(1);
  });

  test("AC-50 states the model in a bulleted list", async ({ page }) => {
    await open(page);
    const section = page.locator("section").filter({ has: page.locator("#assumptions-title") });
    await expect(section.locator("ol")).toHaveCount(0);
    await expect(section.locator("ul")).toBeVisible();
    const text = await section.innerText();
    expect(text).toContain("Figures are nominal USD.");
    expect(text).toContain("At a 0% rate the payment is the loan divided by the number of months.");
    expect(text).toContain("After payoff the mortgage payment is zero.");
    expect(text).toContain("one twelfth");
    expect(text).toContain("Equity is the grown value minus the remaining principal.");
    expect(text).toContain("The horizon is at least 20 years, at most 40");
    expect(text).toContain("The table shows years 5, 10, and 20.");
    expect(text).toContain("Break-even is the first year owning net worth is at least renting net worth.");
    expect(text).toContain("PMI, HOA fees, closing costs, selling costs, and tax deductions are left out.");
  });

  test("AC-51 points Storybook at this host on port 6006", async ({ page }) => {
    await open(page);
    await expect(page.getByRole("link", { name: "Site" })).toHaveAttribute("aria-current", "page");
    await expect(page.getByRole("link", { name: "Storybook" })).toHaveAttribute(
      "href",
      "http://127.0.0.1:6006/?site=http%3A%2F%2F127.0.0.1%3A5173%2F",
    );
  });

  test("AC-52 keeps the Storybook host when scripts are off", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/");
    const href = await page.getByRole("link", { name: "Storybook" }).getAttribute("href");
    expect(href).toContain("127.0.0.1:6006");
    expect(href).not.toContain("localhost");
    await context.close();
  });

  test("AC-53 renders the sample before JavaScript runs", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Rent or Buy? Let the numbers decide.");
    await expect(shown(page, "$479.64")).toHaveCount(1);
    await expect(shown(page, "$44,597")).toHaveCount(1);
    await context.close();
  });

  test("AC-54 loads the linked stylesheets", async ({ page }) => {
    await open(page);
    const hrefs = await page.locator('link[rel="stylesheet"]').evaluateAll((links) =>
      links.map((link) => (link as HTMLLinkElement).href),
    );
    expect(hrefs.length).toBeGreaterThanOrEqual(2);
    for (const href of hrefs) {
      const response = await page.request.get(href);
      expect(response.ok(), href).toBe(true);
    }
  });

  test("AC-55 loads the sample without console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") {
        errors.push(message.text());
      }
    });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(errors.filter((error) => !/favicon/i.test(error))).toEqual([]);
  });

  test("AC-56 gives every in-page hash a target", async ({ page }) => {
    await open(page);
    const hashes = await page.locator('a[href^="#"]').evaluateAll((links) =>
      links.map((link) => link.getAttribute("href") ?? ""),
    );
    expect(hashes.length).toBeGreaterThan(0);
    for (const hash of hashes) {
      await expect(page.locator(hash)).toHaveCount(1);
    }
  });

  test("AC-57 keeps the headline line-height at least 1", async ({ page }) => {
    await open(page);
    const ratio = await page.getByRole("heading", { level: 1 }).evaluate((element) => {
      const style = getComputedStyle(element);
      return Number.parseFloat(style.lineHeight) / Number.parseFloat(style.fontSize);
    });
    expect(ratio).toBeGreaterThanOrEqual(1);
  });

  test("AC-58 keeps atomic stages and a React-free comparison module", () => {
    for (const stage of ["atoms", "molecules", "organisms", "templates"]) {
      expect(statSync(join(siteRoot, "app/components", stage)).isDirectory()).toBe(true);
    }
    expect(existsSync(join(siteRoot, "app/routes/_index.tsx"))).toBe(true);
    const source = readFileSync(join(siteRoot, "app/lib/compare.ts"), "utf8");
    expect(source).not.toMatch(/from\s+["']react["']/);
    const exported = [
      ...source.matchAll(/^\s*export\s+(?:async\s+)?(?:function|class|const|type|interface|enum)\s+/gm),
    ];
    expect(exported.length).toBeLessThanOrEqual(8);
    expect(exported.length).toBeGreaterThan(0);
  });
});
