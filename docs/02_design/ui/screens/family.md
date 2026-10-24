# 家族

## 何ができるか

未所属なら家族グループを作る。自分宛ての招待があれば家族名を確かめる。未所属なら承認画面へ進める。所属済みなら概要を見る（自分宛て招待があれば、承認できない理由も出す）。オーナーは宛先メールを指定して招待を発行し、未使用の招待を一覧・取り消せる。案内の URL（`/family`）をコピーして相手に渡せる。

## ルート

| パス | 認証 | Primary Action（画面内 1 つ） |
| --- | --- | --- |
| `/family` | 必要 | 未所属かつ自分宛ての招待あり: 承認画面へ。未所属で招待なし: 家族を作る。所属済みのオーナー: 招待を発行する。所属済みのメンバー: なし（概要の確認） |
| `/family/new` | 必要 | なし（旧 URL。`/family` へ redirect するだけ） |

実装済みの page は `/family` と `/family/new`。成功遷移のうち作成成功は `/top?toast=familyCreated`（確認済み）。

## 情報設計

- ファーストビューで伝えること: 未所属なら「家族を作る」または「自分宛ての招待」。オーナーなら「誰を招待するか」
- 未所属で自分宛て招待あり: 家族名（オーナー名は出さない）。Primary は承認画面へ。家族を作るは Secondary
- 未所属で招待なし: 家族名の入力と作成（現行）
- 所属済み: 名前とメンバー。参加後は本人がメンバーに含まれる。自分宛て招待があれば家族名を出し、承認できない理由（既に家族がある）を書く。承認画面へは出さない。Primary は変えない（オーナーなら発行、メンバーなら概要）
- オーナー: 宛先メールの入力と「招待する」（Primary）。発行後に案内 URL（`/family`）のコピー。期限内未使用の一覧（宛先、期限）。各行の「取り消す」は Secondary
- 取り消し済み・期限切れ・承認済みは一覧に出ない
- ゲストのオーナー: 招待は本登録後に使えることを案内し、発行フォームは出さない
- ゲストの未所属: 承認できないことと本登録への案内。承認へのボタンは出さない
- 空状態: オーナーで未使用招待が無いときは、宛先を入れて発行できることを書く
- 失敗時: 重ね発行、ゲスト、オーナーでない、を画面内に出す。宛先が登録済みかどうかは出さない

## 導線

| 入る | 出る |
| --- | --- |
| ヘッダー「家族管理」。オーナーから渡された案内 URL | 作成成功 → `/top?toast=familyCreated`。発行・取り消しのあと → 同じ `/family`。承認へ → [family-join.md](./family-join.md) |

## 含まない

- 脱退、名前変更 UI
- ログイン後の自動戻り
- アプリからのメール送信

## 関連

| 種類 | リンク |
| --- | --- |
| 操作メモ | [create-family.md](../../application/family/create-family.md)、[get-family-overview.md](../../application/family/get-family-overview.md)、[create-family-invite.md](../../application/family/create-family-invite.md)、[list-family-invites.md](../../application/family/list-family-invites.md)、[list-my-family-invites.md](../../application/family/list-my-family-invites.md)、[cancel-family-invite.md](../../application/family/cancel-family-invite.md) |
| ドメイン | [family.md](../../domain/family.md) |
| 画面遷移 | [screen-flow.md](../screen-flow.md) |
