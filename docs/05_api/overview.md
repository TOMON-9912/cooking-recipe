# API 概要

本アプリは **REST API を主軸にしていません**。ブラウザからは **Next.js Server Actions** と **Route Handlers**（Auth callback・health）を使います。

## 境界

| 種類 | 例 | ドキュメント |
| --- | --- | --- |
| Server Action | `createRecipeAction` | [recipes.md](./recipes.md) |
| Route Handler | `/auth/callback`, `/api/health` | [application/auth/email-confirmation-callback.md](../04_application/auth/email-confirmation-callback.md) |
| Supabase Client | 一覧・詳細の読み取り | presentation / app から直接（読み取り中心） |

PostgREST は Supabase 経由で利用しますが、更新系の複雑な操作は RPC（`update_recipe_with_relations`）に寄せています。
