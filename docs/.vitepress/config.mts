import { defineConfig } from "vitepress";

const repo = "https://github.com/TOMON-9912/cooking-recipe";

/**
 * VitePress 設定。docs/ の新ディレクトリ構成に合わせたナビ・サイドバー。
 */
export default defineConfig({
  title: "食卓手帖 Docs",
  description: "食卓手帖（cooking-recipe）の設計・実装・運用ドキュメント",
  lang: "ja-JP",
  lastUpdated: true,
  cleanUrls: true,
  srcExclude: [
    "**/04_application/source-index/_template.md",
    "**/90_workspace/**",
  ],
  ignoreDeadLinks: true,
  markdown: {
    lineNumbers: true,
  },
  themeConfig: {
    logo: { text: "食卓手帖" },
    nav: [
      { text: "Architecture", link: "/01_architecture/overview" },
      { text: "Domain", link: "/02_domain/overview" },
      { text: "Development", link: "/08_development/setup" },
      { text: "Decisions", link: "/09_decisions/001-authentication" },
      { text: "リポジトリ", link: repo },
    ],
    sidebar: {
      "/01_architecture/": [
        {
          text: "Architecture",
          items: [
            { text: "Overview", link: "/01_architecture/overview" },
            { text: "Data flow", link: "/01_architecture/data-flow" },
            { text: "System context", link: "/01_architecture/system-context" },
          ],
        },
      ],
      "/02_domain/": [
        {
          text: "Domain",
          items: [
            { text: "Overview", link: "/02_domain/overview" },
            { text: "Recipe", link: "/02_domain/recipe" },
            { text: "User", link: "/02_domain/user" },
          ],
        },
      ],
      "/03_database/": [
        {
          text: "Database",
          items: [
            { text: "ER 概要", link: "/03_database/er-diagram" },
            { text: "Storage セキュリティ", link: "/03_database/storage-security" },
            { text: "PostgreSQL 型", link: "/03_database/postgresql-types-and-settings" },
            { text: "Tables 一覧", link: "/03_database/tables/README" },
            { text: "recipes", link: "/03_database/tables/recipes" },
            { text: "users (profiles)", link: "/03_database/tables/users" },
            { text: "families", link: "/03_database/tables/families" },
            { text: "family_members", link: "/03_database/tables/family_members" },
            { text: "accessible_recipe_ids", link: "/03_database/tables/accessible_recipe_ids" },
            { text: "recipe_summaries", link: "/03_database/tables/recipe_summaries" },
          ],
        },
      ],
      "/04_application/": [
        {
          text: "Application",
          items: [
            { text: "Use cases", link: "/04_application/use-cases" },
            { text: "レシピ更新", link: "/04_application/recipes/update-recipe" },
            { text: "Auth callback", link: "/04_application/auth/email-confirmation-callback" },
            { text: "ゲストログイン", link: "/04_application/guest/guest-login" },
            { text: "ゲスト削除", link: "/04_application/guest/guest-cleanup-batch" },
            { text: "プロフィール作成", link: "/04_application/profile/create-profile" },
            { text: "家族作成", link: "/04_application/family/create-family" },
            { text: "家族概要", link: "/04_application/family/get-family-overview" },
            { text: "ソース index", link: "/04_application/source-index/README" },
          ],
        },
      ],
      "/05_api/": [
        {
          text: "API",
          items: [
            { text: "Overview", link: "/05_api/overview" },
            { text: "Recipes", link: "/05_api/recipes" },
          ],
        },
      ],
      "/06_ui/": [
        {
          text: "UI",
          items: [
            { text: "Screen flow", link: "/06_ui/screen-flow" },
            { text: "ゲストログイン", link: "/06_ui/screens/guest-login" },
            { text: "レシピ検索", link: "/06_ui/screens/recipe-search" },
            { text: "キーワード検索", link: "/06_ui/screens/recipe-search-keyword" },
          ],
        },
      ],
      "/07_testing/": [
        {
          text: "Testing",
          items: [
            { text: "Strategy", link: "/07_testing/strategy" },
            { text: "Test scope", link: "/07_testing/test-scope" },
            { text: "E2E Playwright", link: "/07_testing/e2e-playwright" },
            { text: "Incident: 家族 RLS", link: "/07_testing/incidents/family-create-rls-select" },
          ],
        },
      ],
      "/08_development/": [
        {
          text: "Development",
          items: [
            { text: "Setup", link: "/08_development/setup" },
            { text: "Conventions", link: "/08_development/conventions" },
            { text: "Git workflow", link: "/08_development/git-branch-workflow" },
            { text: "Deploy", link: "/08_development/deploy-vercel-supabase" },
            { text: "GitHub Actions", link: "/08_development/github-actions-workflow" },
            { text: "ESLint", link: "/08_development/eslint-clean-architecture" },
            { text: "VitePress", link: "/08_development/vitepress" },
            { text: "ゲスト削除運用", link: "/08_development/guest-cleanup-batch-operations" },
            { text: "Tip: Auth callback", link: "/08_development/tips/email-confirmation-and-auth-callback" },
            { text: "Tip: Storage 画像", link: "/08_development/tips/image-upload-with-supabase-storage" },
          ],
        },
      ],
      "/09_decisions/": [
        {
          text: "Decisions (ADR)",
          items: [
            { text: "001 Authentication", link: "/09_decisions/001-authentication" },
            { text: "002 Image storage", link: "/09_decisions/002-image-storage" },
            { text: "003 Architecture", link: "/09_decisions/003-architecture" },
            { text: "004 Supabase", link: "/09_decisions/004-supabase" },
            { text: "005 Vercel", link: "/09_decisions/005-vercel" },
            { text: "006 Playwright", link: "/09_decisions/006-playwright" },
            { text: "007 Family", link: "/09_decisions/007-family-feature" },
            { text: "008 RLS helpers", link: "/09_decisions/008-rls-helper-functions" },
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
});
