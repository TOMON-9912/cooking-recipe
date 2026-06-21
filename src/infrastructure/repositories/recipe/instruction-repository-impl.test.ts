// npm run test:run -- src/infrastructure/repositories/recipe/instruction-repository-impl.test.ts
// npm run test:coverage -- --coverage.include='src/infrastructure/repositories/recipe/instruction-repository-impl.ts' src/infrastructure/repositories/recipe/instruction-repository-impl.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAuthedClient } from "@/lib/supabase/server";
import { saveInstructions } from "./instruction-repository-impl";
import { createQueryBuilder } from "@/test-utils/supabase-mock";

vi.mock("@/lib/supabase/server", () => ({
  createAuthedClient: vi.fn(),
}));

describe("instruction-repository-impl", () => {
  beforeEach(() => vi.clearAllMocks());

  it("saveInstructions は insert を呼ぶ", async () => {
    const builder = createQueryBuilder({ data: null, error: null });
    vi.mocked(createAuthedClient).mockResolvedValue({
      supabase: { from: vi.fn().mockReturnValue(builder) } as never,
      user: { id: "user-1" } as never,
    });

    await saveInstructions("recipe-1", [
      { stepNumber: 1, description: "切る", imageUrl: "http://img" },
    ]);

    expect(builder.insert).toHaveBeenCalledWith([
      {
        recipe_id: "recipe-1",
        step_number: 1,
        description: "切る",
        image_url: "http://img",
      },
    ]);
  });

  it("imageUrl 未指定時は null を insert する", async () => {
    const builder = createQueryBuilder({ data: null, error: null });
    vi.mocked(createAuthedClient).mockResolvedValue({
      supabase: { from: vi.fn().mockReturnValue(builder) } as never,
      user: { id: "user-1" } as never,
    });

    await saveInstructions("recipe-1", [{ stepNumber: 1, description: "切る" }]);

    expect(builder.insert).toHaveBeenCalledWith([
      {
        recipe_id: "recipe-1",
        step_number: 1,
        description: "切る",
        image_url: null,
      },
    ]);
  });

  it("DB エラー時は throw する", async () => {
    const builder = createQueryBuilder({
      data: null,
      error: new Error("db error"),
    });
    vi.mocked(createAuthedClient).mockResolvedValue({
      supabase: { from: vi.fn().mockReturnValue(builder) } as never,
      user: { id: "user-1" } as never,
    });

    await expect(saveInstructions("recipe-1", [])).rejects.toThrow("db error");
  });
});
