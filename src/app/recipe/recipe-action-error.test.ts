// npm run test:run -- src/app/recipe/recipe-action-error.test.ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { toRecipeErrorMessage } from "./recipe-action-error";

describe("toRecipeErrorMessage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("既知のコードは表示用メッセージにする", () => {
    expect(
      toRecipeErrorMessage(new Error("RECIPE_UPDATE_FORBIDDEN"), "fallback"),
    ).toBe("このレシピを編集する権限がありません");
  });

  it("認証切れはセッションのメッセージにする", () => {
    expect(toRecipeErrorMessage(new Error("UNAUTHORIZED"), "fallback")).toBe(
      "セッションが見つかりません。再度ログインしてください",
    );
  });

  it("未知の Error は内部メッセージを出さずログに残す", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const error = new Error(
      'JSON object requested, multiple (or no) rows returned',
    );

    expect(toRecipeErrorMessage(error, "レシピの更新に失敗しました")).toBe(
      "レシピの更新に失敗しました",
    );
    expect(consoleError).toHaveBeenCalledWith("recipe action failed", error);
  });

  it("Error 以外も fallback を返す", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    expect(toRecipeErrorMessage("unexpected", "レシピの登録に失敗しました")).toBe(
      "レシピの登録に失敗しました",
    );
  });
});
