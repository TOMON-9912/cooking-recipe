import { describe, expect, it } from "vitest";
import { isNavigationPending } from "./LoadingOverlay";

describe("isNavigationPending", () => {
    it("リンクを押した画面にいるあいだは待ち", () => {
        expect(isNavigationPending({ from: "/", to: "/login" }, "/")).toBe(true);
    });

    it("リンク先に着いたら待ちを終える", () => {
        expect(isNavigationPending({ from: "/", to: "/login" }, "/login")).toBe(
            false,
        );
    });

    it("ログイン後に別の画面へ移っても待ちを続けない", () => {
        expect(isNavigationPending({ from: "/", to: "/login" }, "/top")).toBe(
            false,
        );
    });
});
