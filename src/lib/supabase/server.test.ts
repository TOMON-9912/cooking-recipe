// npm run test:run -- src/lib/supabase/server.test.ts
// npm run test:coverage -- --coverage.include='src/lib/supabase/server.ts' src/lib/supabase/server.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAuthedClient, createClient } from "./server";

const mockGetUser = vi.fn();
const mockCreateServerClient = vi.fn();

vi.mock("@supabase/ssr", () => ({
  createServerClient: (...args: unknown[]) => mockCreateServerClient(...args),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn((name: string) =>
      name === "sb-token" ? { value: "token-value" } : undefined,
    ),
    set: vi.fn(),
  }),
}));

describe("supabase/server", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
    mockCreateServerClient.mockReturnValue({
      auth: { getUser: mockGetUser },
    });
  });

  it("createClient は cookie ハンドラ付きクライアントを返す", async () => {
    const client = await createClient();

    expect(client).toBeDefined();
    expect(mockCreateServerClient).toHaveBeenCalledOnce();

    const cookieHandlers = mockCreateServerClient.mock.calls[0][2].cookies;
    expect(cookieHandlers.get("sb-token")).toBe("token-value");
    expect(() => cookieHandlers.set("a", "b", {})).not.toThrow();
    expect(() => cookieHandlers.remove("a", {})).not.toThrow();
  });

  it("createAuthedClient は user 付きで返す", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });

    const { user, supabase } = await createAuthedClient();

    expect(user.id).toBe("user-1");
    expect(supabase).toBeDefined();
  });

  it("createAuthedClient は未認証なら UNAUTHORIZED", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    await expect(createAuthedClient()).rejects.toThrow("UNAUTHORIZED");
  });

  it("createAuthedClient は getUser エラーなら UNAUTHORIZED", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: new Error("auth error"),
    });

    await expect(createAuthedClient()).rejects.toThrow("UNAUTHORIZED");
  });
});
