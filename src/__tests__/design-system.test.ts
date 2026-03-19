import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Design System — CSS Tokens", () => {
  const cssContent = fs.readFileSync(
    path.resolve(__dirname, "../app/globals.css"),
    "utf8"
  );

  it("defines primary color palette", () => {
    expect(cssContent).toContain("--color-primary:");
    expect(cssContent).toContain("--color-primary-dark:");
    expect(cssContent).toContain("--color-primary-light:");
    expect(cssContent).toContain("--color-primary-50:");
  });

  it("defines accent (red) color palette", () => {
    expect(cssContent).toContain("--color-accent:");
    expect(cssContent).toContain("--color-accent-dark:");
    expect(cssContent).toContain("--color-accent-light:");
  });

  it("defines neutral surface tokens", () => {
    expect(cssContent).toContain("--color-surface:");
    expect(cssContent).toContain("--color-surface-alt:");
    expect(cssContent).toContain("--color-border:");
    expect(cssContent).toContain("--color-border-light:");
  });

  it("defines semantic tokens (success, warning)", () => {
    expect(cssContent).toContain("--color-success:");
    expect(cssContent).toContain("--color-success-light:");
    expect(cssContent).toContain("--color-warning:");
    expect(cssContent).toContain("--color-warning-light:");
  });

  it("defines shadow tokens", () => {
    expect(cssContent).toContain("--shadow-card:");
    expect(cssContent).toContain("--shadow-elevated:");
  });

  it("references Outfit font family", () => {
    expect(cssContent).toContain("--font-outfit:");
    expect(cssContent).toContain("Outfit");
  });

  it("sets body bg to surface-alt and custom font", () => {
    expect(cssContent).toContain("background: var(--color-surface-alt)");
    expect(cssContent).toContain("font-family: var(--font-outfit)");
  });

  it("has focus-visible ring with primary color", () => {
    expect(cssContent).toContain(":focus-visible");
    expect(cssContent).toContain("var(--color-primary)");
  });
});
