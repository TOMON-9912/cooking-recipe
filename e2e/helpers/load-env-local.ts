import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Playwright 実行時に `.env.local` を process.env へ読み込む。
 * 未設定のキーのみ上書きしない。
 */
export function loadEnvLocal(): void {
    const path = resolve(process.cwd(), ".env.local");
    if (!existsSync(path)) {
        return;
    }

    for (const line of readFileSync(path, "utf8").split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) {
            continue;
        }

        const separatorIndex = trimmed.indexOf("=");
        if (separatorIndex === -1) {
            continue;
        }

        const key = trimmed.slice(0, separatorIndex).trim();
        const rawValue = trimmed.slice(separatorIndex + 1).trim();
        const value = rawValue.replace(/^["']|["']$/g, "");

        if (!(key in process.env)) {
            process.env[key] = value;
        }
    }
}
