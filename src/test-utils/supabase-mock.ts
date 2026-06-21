import { vi } from "vitest";

export type QueryResult = { data: unknown; error: unknown };

export function createQueryBuilder(result: QueryResult) {
  const builder: Record<string, unknown> = {};
  const chainMethods = ["select", "eq", "in", "delete"] as const;

  for (const method of chainMethods) {
    builder[method] = vi.fn(() => builder);
  }

  builder.order = vi.fn(() => Promise.resolve(result));
  builder.single = vi.fn(() => Promise.resolve(result));
  builder.maybeSingle = vi.fn(() => Promise.resolve(result));
  builder.insert = vi.fn(() => builder);
  builder.then = (
    onFulfilled?: (value: QueryResult) => unknown,
    onRejected?: (reason: unknown) => unknown,
  ) => Promise.resolve(result).then(onFulfilled, onRejected);

  return builder;
}

export function createMockAuthedClient(
  tableResults: Record<string, QueryResult>,
  rpcImpl?: (name: string) => QueryResult,
) {
  const supabase = {
    from: vi.fn((table: string) =>
      createQueryBuilder(tableResults[table] ?? { data: null, error: null }),
    ),
    rpc: vi.fn((name: string) =>
      Promise.resolve(rpcImpl?.(name) ?? { data: null, error: null }),
    ),
    auth: {
      signOut: vi.fn().mockResolvedValue({ error: null }),
      getUser: vi.fn(),
    },
  };

  return {
    supabase,
    user: { id: "user-1", email: "test@example.com" },
  };
}
