---
name: transcribe-code
description: Provides complete source and commentary in Markdown so the user can type it by hand. Does not edit repository files. Use when the user wants transcription practice or runs /transcribe.
---

# 写経

リポジトリのファイルは編集しない。コードは Markdown のコードブロックで、省略せず出す。一度に全ファイルを出さず、1 ファイルずつ。

常時制約は Rule を指す: `clean-architecture.mdc` / `file-naming.mdc` / `code-style.mdc` / `ui-design.mdc`

仕様・判断は `docs/01`〜`09` を読む。

## 1 ファイルの出し方

```markdown
## ファイル: `{path}`

### 役割
（1〜2 文）

### コード

\`\`\`typescript
// 完全なコード
\`\`\`

### 解説
- なぜこの形か
- 実務で見るポイント

### 写経したら
- [ ] ファイルを作った
- [ ] import が通る
- [ ] 型エラーがない
```

UI なら emerald / amber、`lucide-react`、参考にする既存コンポーネントを示す。
