# メール・通知

メール送信・プッシュ通知・メッセージキューを操作するメソッド群。

---

## メール送信

### `sendMail(entry, to, cc?, bcc?, attachments?)`

```typescript
sendMail(
  entry: any,
  to: string[],
  cc?: string[],
  bcc?: string[],
  attachments?: string[]
): Promise<boolean>
```

メールを送信する。件名・本文は `entry`（title = 件名、content = 本文など）で指定する。

| 引数 | 型 | 説明 |
| --- | --- | --- |
| `entry` | `any` | メールの件名・本文を含むエントリ |
| `to` | `string[]` | 送信先メールアドレスの配列 |
| `cc` | `string[]?` | CC |
| `bcc` | `string[]?` | BCC |
| `attachments` | `string[]?` | 添付ファイルの URI 配列 |

```typescript
await vtecxnext.sendMail(
  { title: 'お知らせ', summary: 'テキスト本文', content: { ______text: '<p>HTML本文</p>' } },
  ['user@example.com']
)
```

---

## プッシュ通知

### `pushNotification(message, to, title?, subtitle?, imageUrl?, data?)`

```typescript
pushNotification(
  message: string,
  to: string[],
  title?: string,
  subtitle?: string,
  imageUrl?: string,
  data?: any
): Promise<boolean>
```

モバイルデバイスへのプッシュ通知を送信する。

| 引数 | 型 | 説明 |
| --- | --- | --- |
| `message` | `string` | 通知本文 |
| `to` | `string[]` | 送信先（デバイストークン／グループなど）の配列 |
| `title` | `string?` | 通知タイトル |
| `subtitle` | `string?` | サブタイトル |
| `imageUrl` | `string?` | 画像 URL |
| `data` | `any?` | 追加データ |

```typescript
await vtecxnext.pushNotification('メッセージが届きました', [deviceToken], '新しいメッセージ')
```

---

## メッセージキュー

非同期処理の要求をキューに積み、処理状態を管理するための機能。`channel` 単位でキューを識別する。

### `setMessageQueue(feed, channel)`

```typescript
setMessageQueue(feed: any, channel: string): Promise<boolean>
```

指定チャネルのキューに feed を登録する。

```typescript
await vtecxnext.setMessageQueue(
  { feed: { entry: [{ title: 'export-job' }] } },
  'export'
)
```

---

### `getMessageQueue(channel)`

```typescript
getMessageQueue(channel: string): Promise<any>
```

指定チャネルのキューに登録された feed を取得する。

---

### `setMessageQueueStatus(flag, channel)`

```typescript
setMessageQueueStatus(flag: boolean, channel: string): Promise<boolean>
```

指定チャネルのメッセージキューの有効・無効状態を設定する。

```typescript
await vtecxnext.setMessageQueueStatus(true, 'export')
```

---

### `getMessageQueueStatus(channel)`

```typescript
getMessageQueueStatus(channel: string): Promise<any>
```

指定チャネルのメッセージキューの状態を取得する。
