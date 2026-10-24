---
name: write-test-design
description: Does not start a test-only phase. Tests are written with the implementation in /implement. Use when someone runs /test-design.
---

# テストは実装と同じフェーズ

`/test-design` では Issue もブランチもテストも作らない。

3 種のテスト（Vitest のモック、Vitest の実 DB、e2e）は、`/implement` がその操作のコードと一緒に書く（[ADR 014](../../docs/04_decisions/014-narrow-design-and-test-artifacts.md)）。

モックのテストは、対象の usecase や action を import する。関数が無い状態では、要件を確かめずに読み込みで落ちる。だからテストだけのフェーズにしない。

呼ばれたときは、実装 Issue が無いことだけを伝え、`/implement` へ戻して止まる。
