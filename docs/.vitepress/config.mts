import { defineConfig } from "vitepress";

const repo = "https://github.com/TOMON-9912/cooking-recipe";

/**
 * VitePress のサイト設定。
 * 既存の docs/ ツリーをそのままソースにし、セクションごとにサイドバーを分ける。
 */
export default defineConfig({
  title: "食卓手帖 Docs",
  description: "食卓手帖（cooking-recipe）の設計・実装・運用ドキュメント",
  lang: "ja-JP",
  lastUpdated: true,
  cleanUrls: true,
  srcExclude: ["**/index/_template.md"],
  ignoreDeadLinks: true,
  markdown: {
    lineNumbers: true,
  },
  themeConfig: {
    logo: { text: "食卓手帖" },
    nav: [
      { text: "ガイド", link: "/guides/README" },
      { text: "設計", link: "/design/README" },
      { text: "実装", link: "/implementation/recipe/update-recipe" },
      { text: "ADR", link: "/adr/01-Next.js" },
      {
        text: "リポジトリ",
        link: repo,
      },
    ],
    sidebar: {
      "/guides/": [
        {
          text: "手順書",
          items: [
            { text: "一覧", link: "/guides/README" },
            { text: "VitePress（このサイト）", link: "/guides/vitepress" },
            { text: "Git ブランチ運用", link: "/guides/git-branch-workflow" },
            {
              text: "Supabase ローカル開発",
              link: "/guides/supabase-local-dev-with-docker",
            },
            { text: "GitHub Actions (CI)", link: "/guides/github-actions-workflow" },
            { text: "ESLint / クリーンアーキ", link: "/guides/eslint-clean-architecture" },
            { text: "E2E (Playwright)", link: "/guides/e2e-testing-with-playwright" },
            { text: "Vercel + Supabase デプロイ", link: "/guides/deploy-vercel-supabase" },
            {
              text: "ゲスト削除バッチ運用",
              link: "/guides/guest-cleanup-batch-operations",
            },
          ],
        },
      ],
      "/adr/": [
        {
          text: "Architecture Decision Records",
          items: [
            { text: "01 Next.js", link: "/adr/01-Next.js" },
            { text: "02 Supabase", link: "/adr/02-Supabase" },
            { text: "03 Vercel", link: "/adr/03-Vercel" },
            { text: "04 Playwright", link: "/adr/04-Playwright" },
            { text: "05 家族機能", link: "/adr/05-family-feature" },
            { text: "06 RLS ヘルパー", link: "/adr/06-rls-helper-functions" },
            { text: "07 ゲストログイン", link: "/adr/07-guest-login" },
            { text: "08 画像 Storage", link: "/adr/08-image-storage" },
          ],
        },
      ],
      "/architect/": [
        {
          text: "アーキテクチャ",
          items: [
            { text: "一覧", link: "/architect/README" },
            {
              text: "クリーンアーキテクチャ",
              link: "/architect/clean-architecture-and-directory",
            },
            {
              text: "Storage 画像セキュリティ",
              link: "/architect/supabase-storage-image-security",
            },
          ],
        },
      ],
      "/design/": [
        {
          text: "設計書",
          items: [
            { text: "一覧", link: "/design/README" },
            { text: "ゲストログイン", link: "/design/ゲストログイン-設計書" },
            { text: "レシピ検索画面", link: "/design/レシピ検索画面-設計書" },
            {
              text: "レシピ検索キーワード",
              link: "/design/レシピ検索-キーワードマッチング設計",
            },
          ],
        },
      ],
      "/implementation/": [
        {
          text: "実装メモ",
          items: [
            { text: "Auth callback", link: "/implementation/auth/email-confirmation-callback" },
            { text: "プロフィール作成", link: "/implementation/profile/create-profile" },
            { text: "家族作成", link: "/implementation/family/create-family" },
            { text: "家族概要取得", link: "/implementation/family/get-family-overview" },
            { text: "ゲストログイン", link: "/implementation/guest/guest-login" },
            { text: "ゲスト削除バッチ", link: "/implementation/guest/guest-cleanup-batch" },
            { text: "レシピ更新", link: "/implementation/recipe/update-recipe" },
          ],
        },
      ],
      "/tables/": [
        {
          text: "テーブル定義",
          items: [
            { text: "一覧", link: "/tables/README" },
            { text: "PostgreSQL 型・設定", link: "/tables/postgresql-types-and-settings" },
            {
              text: "recipes",
              link: "/tables/recipe/recipes",
            },
            { text: "ingredients", link: "/tables/recipe/ingredients" },
            { text: "categories", link: "/tables/recipe/categories" },
            { text: "recipe_ingredients", link: "/tables/recipe/recipe_ingredients" },
            { text: "recipe_instructions", link: "/tables/recipe/recipe_instructions" },
            { text: "recipe_categories", link: "/tables/recipe/recipe_categories" },
            { text: "profiles", link: "/tables/profile/profiles" },
            { text: "families", link: "/tables/family/families" },
            { text: "family_members", link: "/tables/family/family_members" },
            { text: "accessible_recipe_ids", link: "/tables/view/accessible_recipe_ids" },
            { text: "recipe_summaries", link: "/tables/view/recipe_summaries" },
          ],
        },
      ],
      "/tips/": [
        {
          text: "Tips",
          items: [
            {
              text: "確認メールと Auth callback",
              link: "/tips/email-confirmation-and-auth-callback",
            },
            {
              text: "Supabase Storage 画像",
              link: "/tips/image-upload-with-supabase-storage",
            },
          ],
        },
      ],
      "/index/": [
        {
          text: "ソースコード index",
          items: [
            { text: "一覧", link: "/index/README" },
            { text: "レシピ検索", link: "/index/features/recipe-search" },
          ],
        },
      ],
      "/bugs/": [
        {
          text: "障害・不具合メモ",
          items: [
            {
              text: "家族作成 RLS",
              link: "/bugs/家族グループ作成失敗-RLS-SELECTポリシー",
            },
          ],
        },
      ],
      "/FeedBack/": [
        {
          text: "フィードバック",
          items: [
            { text: "テックリードレビュー", link: "/FeedBack/2026-08-12-tech-lead-review" },
            { text: "面接想定 Q&A", link: "/FeedBack/2026-08-12-interview-questions" },
          ],
        },
      ],
    },
    socialLinks: [{ icon: "github", link: repo }],
    footer: {
      message: "食卓手帖 — ポートフォリオ用ドキュメント",
      copyright: "MIT",
    },
    search: {
      provider: "local",
    },
  },
});
