---
name: implement-feature
description: クリーンアーキテクチャに従った新機能の実装ガイド。新しい機能を追加するとき、CRUD 機能を実装するとき、レシピ関連の機能を作るときに使用。
---

# 新機能実装ガイド

このプロジェクトはクリーンアーキテクチャを採用しています。新機能を実装する際は、以下の手順に従ってください。

## 実装順序（トークン効率のため段階的に）

```
1. domain/models      → 型定義
2. domain/repositories → インターフェース
3. infrastructure     → DB 実装
4. usecase            → オーケストレーション
5. app                → Server Action
6. presentation       → UI
```

**重要**: 各ステップ完了後、ユーザーに確認を取ってから次へ進む。

## 各層の実装チェックリスト

### Step 1: domain/models

```
Task Progress:
- [ ] 型を `src/domain/models/{関心事}/` に作成
- [ ] camelCase で定義（DB の snake_case は使わない）
- [ ] 他層を import していないことを確認
```

参考: `src/domain/models/_README.md`

### Step 2: domain/repositories

```
Task Progress:
- [ ] インターフェースを `src/domain/repositories/{関心事}/` に作成
- [ ] 入出力の型も同ファイルに定義
- [ ] メソッド名: get〇〇, find〇〇, create〇〇, update〇〇, delete〇〇, save〇〇
```

参考: `src/domain/repositories/_README.md`

### Step 3: infrastructure

```
Task Progress:
- [ ] 実装を `src/infrastructure/repositories/{関心事}/` に作成
- [ ] ファイル名: `{関心事}-repository-impl.ts`
- [ ] snake_case → camelCase の変換をここで行う
- [ ] ビジネスロジックは書かない
```

参考: `src/infrastructure/repositories/_README.md`

### Step 4: usecase

```
Task Progress:
- [ ] `src/usecase/{関心事}/` に作成
- [ ] ファイル名: `{操作}-{関心事}-usecase.ts`
- [ ] deps パターンでリポジトリを受け取る
- [ ] infrastructure を直接 import しない
```

参考: `src/usecase/_README.md`

### Step 5: app (Server Action)

```
Task Progress:
- [ ] `src/app/{ルート}/action.ts` に作成
- [ ] deps を組み立てて usecase に渡す
- [ ] FormData のパース、redirect、エラー整形をここで行う
```

参考: `src/app/_README.md`

### Step 6: presentation

```
Task Progress:
- [ ] `src/presentation/components/{関心事}/` に作成
- [ ] Server Action を呼び出す
- [ ] usecase, infrastructure を直接 import しない
```

## 既存コードの参考先

| 機能 | 参考ファイル |
|-----|------------|
| 認証 | `src/usecase/auth/`, `src/app/(auth)/` |
| レシピ CRUD | `src/usecase/recipe/`, `src/app/recipe/` |
| お気に入り | `src/usecase/recipe/toggle-favorite-usecase.ts` |

## アーキテクチャ詳細

詳細は以下のドキュメントを参照:
- `docs/architect/clean-architecture-and-directory.md`
