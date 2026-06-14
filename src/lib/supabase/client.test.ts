// npm run test:run -- src/lib/supabase/client.test.ts
// npm run test:coverage -- --coverage.include='src/lib/supabase/client.ts' src/lib/supabase/client.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createClient } from "./client";

const mockCreateBrowserClient = vi.fn();

vi.mock("@supabase/ssr", () => ({
  createBrowserClient: (...args: unknown[]) => mockCreateBrowserClient(...args),
}));

describe("supabase/client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
    mockCreateBrowserClient.mockReturnValue({ auth: {} });
  });

  it("createClient はブラウザ用クライアントを返す", () => {
    const client = createClient();

    expect(client).toBeDefined();
    expect(mockCreateBrowserClient).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "anon-key",
    );
  });
});
