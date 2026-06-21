// npm run test:run -- src/lib/utils.test.ts
// npm run test:coverage -- --coverage.include='src/lib/utils.ts' src/lib/utils.test.ts
import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("クラス名をマージする", () => {
    expect(cn("px-2", "py-1")).toBe("px-2 py-1");
    expect(cn("px-2", false && "hidden", "block")).toBe("px-2 block");
  });
});
