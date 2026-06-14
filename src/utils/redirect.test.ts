// npm run test:run -- src/utils/redirect.test.ts
// npm run test:coverage -- --coverage.include='src/utils/redirect.ts' src/utils/redirect.test.ts
import { describe, expect, it } from "vitest";
import { isRedirectError } from "./redirect";

describe("isRedirectError", () => {
  it("null や文字列は false", () => {
    expect(isRedirectError(null)).toBe(false);
    expect(isRedirectError("error")).toBe(false);
  });

  it("digest がないオブジェクトは false", () => {
    expect(isRedirectError({ message: "error" })).toBe(false);
  });

  it("digest が NEXT_REDIRECT で始まる場合は true", () => {
    expect(isRedirectError({ digest: "NEXT_REDIRECT;/top" })).toBe(true);
  });

  it("digest が NEXT_REDIRECT 以外は false", () => {
    expect(isRedirectError({ digest: "OTHER_ERROR" })).toBe(false);
  });
});
