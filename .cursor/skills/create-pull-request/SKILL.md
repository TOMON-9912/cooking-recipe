---
name: create-pull-request
description: Creates a GitHub pull request with gh for this repository. Use when the user asks to open a PR, create a pull request, push and open a PR, or says PRを出して. Also use when the user asks to merge a PR.
---

# PR を出す

明示の依頼があるときだけ出す。「続けて」「お願い」だけでは出さない。コミットだけの依頼では出さない。

常時制約は `.cursor/rules/git-workflow.mdc`。マージの方向は `docs/05_development/git-branch-workflow.md`。ブランチ名と `Closes` の対象は `docs/05_development/issue-workflow.md`。

## 出す前

次を並列で見る。

1. `git status`
2. `git diff`（ステージ済みと未ステージ）
3. 上流: `git status -sb`
4. `git log` と `git diff {base}...HEAD`

この PR の Issue と無関係な変更が混ざっていたら、分けて止まる。`.env` や認証情報は入れない。未コミットがあるときは、コミットしてよいか確認して止まる。コミットは、コミットする依頼があるときだけ行う。

ベース:

- 作業ブランチ → `develop`
- リリース（`develop` を本番へ）→ `main`

`main` を `develop` に戻す PR は作らない。`develop` と `main` へ push しない。`--force` しない。

`git switch -c ... origin/develop` で切ったブランチは、上流が `origin/develop` になっていることがある。その状態で `git push` しない。上流を外すか、次で push する。

```bash
git push -u origin HEAD:{ブランチ名}
```

## 本文

日本語。なぜその変更かを 1〜3 文で書く。Test plan は書かない。

```markdown
## 概要

-
```

そのプロセスの子 Issue をこの PR で終えるときだけ、末尾に `Closes #{番号}` を書く。親 Issue は書かない。Issue のチェックは付けない。Issue は閉じない。

タイトルは日本語で、種別は Conventional Commits（`docs:` `feat:` `fix:` `release:` など）。

## 作成

`gh pr create` で作る。本文は HEREDOC で渡す。作ったあと URL を返す。

同じブランチに PR が既にあるときは、新規に作らずその URL を返す。

## マージを頼まれたとき

依頼された PR だけをマージする。

- 作業ブランチ → `develop` は Squash and merge
- `develop` → `main` は Create a merge commit。`develop` は削除しない
- `main` を `develop` にマージしない

リリース PR を出したときは、マージ前にチャットで、Create a merge commit にすることと、`develop` を削除しないことを伝える。
