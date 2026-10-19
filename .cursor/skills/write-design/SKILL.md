---
name: write-design
description: Writes only the missing design docs for a planned slice whose requirements are confirmed, in stages (data, then backend layers, then frontend), stopping after each stage for review. Closes invariants at DB not only usecase. Test design is a separate process (/test-design). Use when filling design, or running /design.
---

# 設計を書く

実装しない。テスト設計は書かない（`/test-design`）。`/plan` が示した不足分だけを、`docs/02_design`・`docs/04_decisions` に書く。判断が複数あるときは草案を出して止まる。

`docs/90_workspace/work/` への下書きは Ready に数えない。正本は `docs/01_requirements`〜`docs/04_decisions`。

このスキルは、設計 Issue を作り、そのブランチで設計を書く（`docs/05_development/issue-workflow.md`）。次のプロセス（テスト設計）の Issue は作らない。**Issue / ブランチ / PR は設計プロセスで 1 つ。** 段階はレビューのためで、PR を分割しない。

書くときの点検項目は [authoring-checklist.md](authoring-checklist.md)。レビュー観点の正は `.cursor/skills/review-design/checklist.md`（本文はコピーしない）。プロダクトの正解は `docs/01_requirements`〜`docs/04_decisions`。

## 始める前

1. 対象の要件定義（`docs/01_requirements/{機能}.md`）がある
2. 要件定義が確定している: 要件定義 Issue が閉じている（PR がマージ済み）、またはユーザーがこのチャットで確定を明示している

どちらかが無いときは、設計を書かずに止まり、`/requirements` へ戻す。要件定義をここで書かない。

## 始め方

`docs/05_development/issue-workflow.md` の「各プロセスの始め方」に従う。

1. `git fetch origin` のあと、`develop` にいて、作業ツリーに無関係な変更が無いことを確かめる。違えば止まって聞く
2. 要件定義 Issue が閉じていることを確かめる（`gh issue view {番号} --json state`）。開いていれば止まって聞く
3. 親の子 Issue を確かめ（`gh api 'repos/{owner}/{repo}/issues/{親}/sub_issues' --jq '.[] | "\(.number) \(.state) \(.title)"'`）、設計 Issue が無ければ作る。タイトルは `docs(design): {機能}の設計`、本文は骨格のとおり。前提に要件定義 Issue、成果物に書く場所の見込み（パスだけ）、目的に要件の「設計への申し送り」の要約を書く（`gh issue create --parent {親} --title "…" --body-file {ファイル}`）
4. `git switch -c docs/{Issue}-design-{slug} origin/develop` で作業ブランチを切る。push しない
5. **段階 1 から書く。** 次の段階へは、人間が続けてよいと明示するまで進まない

再開するときは、既に書いた層を見て、次の未了段階だけを書く。全部を書き直さない。ただし再開時に、確定済み要件・ADR と既存設計の**方式が食い違っていたら**、旧方式の上に足さず、食い違う箇所を正本に合わせて直してから未了段階へ進む。

## 要件との関係

- 仕様・設計は、要件の ID（`FR-` / `NFR-`）を参照する
- 要件に無いことを足さない。足したくなったら要件定義に戻し、人間が決める
- 要件の「設計への申し送り」と「未決・リスク」を読み、未決を勝手に決めない
- 関連 ADR と、既存の domain / database / application / ui が**同じ方式**を指すようにする。正本が変わっているのに旧方式の設計を残さない

## 混ぜない

| 種類 | 書く | 書かない |
| --- | --- | --- |
| Specification | 要件を満たすためのルール・状態・権限・失敗の意味 | 要求・なぜ作るか（要件定義へ）、テーブル、手順 |
| Design | 内部でどう実現するか | 「ユーザーができること」だけの再掲 |

テスト設計（何をどう検証するか）は、この PR に入れない。`/test-design` で別に書く。

Issue に設計本文を複製しない。パスを Design links に足すのは人間の依頼時だけ。

## 置き場

- Specification → 主に `docs/02_design/domain`
- Design → 変更する層だけ（`docs/02_design/architecture` / `database` / `application` / `api` / `ui`）。判断理由は `docs/04_decisions`
- 画面の経路・成功遷移は、実装の page / フォームを見て書く。未確認なら「未記載」とする

ひな形は各ディレクトリの `_template.md`。

## 段階 0（書く前の割り当て。ファイルを増やす前）

段階 1 の本文に入る前に、チャットまたは作業メモで次を固定する。割り当てできない項目は、勝手に仮置きせず止まって聞く。

