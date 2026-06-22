---
name: implement-feature
description: クリーンアーキテクチャに従った新機能の実装ガイド。新しい機能を追加するとき、CRUD 機能を実装するとき、レシピ関連の機能を作るときに使用。
---

# 新機能実装ガイド

このプロジェクトはクリーンアーキテクチャを採用しています。**1 機能（操作）= 1 PR** を目安に、end-to-end で実装してください。

## 実装単位

| 操作 | 例（family） | PR の目安 |
|---|---|---|
| 登録 | 家族グループ作成 | create-family ブランチ |
| 取得 | 所属家族・メンバー一覧 | get-family ブランチ |
| 更新 | グループ名変更 | update-family-name ブランチ |
| 参加・脱退 | 招待参加 / 脱退 | join-family / leave-family ブランチ |

**1 操作の PR に、無関係な別操作を含めない。**

## 1 機能内の実装順序

```
1. domain/models      → 型定義（不足分のみ）
2. domain/repositories → インターフェース（不足分のみ）
3. infrastructure     → DB 実装
4. usecase            → オーケストレーション
5. app                → Server Action
6. presentation       → UI
```

## 各層のチェックリスト

### domain/models / repositories

- [ ] この操作に必要な型・interface だけ追加
- [ ] usecase は infrastructure を import しない

### infrastructure

- [ ] `{関心事}-repository-impl.ts` に Supabase 実装
- [ ] snake_case → camelCase 変換
- [ ] 単体テストを追加

### usecase

- [ ] `{操作}-{関心事}-usecase.ts`
- [ ] deps パターン
- [ ] ビジネスバリデーション（未所属チェック等）
- [ ] 単体テストを追加

### app

- [ ] Server Action で deps 組み立て
- [ ] 認証・FormData パース・エラー整形
- [ ] 単体テストを追加

### presentation

- [ ] フォーム / 画面。Action のみ呼び出す

## スコープ定義

新機能着手時は `docs/implementation/<feature>/<operation>.md` に以下を書く:

- 含める操作・画面
- **含めない**操作（別 PR）
- 完了条件（E2E で確認できること）

## 既存コードの参考先

| 機能 | 参考ファイル |
|-----|------------|
| 認証 | `src/usecase/auth/`, `src/app/(auth)/` |
| レシピ CRUD | `src/usecase/recipe/`, `src/app/recipe/` |
| 家族作成 | `src/usecase/family/create-family-usecase.ts`, `docs/implementation/family/create-family.md` |

## アーキテクチャ詳細

- `docs/architect/clean-architecture-and-directory.md`
- `docs/adr/` の該当 ADR
