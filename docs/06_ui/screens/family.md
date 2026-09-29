# 家族

## 何ができるか

未所属なら家族グループを作る。所属済みなら概要を見る。参加・招待の UI はまだない。

## ルート

| パス | 認証 | Primary Action |
| --- | --- | --- |
| `/family` | 必要 | 未所属: 家族を作る。所属済み: 概要の確認 |
| `/family/new` | 必要 | なし（旧 URL。`/family` へ redirect するだけ） |

## 情報設計

- 未所属: 家族名の入力と作成
- 所属済み: 名前とメンバー
- 空の「招待する」は出さない（未実装）

## 導線

| 入る | 出る |
| --- | --- |
| ヘッダー「家族管理」 | 作成成功 → `/top?toast=familyCreated` |

## 含まない

- 招待、参加、脱退、名前変更 UI

## 関連

| 種類 | リンク |
| --- | --- |
| 操作メモ | [create-family.md](../../04_application/family/create-family.md)、[get-family-overview.md](../../04_application/family/get-family-overview.md) |
| ドメイン | [family.md](../../02_domain/family.md) |
