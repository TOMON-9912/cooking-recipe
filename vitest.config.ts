import { defineConfig } from "vitest/config";
import path from "path";

const coverageInclude = [
  "src/usecase/**/*.ts",
  "src/utils/**/*.ts",
  "src/infrastructure/**/*.ts",
  "src/app/**/*.ts",
  "src/lib/**/*.ts",
];

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: coverageInclude,
      exclude: [
        "src/**/*.test.ts",
        "src/**/*.test.tsx",
        "src/**/*-deps-for-test.ts",
        "src/test-utils/**",
      ],
      thresholds: {
        lines: 80,
        branches: 80,
        functions: 80,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
