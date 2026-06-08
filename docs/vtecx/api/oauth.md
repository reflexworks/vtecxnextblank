# OAuth・TOTP

LINE OAuth 連携および TOTP（時刻ベースワンタイムパスワード）の管理を行うメソッド群。

---

## LINE OAuth

### `oauthLine()`

```typescript
oauthLine(): Promise<boolean>
```

LINE ログインの認可フローを開始する（認可エンドポイントへのリダイレクトを行う）。

---

### `oauthCallbackLine()`

```typescript
oauthCallbackLine(): Promise<boolean>
```

LINE ログインのコールバック処理を行い、セッションを確立する。LINE から渡される `code` / `state` はリクエスト（コンストラクタの `NextRequest`）から読み取られる。

---

### `mergeOAuthUserLine(rxid)`

```typescript
mergeOAuthUserLine(rxid: string): Promise<any>
```

LINE アカウントを既存の vte.cx アカウントに紐付ける。`rxid` でセッションを特定する。

---

## TOTP（多要素認証）

### `getTotpLink(chs?)`

```typescript
getTotpLink(chs?: number): Promise<any>
```

TOTP 設定用の QR コード URL を含む feed を返す。`chs` で QR コード画像のサイズ（一辺のピクセル数）を指定できる。

```typescript
const totp = await vtecxnext.getTotpLink()
```

---

### `createTotp(feed)`

```typescript
createTotp(feed: any): Promise<any>
```

TOTP を有効化する。認証アプリに表示されるワンタイムコードを feed で渡す。

---

### `deleteTotp(account?)`

```typescript
deleteTotp(account?: string): Promise<any>
```

TOTP を無効化する。`account` を指定すると管理者が対象ユーザーの TOTP を解除する。省略時は自分自身。

---

### `loginWithTotp(totp, isTrustedDevice)`

```typescript
loginWithTotp(totp: string, isTrustedDevice: boolean): Promise<StatusMessage>
```

TOTP コードを検証してログインを完了する。通常ログイン後に呼び出す。

| 引数 | 型 | 説明 |
| --- | --- | --- |
| `totp` | `string` | 認証アプリに表示されているワンタイムコード |
| `isTrustedDevice` | `boolean` | `true` にすると次回以降 TOTP をスキップする |

```typescript
await vtecxnext.loginWithTotp('123456', false)
```

---

### `changeTdid()`

```typescript
changeTdid(): Promise<any>
```

信頼済みデバイス ID（TDID）をリセットする。信頼済みデバイスの登録を無効化する用途で使用。
