# 認証・セッション

ログイン状態の確認・ログイン・ログアウト・ユーザー情報取得を行うメソッド群。

---

## ログイン状態確認

### `isLoggedin()`

```typescript
isLoggedin(): Promise<boolean>
```

現在のリクエストがログイン済みかどうかを返す。

---

### `uid()`

```typescript
uid(): Promise<string>
```

ログインユーザーの UID を返す。未ログインの場合はエラーをスロー。

```typescript
const uid = await vtecxnext.uid()
```

---

### `account()`

```typescript
account(): Promise<string>
```

ログインユーザーのアカウント名（メールアドレス）を返す。

---

### `service()`

```typescript
service(): Promise<string>
```

現在のサービス名を返す。

```typescript
const serviceName = await vtecxnext.service()
```

---

### `now()`

```typescript
now(): Promise<string>
```

サーバーの現在日時を ISO 8601 形式で返す。

---

### `rxid()`

```typescript
rxid(): Promise<string>
```

リクエスト ID を返す。

---

### `whoami()`

```typescript
whoami(): Promise<any>
```

ログインユーザーの詳細情報を feed 形式で返す。

---

## ログイン

### `login(wsse, reCaptchaToken?)`

```typescript
login(wsse: string, reCaptchaToken?: string): Promise<StatusMessage>
```

WSSE 認証情報を使ってログインする。

| 引数 | 型 | 説明 |
| --- | --- | --- |
| `wsse` | `string` | WSSE 認証情報 |
| `reCaptchaToken` | `string?` | reCAPTCHA トークン（省略可） |

---

### `loginWithRxid(rxid)`

```typescript
loginWithRxid(rxid: string): Promise<StatusMessage>
```

RXID を使ってセッションを確立する。パスワードリセットフローや仮登録完了フローで使用。

```typescript
const rxid = vtecxnext.getParameter('_RXID') ?? ''
await vtecxnext.loginWithRxid(rxid)
```

---

### `loginWithTotp(totp, isTrustedDevice)`

```typescript
loginWithTotp(totp: string, isTrustedDevice: boolean): Promise<StatusMessage>
```

TOTP（ワンタイムパスワード）を使ってログインする。多要素認証（MFA）フローで使用。

| 引数 | 型 | 説明 |
| --- | --- | --- |
| `totp` | `string` | ワンタイムパスワード |
| `isTrustedDevice` | `boolean` | 信頼済みデバイスとして登録するか |

---

## ログアウト

### `logout()`

```typescript
logout(): Promise<StatusMessage>
```

現在のセッションをログアウトする。

---

## 型定義

```typescript
type StatusMessage = {
  status: number
  message: string
}
```
