import { defineConfig } from "vitepress";
import { withMermaid } from "vitepress-plugin-mermaid";

const repo = "https://github.com/TOMON-9912/cooking-recipe";

/**
 * VitePress 設定。docs/ の新ディレクトリ構成に合わせたナビ・サイドバー。
 * ```mermaid フェンスは withMermaid が描画する。ER 図は <ErDiagram> のまま。
 */
export default withMermaid(
  defineConfig({
  title: "食卓手帖 Docs",
  description: "食卓手帖（cooking-recipe）の設計・実装・運用ドキュメント",
  lang: "ja-JP",
  lastUpdated: true,
  cleanUrls: true,
  srcExclude: [
    "**/01_requirements/_template.md",
    "**/03_test/design/_template.md",
    "**/02_design/application/source-index/_template.md",
    "**/02_design/application/_template.md",
    "**/02_design/domain/_template.md",
    "**/02_design/database/tables/_template.md",
    "**/02_design/ui/screens/_template.md",
    "**/04_decisions/_template.md",
    "**/90_workspace/**",
  ],
  ignoreDeadLinks: true,
  markdown: {
    lineNumbers: true,
  },
  mermaid: {},
  vite: {
    optimizeDeps: {
      include: ["mermaid"],
    },
    ssr: {
      noExternal: ["mermaid"],
    },
  },
  themeConfig: {
    logo: { text: "食卓手帖" },
    nav: [
      { text: "Requirements", link: "/01_requirements/README" },
      {
        text: "Design",
        items: [
          { text: "Architecture", link: "/02_design/architecture/overview" },
          { text: "Domain", link: "/02_design/domain/overview" },
          { text: "Database", link: "/02_design/database/er-diagram" },
          { text: "Application", link: "/02_design/application/use-cases" },
          { text: "API", link: "/02_design/api/overview" },
          { text: "UI", link: "/02_design/ui/screen-flow" },
        ],
      },
      { text: "Test", link: "/03_test/strategy" },
      { text: "Decisions", link: "/04_decisions/001-architecture" },
      { text: "Development", link: "/05_development/setup" },
      { text: "リポジトリ", link: repo },
    ],
    sidebar: {
      "/01_requirements/": [
        {
          text: "Requirements",
          items: [
            { text: "要件定義の書き方", link: "/01_requirements/README" },
          ],
        },
      ],
      "/02_design/architecture/": [
        {
          text: "Architecture",
          items: [
            { text: "Overview", link: "/02_design/architecture/overview" },
            { text: "Data flow", link: "/02_design/architecture/data-flow" },
            { text: "System context", link: "/02_design/architecture/system-context" },
          ],
        },
      ],
      "/02_design/domain/": [
        {
          text: "Domain",
          items: [
            { text: "Overview", link: "/02_design/domain/overview" },
            { text: "設計書の書き方", link: "/02_design/domain/writing-guide" },
            { text: "Recipe", link: "/02_design/domain/recipe" },
            { text: "User", link: "/02_design/domain/user" },
            { text: "Family", link: "/02_design/domain/family" },
            { text: "Favorite", link: "/02_design/domain/favorite" },
          ],
        },
      ],
      "/02_design/database/": [
        {
          text: "Database",
          items: [
            { text: "ER 概要", link: "/02_design/database/er-diagram" },
            { text: "Storage セキュリティ", link: "/02_design/database/storage-security" },
            { text: "PostgreSQL 型", link: "/02_design/database/postgresql-types-and-settings" },
            { text: "Tables 一覧", link: "/02_design/database/tables/README" },
            { text: "profiles", link: "/02_design/database/tables/profiles" },
            { text: "families", link: "/02_design/database/tables/families" },
            { text: "family_members", link: "/02_design/database/tables/family_members" },
            { text: "recipes", link: "/02_design/database/tables/recipes" },
            { text: "categories", link: "/02_design/database/tables/categories" },
            { text: "ingredients", link: "/02_design/database/tables/ingredients" },
            { text: "recipe_categories", link: "/02_design/database/tables/recipe_categories" },
            { text: "recipe_ingredients", link: "/02_design/database/tables/recipe_ingredients" },
            { text: "recipe_instructions", link: "/02_design/database/tables/recipe_instructions" },
            { text: "recipe_favorites", link: "/02_design/database/tables/recipe_favorites" },
            { text: "accessible_recipe_ids (view)", link: "/02_design/database/tables/accessible_recipe_ids" },
            { text: "recipe_summaries (view)", link: "/02_design/database/tables/recipe_summaries" },
          ],
        },
      ],
      "/02_design/application/": [
        {
          text: "Application",
          items: [
            { text: "Use cases", link: "/02_design/application/use-cases" },
            { text: "レシピ作成", link: "/02_design/application/recipes/create-recipe" },
            { text: "レシピ更新", link: "/02_design/application/recipes/update-recipe" },
            { text: "レシピ詳細取得", link: "/02_design/application/recipes/get-recipe-detail" },
            { text: "レシピ一覧取得", link: "/02_design/application/recipes/get-recipe-summaries" },
            { text: "レシピ検索", link: "/02_design/application/recipes/search-recipe-summaries" },
            { text: "お気に入り切替", link: "/02_design/application/recipes/toggle-favorite" },
            { text: "サムネイル", link: "/02_design/application/recipes/upload-recipe-thumbnail" },
            { text: "ログイン", link: "/02_design/application/auth/login" },
            { text: "サインアップ", link: "/02_design/application/auth/signup" },
            { text: "ログアウト", link: "/02_design/application/auth/logout" },
            { text: "Auth callback", link: "/02_design/application/auth/email-confirmation-callback" },
            { text: "ゲストログイン", link: "/02_design/application/guest/guest-login" },
            { text: "ゲスト削除", link: "/02_design/application/guest/guest-cleanup-batch" },
            { text: "プロフィール作成", link: "/02_design/application/profile/create-profile" },
            { text: "家族作成", link: "/02_design/application/family/create-family" },
            { text: "家族概要", link: "/02_design/application/family/get-family-overview" },
            { text: "ソース index", link: "/02_design/application/source-index/README" },
          ],
        },
      ],
      "/02_design/api/": [
        {
          text: "API",
          items: [
            { text: "Overview", link: "/02_design/api/overview" },
            { text: "Recipes", link: "/02_design/api/recipes" },
          ],
        },
      ],
      "/02_design/ui/": [
        {
          text: "UI",
          items: [
            { text: "Screen flow", link: "/02_design/ui/screen-flow" },
            { text: "LP", link: "/02_design/ui/screens/lp" },
            { text: "ログイン", link: "/02_design/ui/screens/login" },
            { text: "ゲストログイン", link: "/02_design/ui/screens/guest-login" },
            { text: "サインアップ", link: "/02_design/ui/screens/signup" },
            { text: "プロフィール作成", link: "/02_design/ui/screens/profile-new" },
            { text: "ホーム", link: "/02_design/ui/screens/top" },
            { text: "家族", link: "/02_design/ui/screens/family" },
            { text: "レシピ作成", link: "/02_design/ui/screens/recipe-new" },
            { text: "レシピ詳細", link: "/02_design/ui/screens/recipe-detail" },
            { text: "レシピ編集", link: "/02_design/ui/screens/recipe-edit" },
            { text: "レシピ検索", link: "/02_design/ui/screens/recipe-search" },
            { text: "キーワード検索", link: "/02_design/ui/screens/recipe-search-keyword" },
          ],
        },
      ],
      "/03_test/": [
        {
          text: "Test",
          items: [
            { text: "Strategy", link: "/03_test/strategy" },
            { text: "Test scope", link: "/03_test/test-scope" },
            { text: "E2E Playwright", link: "/03_test/e2e-playwright" },
            { text: "Incident: 家族 RLS", link: "/03_test/incidents/family-create-rls-select" },
          ],
        },
        {
          text: "Test design",
          items: [
            { text: "テスト設計の一覧", link: "/03_test/design/README" },
            { text: "レシピ作成", link: "/03_test/design/recipes/create-recipe" },
            { text: "レシピ詳細取得", link: "/03_test/design/recipes/get-recipe-detail" },
            { text: "レシピ一覧取得", link: "/03_test/design/recipes/get-recipe-summaries" },
            { text: "レシピ検索", link: "/03_test/design/recipes/search-recipe-summaries" },
            { text: "お気に入り切替", link: "/03_test/design/recipes/toggle-favorite" },
            { text: "サムネイル", link: "/03_test/design/recipes/upload-recipe-thumbnail" },
            { text: "ログイン", link: "/03_test/design/auth/login" },
            { text: "サインアップ", link: "/03_test/design/auth/signup" },
            { text: "ログアウト", link: "/03_test/design/auth/logout" },
          ],
        },
      ],
      "/05_development/": [
        {
          text: "Development",
          items: [
            { text: "Setup", link: "/05_development/setup" },
            { text: "Conventions", link: "/05_development/conventions" },
            { text: "Issue 起点の開発", link: "/05_development/issue-workflow" },
            { text: "Git workflow", link: "/05_development/git-branch-workflow" },
            { text: "Deploy", link: "/05_development/deploy-vercel-supabase" },
            { text: "GitHub Actions", link: "/05_development/github-actions-workflow" },
            { text: "ESLint", link: "/05_development/eslint-clean-architecture" },
            { text: "VitePress", link: "/05_development/vitepress" },
            { text: "ゲスト削除運用", link: "/05_development/guest-cleanup-batch-operations" },
            { text: "Tip: Auth callback", link: "/05_development/tips/email-confirmation-and-auth-callback" },
            { text: "Tip: Storage 画像", link: "/05_development/tips/image-upload-with-supabase-storage" },
          ],
        },
      ],
      "/04_decisions/": [
        {
          text: "Decisions (ADR)",
          items: [
            { text: "001 Next.js", link: "/04_decisions/001-architecture" },
            { text: "002 Supabase", link: "/04_decisions/002-supabase" },
            { text: "003 Vercel", link: "/04_decisions/003-vercel" },
            { text: "004 Playwright", link: "/04_decisions/004-playwright" },
            { text: "005 家族機能", link: "/04_decisions/005-family-feature" },
            { text: "006 RLS ヘルパー", link: "/04_decisions/006-rls-helper-functions" },
            { text: "007 ゲストログイン", link: "/04_decisions/007-guest-login" },
            { text: "008 画像保存先", link: "/04_decisions/008-image-storage" },
            { text: "009 AI 開発ハーネス", link: "/04_decisions/009-ai-dev-harness" },
            { text: "010 Issue 起点フロー", link: "/04_decisions/010-issue-centered-dev-flow" },
            { text: "012 要件定義を設計の前に", link: "/04_decisions/012-requirements-before-design" },
            { text: "013 プロセスごとの Issue", link: "/04_decisions/013-issue-per-process" },
          ],
        },
      ],
    },
    socialLinks: [{ icon: "github", link: repo }],
    footer: {
      message: "食卓手帖 — ドキュメント",
      copyright: "MIT",
    },
    search: {
      provider: "local",
    },
  },
}),
);
