// npm run test:run -- src/app/top/logout-action.test.ts
// npm run test:coverage -- --coverage.include='src/app/top/logout-action.ts' src/app/top/logout-action.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import { logoutAction } from "./logout-action";
import { createClient } from "@/lib/supabase/server";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

describe("logoutAction", () => {
  const signOut = vi.fn().mockResolvedValue({ error: null });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createClient).mockResolvedValue({
      auth: { signOut },
    } as never);
  });

  it("signOut を呼ぶ", async () => {
    await logoutAction();

    expect(createClient).toHaveBeenCalledOnce();
    expect(signOut).toHaveBeenCalledOnce();
  });
});
