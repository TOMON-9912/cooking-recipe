---
layout: home

hero:
  name: 食卓手帖
  text: ドキュメント
  tagline: 家族の味を、ここに残そう — 設計・実装・運用のナレッジベース
  actions:
    - theme: brand
      text: ガイドを読む
      link: /guides/README
    - theme: alt
      text: 公開デモ
      link: https://cooking-recipe-liard.vercel.app/

features:
  - title: ガイド
    details: Git 運用、Supabase、デプロイ、テストなど手順書
    link: /guides/README
  - title: アーキテクチャ
    details: クリーンアーキテクチャと Storage セキュリティ
    link: /architect/README
  - title: 設計・実装
    details: 機能ごとの設計書と実装メモ
    link: /design/README
  - title: ADR
    details: 技術選定の記録
    link: /adr/01-Next.js
---

## このサイトについて

リポジトリ内の `docs/` を VitePress で閲覧するためのサイトです。Markdown のまま GitHub 上でも読めますが、**サイドバーと検索**で目的のページにたどり着きやすくしています。

ローカルで起動する:

```bash
npm run docs:dev
```