1. 要件の FR / NFR / 受け入れ条件 / 設計への申し送り / 未決を列挙する
2. 関連 ADR を読む。既存設計が別方式なら、直す範囲を列挙する
3. 申し送りを 1 項目ずつ、domain の ID（`INV` / `OP` / `Q` / 失敗）と、それを閉じる層（database / application / ui）に割り当てる
4. FR の動詞から操作・照会の一覧を作る。**1 意図 1 操作**。発行・一覧・取り消し・承認などを 1 ファイルに固めない（段階 2 の単位になる）
5. 要件が既に決めたこと（期限、スコープに含む操作、禁止する方式）を、domain の「未決」に残さない

## 段階（1 ターンで 1 段階）

一度に全層を書かない。レビュー対象が膨らむため。**今の段階で必要なパスだけ**を触り、終わりで止まってレビューを待つ。

業務ルールは domain が正、テーブルはそれに従う（`docs/02_design/domain/writing-guide.md`）。

| 順 | 段階 | 書くもの | 触ってよい主なパス |
| --- | --- | --- | --- |
| 1 | データ系 | domain の仕様（不変条件・状態・権限・操作・失敗）→ テーブル・ER・RLS。データに関する ADR | `docs/02_design/domain/`、`docs/02_design/database/`、必要な `docs/04_decisions/` |
| 2 | バックエンド | application の操作メモ。クリーンアーキの**内側から**（下表）。実装判断の ADR | `docs/02_design/application/`、必要な ADR。API が要るときだけ `docs/02_design/api/` |
| 3 | フロントエンド | 画面・導線。ルートは実装を見て書く。未確認は「未記載」 | `docs/02_design/ui/` |

一覧（`use-cases.md`、テーブル README、VitePress の該当項目）は、**その段階で増やしたファイルだけ**追記する。次の段階のリンクを先に置かない。

### 段階 1（データ系）で閉じること

不変条件は「UI で入力できない」「usecase でロックする」だけでは足りない。直 SQL（RLS を通る INSERT / UPDATE）でも破られない閉じ方を、次のいずれかで書く。usecase だけに残して段階 2 へ送らない。

- 制約（UNIQUE など）
- RLS の `USING` / `WITH CHECK`（**変えてよい列**まで）
- 検証付きの `security definer` 関数（直接変更を拒否する）

`security definer` を出すなら、関数名、`GRANT EXECUTE` の相手（付けないロールも）、`search_path` を既存 ADR（`docs/04_decisions/006-rls-helper-functions.md`）に合わせて書く。名前や権限を実装時に回さない。

本人確認に使う属性（メールなど）は、比較の正を 1 つ決める（どのテーブル／どのクレームか）。揺れたままにしない。

同時実行で破れる不変条件（上限、二重所属、重ね作成など）は、それを破りうる**すべての操作**（作成時と参加時など）で同じ閉じ方を指す。方式（一意制約か関数内直列化か）をこの段階で決め、ADR の「レビューで確定」を残さない。決められないなら止まって聞く。

### 段階 2 の中（クリーンアーキの順）

1 操作を end-to-end で書くが、ファイル内も下からにする。操作が複数あるときは **1 操作ずつ**書き、次の操作は人間が続けてよいと言うまで待つ。段階 0 で分けた操作を、ここで再結合しない。

```text
domain（型・リポジトリ契約）
  → infrastructure（DB / Storage の対応）
    → usecase
      → app（Action と deps）
```

usecase の手順は、段階 1 で決めた DB 側の閉じ方を**呼ぶ**。同じ不変条件をアプリのロックだけで再発明しない。

presentation / 画面パスの詳細は段階 3。段階 2 では「どの画面が呼ぶか」程度に留め、レイアウトと文言は書かない。

変更しない層は書かない。空の設計書を作らない。

### 段階 3（フロントエンド）で落とすこと

画面の主目的（Primary）は 1 つ。要件が「確かめられる」「理由が分かる」としている状態は、ハッピーパス以外（既に別状態、空、失敗）も出す。Primary を増やさず、確認や拒否理由は弱めた導線にする。

ルートと成功遷移は実装の page / フォームを見て書く。未確認は「未記載」。

### 段階の終わり

1. この段階で書いたパスと、まだ書かない次の段階を列挙する
2. [authoring-checklist.md](authoring-checklist.md) の、今の段階の項目を満たしているか確かめる。足りない項目は書いてから止まる
3. この段階でカバーした FR / NFR / 申し送りと、次の段階に送るものを列挙する
4. 人間が決めることが残っていれば、草案を出して止まる（次の段階に進めない）
5. 次は `/review-design`（この段階の差分だけ）。OK が出るまで段階を進めない
6. 「続けて」「バックエンド」「フロント」など、次の段階が分かる指示があってから進む

## 完了

全段階が終わったときだけ、設計プロセスとしての完了にする。書いたパス、作った Issue とブランチ、まだ人間が決めることを列挙する。次は人間による設計のレビュー（`/review-design`）と PR（依頼があるときだけ。PR 本文に `Closes #{設計 Issue}`）。PR がマージされて Issue が閉じたら `/test-design`。実装へ進まない。Ready は付けない。
