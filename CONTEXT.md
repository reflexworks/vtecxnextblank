# CONTEXT.md — vtecxnextblank 実装クイックリファレンス

Claude Code などの AI ツールが実装時に参照する制約・パターン・クイックリファレンスです。

- 詳細なフレームワーク仕様: [docs/vtecx/framework.md](docs/vtecx/framework.md)
- SDK クイックリファレンス: [docs/vtecx/vtecxnext-api.md](docs/vtecx/vtecxnext-api.md)（よく使うメソッド＋実装例）
- SDK 全メソッド網羅リファレンス: [docs/vtecx/api/](docs/vtecx/api/index.md)
- セットアップ・コマンド: [README.md](README.md)

---

## 絶対に守る制約

### スキーマ（template.xml）

- **フィールドは削除不可** — 管理画面に削除機能がないため、一度定義したフィールドは恒久的に残る
- **フィールド追加は末尾のみ** — 既存フィールドの途中に挿入するとスキーマが壊れる
- **フィールド名は snake_case** — 小文字英字・数字・アンダースコアのみ（先頭は小文字英字）
- **カスタムフィールドは必ず template.xml に定義** — `rights` / `title` / `summary` に JSON を詰めない

```
// ❌ NG: 標準 Atom フィールドに JSON を詰める
{ rights: JSON.stringify({ uid, isAdmin }) }

// ✅ OK: スキーマ定義したフィールドに直接セット
{ userprofile: { uid, is_admin: isAdmin } }
```

### データ登録

- **1回の `put()` にまとめる** — 複数回 `put()` は原子性なし・パフォーマンス低下
- **親エントリを先頭に配置** — 子より後に親があると `Parent path is required` エラー
- **PUT 時に `contributor` を引き継ぐ** — `existing.contributor` をコピーしないとアクセス権限が失われる

### アクセス制御

- **API ルートにロールチェックを実装しない** — フレームワークが担う。`folderacls` と `contributor` で制御する
- **`/_group/$admin` には `CURD` のみ付与** — `E` をつけると直接アクセスが制限される
- **ログインユーザー `+` には `CURDE` を付与** — API 経由のみに制限する

### インデックス

- **同一フィールドへの複数パスは `|` で1行にまとめる** — 別行に書くと `Already specified` エラー
- **フィールド検索には `f` パラメータが必須** — `?f&field-eq-value`
- **インデックスは既存データに遡及しない** — 設定後に登録・更新したデータのみ有効。既存データは再 PUT が必要

---

## よくある NG / OK パターン

| NG | OK |
| --- | --- |
| `rights: JSON.stringify({...})` | `entity: { field: value }` |
| フィールドを途中に挿入 | 既存フィールドを保持し末尾に追記 |
| 複数回 `put()` | 1回の `put()` に `entry` 配列でまとめる |
| `entry.id.replace('/path/', '')` → `"id,3"` | `entry.id.split(',')[0].replace('/path/', '')` |
| 同一フィールドを複数行でインデックス設定 | `field:/path1\|/path2` で1行にまとめる |
| 子エントリを親より前に配置 | 親エントリを配列の先頭に配置 |
| API ルートでロールチェック実装 | `folderacls` / `contributor` で制御 |

---

## SDK クイックリファレンス

| メソッド | 戻り値（正常） | 204 | 用途 |
| --- | --- | --- | --- |
| `getFeed(uri)` | `VtecxApp.Entry[]` | `null` / `undefined` | 一覧取得（少量・全件） |
| `getEntry(uri)` | `VtecxApp.Entry` | `null` / `undefined` | 1件取得 |
| `getPageWithPagination(uri, n)` | `VtecxApp.Entry[]` | `undefined` | ページング一覧 |
| `put({feed:{entry:[...]}})` | — | — | 登録・更新（複数可） |
| `uid()` | `string` | — | ログインユーザーの UID |
| `service()` | `string` | — | ログインユーザーのサービス名 |
| `whoami()` | `any` | — | ログインユーザーの詳細情報 |
| `changepass(newpswd, oldpswd?, passresetToken?)` | — | — | パスワード変更 |
| `loginWithRxid(rxid)` | `StatusMessage` | — | RXID でセッション確立（メールリセットフロー） |
| `isGroupMember(uri)` | `boolean` | — | グループ所属確認 |

エラー時の戻り値: `{ feed: { title: string } }`

---

## ユーザー認証・アカウント

### アカウントの状態

| 状態 | summary 値 | ログイン |
| --- | --- | --- |
| 仮登録 | `Interim` | 不可（確認メール未クリック） |
| 本登録 | `Activated` | 可 |

