# ログイン・サインアップ

<!-- ID: auth / ルート: /login, /signup -->

## メールログイン

| パス | 種類 | 関与 | 主要 symbol | 概要 |
| --- | --- | --- | --- | --- |
| `src/usecase/auth/login-usecase.ts` | usecase | 専用 | `loginUsecase` | |
| `src/app/(auth)/login/login.action.ts` | action | 専用 | `loginAction` | |
| `src/app/(auth)/login/page.tsx` | page | 専用 | | |

## ゲスト

| パス | 種類 | 関与 | 主要 symbol | 概要 |
| --- | --- | --- | --- | --- |
| `src/usecase/auth/guest-login-usecase.ts` | usecase | 専用 | | 詳細は guest 実装メモ |
| `src/app/(auth)/login/guest-login.action.ts` | action | 専用 | | |

## サインアップ

| パス | 種類 | 関与 | 主要 symbol | 概要 |
| --- | --- | --- | --- | --- |
| `src/usecase/auth/signup-usecase.ts` | usecase | 専用 | `signupUsecase` | |
| `src/app/(auth)/signup/signup.action.ts` | action | 専用 | | |
| `src/app/(auth)/signup/page.tsx` | page | 専用 | | |

## ログアウト

| パス | 種類 | 関与 | 主要 symbol | 概要 |
| --- | --- | --- | --- | --- |
| `src/app/top/logout-action.ts` | action | 専用 | `logoutAction` | usecase なし |

## 関連ドキュメント

- [login.md](../../auth/login.md)
- [signup.md](../../auth/signup.md)
- [logout.md](../../auth/logout.md)
- [guest-login.md](../../guest/guest-login.md)
