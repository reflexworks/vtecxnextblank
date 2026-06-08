# ユーザー管理

ユーザーの登録・パスワード変更・無効化・削除などを行うメソッド群。

---

## ユーザー登録

### `adduser(adduserInfo, reCaptchaToken)`

```typescript
adduser(adduserInfo: AdduserInfo, reCaptchaToken: string): Promise<any>
```

新規ユーザーを登録し、確認メールを送信する。

```typescript
await vtecxnext.adduser(
  {
    username: 'user@example.com',
    pswd: hashedPassword,
    nickname: 'ユーザー名',
    emailSubject: '登録確認',
    emailText: '本登録URLをクリックしてください。',
    emailHtml: '<p>本登録URLをクリックしてください。</p>',
  },
  reCaptchaToken
)
```

---

### `adduserByAdmin(adduserInfos)`

```typescript
adduserByAdmin(adduserInfos: AdduserInfo[]): Promise<any>
```

管理者権限で複数ユーザーを一括登録する。reCAPTCHA 不要。

---

### `adduserByGroupadmin(adduserInfos, groupname)`

```typescript
adduserByGroupadmin(adduserInfos: AdduserInfo[], groupname: string): Promise<any>
```

グループ管理者権限で複数ユーザーを登録する。

---

## パスワード操作

### `passreset(adduserInfo, reCaptchaToken?)`

```typescript
passreset(adduserInfo: AdduserInfo, reCaptchaToken?: string): Promise<any>
```

パスワードリセットメールを送信する。

---

### `changepass(newpswd, oldpswd?, passresetToken?)`

```typescript
changepass(newpswd: string, oldpswd?: string, passresetToken?: string): Promise<any>
```

パスワードを変更する。2 つのフローがある。

**ログイン済みフロー（現在のパスワードで変更）**

```typescript
await vtecxnext.changepass(newpswd, oldpswd)
```

**メールリセットフロー（未ログイン）**

```typescript
await vtecxnext.loginWithRxid(rxid)
await vtecxnext.changepass(newpswd, undefined, passresetToken)
```

パスワードは `getHashpass(password)`（`@vtecx/vtecxauth`）でハッシュしてから渡す。

---

### `changepassByAdmin(changepassByAdminInfos)`

```typescript
changepassByAdmin(changepassByAdminInfos: ChangepassByAdminInfo[]): Promise<any>
```

管理者権限で指定ユーザーのパスワードを変更する。

---

## アカウント変更

### `changeaccount(adduserInfo)`

```typescript
changeaccount(adduserInfo: AdduserInfo): Promise<any>
```

メールアドレスなどのアカウント情報を変更する。変更確認メールが送信される。

---

### `changeaccount_verify(verifyCode)`

```typescript
changeaccount_verify(verifyCode: string): Promise<any>
```

`changeaccount()` で送信された確認コードを検証し、変更を確定する。

---

## ユーザー状態管理

### `userstatus(account?)`

```typescript
userstatus(account?: string): Promise<string | any>
```

ユーザーの状態を取得する。`account` を省略すると全ユーザーの一覧を返す。

状態値: `Activated`（本登録）/ `Interim`（仮登録）

---

### `revokeuser(account, isDeleteGroups?)`

```typescript
revokeuser(account: string, isDeleteGroups?: boolean): Promise<any>
```

ユーザーを無効化する（ログイン不可になる）。

---

### `revokeusers(accounts?, uids?, isDeleteGroups?)`

```typescript
revokeusers(accounts?: string[], uids?: string[], isDeleteGroups?: boolean): Promise<any>
```

複数ユーザーを一括無効化する。

---

### `activateuser(account)`

```typescript
activateuser(account: string): Promise<any>
```

無効化されたユーザーを有効化する。

---

### `activateusers(accounts?, uids?)`

```typescript
activateusers(accounts?: string[], uids?: string[]): Promise<any>
```

複数の無効化されたユーザーを一括有効化する。

---

### `canceluser(isDeleteGroups?)`

```typescript
canceluser(isDeleteGroups?: boolean): Promise<any>
```

ログイン中のユーザー自身がアカウントを退会する。

---

## ユーザー削除

### `deleteuser(account)`

```typescript
deleteuser(account: string): Promise<any>
```

指定ユーザーをサービスから削除する。

---

### `deleteusers(accounts?, uids?)`

```typescript
deleteusers(accounts?: string[], uids?: string[]): Promise<any>
```

複数ユーザーを一括削除する。

---

## 型定義

```typescript
// SDK 上はすべて省略可（用途に応じて必要なフィールドを設定する）
type AdduserInfo = {
  username?: string      // メールアドレス
  pswd?: string          // パスワード（ハッシュ済み）
  nickname?: string      // ニックネーム
  emailSubject?: string  // 確認メール件名
  emailText?: string     // 確認メール本文（テキスト）
  emailHtml?: string     // 確認メール本文（HTML）
}

type ChangepassByAdminInfo = {
  uid: string            // 対象ユーザーの UID
  pswd: string           // 新しいパスワード（ハッシュ済み）
}
```
