# ER 図

## 図（SVG）

![ER 図](./images/er-diagram.svg)

## Mermaid（編集用）

```mermaid
erDiagram
  auth_users ||--o| profiles : "1:1"
  auth_users ||--o{ recipes : authors
  auth_users ||--o{ family_members : belongs
  auth_users ||--o{ recipe_favorites : favorites
  families ||--o{ family_members : has
  recipes ||--o{ recipe_ingredients : has
  recipes ||--o{ recipe_instructions : has
  recipes ||--o{ recipe_categories : tagged
  categories ||--o{ recipe_categories : used
  ingredients ||--o{ recipe_ingredients : optional
  recipes ||--o{ recipe_favorites : favorited
```

`auth.users` は Supabase Auth 管理のため図では `auth_users` と表記。

## テーブル定義

[tables/README.md](./tables/README.md) に一覧。RLS の背景は [09_decisions/008-rls-helper-functions.md](../09_decisions/008-rls-helper-functions.md)。
