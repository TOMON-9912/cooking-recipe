# 設計を書くときの点検

`write-design` が終わりに読む。プロダクト固有の正解は `docs/01_requirements`〜`docs/04_decisions`。レビュー用の観点は `.cursor/skills/review-design/checklist.md`。

新規に書くのは Architecture、database、ADR だけ（ADR 014）。domain / application / api / ui は足さない。

## 共通

- 確定済み要件の FR / NFR と、関連 ADR が指す方式で書いている
- 要件に無い振る舞いを足していない
- テストコードと、操作ごとのテスト設計 Markdown をこの PR に入れていない
- 仮置きが本番仕様として読める書き方になっていない

## database

- 不変条件の保証に「UI で入力できない」だけを書いていない
- 直 INSERT / UPDATE でも破られない閉じ方（制約、RLS の列制限、検証付き definer）がある
- RLS UPDATE は、誰かに加え、変えてよい列が書いてある
- 直接変更と関数経由のどちらが正かが書いてある
- `security definer` を出すなら、関数名、`GRANT EXECUTE` の相手、`search_path` がある
- 本人確認に使う属性の比較の正が 1 つに決まっている
- 同時実行で破れる条件は、破りうるすべての操作で同じ閉じ方を指している

## Architecture

- 構造やデータの流れが変わるときだけ書く。変わらないときはファイルを足さない

## ADR

- 捨てた案と、捨てた理由がある
- database の閉じ方と、ADR の決定が同じ方式を指している