状態は管理画面（https://admin.vte.cx → 該当サービスの「管理画面」→ ユーザー管理）で確認できる。

### ログイン中のユーザー情報取得

```typescript
// API ルート内（サーバーサイド）
const uid = await vtecxnext.uid()                        // UID
const serviceName = await vtecxnext.service()            // サービス名
const userEntry = await vtecxnext.getEntry(`/_user/${uid}`)
const email = userEntry?.contributor?.[0]?.email ?? ''   // メールアドレス
```

`/_user/{uid}` エントリの主要フィールド:

| フィールド | 内容 |
| --- | --- |
| `title` | UID |
| `subtitle` | ニックネーム |
| `summary` | `Activated` / `Interim` |
| `contributor[0].email` | メールアドレス |

### パスワード変更の 2 フロー

**未ログイン（メールリセット）**

```typescript
// route.ts 内
await vtecxnext.loginWithRxid(rxid)   // メールリンクの RXID でセッション確立
await vtecxnext.changepass(newpswd, undefined, passresetToken)
```

**ログイン済み（現在のパスワードで変更）**

```typescript
// route.ts 内（セッションクッキー認証済み）
await vtecxnext.changepass(newpswd, oldpswd)
```

パスワードは `getHashpass(password)`（`@vtecx/vtecxauth`）でハッシュしてから渡す。

---

## インデックス・検索クエリ

### `<rights>` タグの構文

```
entity.field:/path          通常インデックス（完全一致・範囲・ソート）
entity.field;/path          全文検索インデックス
field:/path1|/path2         複数パスへのインデックス（1行に必ずまとめる）
field1|field2;/path         複数フィールドをまとめて全文検索
field:path=role             フィールド ACL（指定ロールのみ読み書き可）
field#                      暗号化
```

### クエリ URI

```
/path?f&entity.field-eq-value&l=25
```

`f` パラメータ必須。インデックス検索が有効なのは **先頭の検索条件パラメータのみ**（2番目以降はメモリフィルタ）。

| 演算子 | 意味 |
| --- | --- |
| `-eq-` / `-ne-` | 完全一致 / 不一致 |
| `-lt-` / `-le-` | より小さい / 以下 |
| `-gt-` / `-ge-` | より大きい / 以上 |
| `-fm-` / `-bm-` | 前方一致 / 後方一致 |
| `-ft-` | 全文検索（全文インデックス必須） |

OR 条件: `?f&|field-eq-a&|field-eq-b`

---

## エイリアス（横断検索）パターン

エイリアスは既存エントリの `link` 配列に `rel="alternate"` を追加して設定します（別エントリは作らない）。

```typescript
// 登録（親パスを先頭に配置）
await vtecxnext.put({ feed: { entry: [
  { link: [{ ___rel: 'self', ___href: `/path/member/${uid}` }], contributor },  // 親パス
  { ...(existing), link: [...existingLinks, { ___rel: 'alternate', ___href: `/path/member/${uid}/${cid}` }] },
]}})

// 逆引き検索（エイリアスパスで getFeed → 元エントリが直接返る）
const entries = await vtecxnext.getFeed(`/path/member/${uid}`)

// 担当者一覧抽出
const uids = (entry.link ?? [])
  .filter(l => l.___rel === 'alternate' && l.___href?.startsWith('/path/member/'))
  .map(l => l.___href.split('/')[3])

// 削除（link 配列から除去して PUT）
const updated = (entry.link ?? []).filter(l => l.___href !== `/path/member/${uid}/${cid}`)
await vtecxnext.put({ feed: { entry: [{ ...entry, link: updated }] } })
```

---

## エラーリファレンス

| エラー | 原因 | 対処 |
| --- | --- | --- |
| `Parent path is required` | 親ディレクトリが未登録、または put() で子が親より先 | `folderacls.json` に親パスを追加 / 配列順序を修正 |
| `Key is required` | エントリに `link` が未設定 | `link: [{ ___rel: 'self', ___href: '/path' }]` を追加 |
| `403 Forbidden` | 権限なし / セッション切れ | `folderacls` の権限設定を確認 / ログイン画面へ誘導 |
| `409 Conflict` | `id`（リビジョン）が不一致 | `getEntry` で最新取得し `id` を更新してから再 PUT |
| `Already specified` | 同一フィールドを複数行でインデックス設定 | `field:/path1\|/path2` で1行にまとめる |
| `204` | データが存在しない（正常） | `null` / `undefined` チェックで「データなし」として処理 |
