# vtecxnextblank

## 参考リンク

| リソース | URL |
|---|---|
| 公式サイト | https://vte.cx/ |
| ドキュメント | https://vte.cx/documentation.html |
| 公式ブログ | https://blog.vte.cx/ |
| 公式ガイド（Zenn） | https://zenn.dev/p/vtecx |
| 管理画面 | https://admin.vte.cx/index.html |

---

## セットアップ

### 1. ローカル開発サーバーの起動

#### .env.local の作成

プロジェクトルートに `.env.local` を作成し、以下の環境変数を設定する。このファイルは `.gitignore` に含まれているため、リポジトリにはコミットされない。

```
VTECX_URL=https://{サービス名}.vte.cx
VTECX_APIKEY={管理画面でコピーしたAPIキー}
NEXT_PUBLIC_RECAPTCHA_KEY={reCAPTCHA v2 サイトキー}
NEXT_PUBLIC_VTECXNEXT_URL=http://localhost:3000
```

| 変数 | 取得場所 | 説明 |
|---|---|---|
| `VTECX_URL` | 管理画面 → サービス設定 | vte.cx サービスの URL |
| `VTECX_APIKEY` | 管理画面 → APIキー | サーバーサイドからの API 認証キー |
| `NEXT_PUBLIC_RECAPTCHA_KEY` | Google reCAPTCHA 管理画面 | reCAPTCHA v2 サイトキー |
| `NEXT_PUBLIC_VTECXNEXT_URL` | — | ローカルでは `http://localhost:3000` 固定 |

> `NEXT_PUBLIC_` プレフィックスが付いた変数はブラウザ側でも参照できる。付いていない変数はサーバー側（APIルート）でのみ参照可能。

> `.env.local` を変更した場合は `pnpm dev` を再起動すること。

#### 起動

```bash
pnpm dev
```

ブラウザで http://localhost:3000 を開く。

---

### 2. ログイン

```bash
pnpm run login
```

対話式プロンプトが表示される。

```
service: your-service-name           ← サービス名（VTECX_URL のサブドメイン部分）
is production?: y                    ← サービスが https の場合 y、http の場合 n
login: your-account@example.com      ← vTecx アカウントID
password: **********                 ← パスワード
```

`Logged in.` と表示されれば成功。セッションが保存されるため、次回以降は不要。

---

### 3. スキーマ定義（template.xml）

エンティティのフィールドは `setup/_settings/template.xml` の `<content>` 内に定義する。

#### 構文

```
エンティティ名
 フィールド名(型){最大値}
 フィールド名(型)!
```

- 1スペースインデントで子フィールド（ネスト）
- `!` で必須フィールド、`{n}` で string の最大文字数・数値の最大値

#### 型

| 型 | 用途 |
|---|---|
| `string` | 文字列 |
| `int` | 整数 |
| `long` | 大きな整数（金額など） |
| `date` | 日付（ISO 8601） |
| `boolean` | 真偽値 |
| `float` / `double` | 小数 |

#### ルール

- `entry.title`, `entry.subtitle`, `content.______text` は**使用しない**
- 全フィールドを専用スキーマで定義する
- フィールド名は `snake_case` で記述する（例: `scheduled_date`, `next_action`）

#### 例

```xml
<content>customer
 name(string){255}
 address(string){500}
 phone(string){20}
 status(string){20}
deal
 name(string){255}
 amount(long)
 probability(int){100}
 scheduled_date(date)
</content>
```

---

### 4. 型定義の生成

スキーマ変更のたびに以下の順で実行する。

```bash
pnpm upload:template      # template.xml を vTecx サーバーに反映
pnpm download:typings     # TypeScript型定義を src/typings/index.d.ts に生成
```

- `src/typings/index.d.ts` は**手動編集しない**（コマンドで上書きされる）
- アップロード後は必ず `download:typings` を実行してから実装する

---

### 5. 初期データ登録（folderacls.json）

アプリが使用するデータパスは、事前に vTecx サーバーに登録する必要がある。
登録ファイル: `setup/_settings/folderacls.json`

```bash
pnpm upload:folderacls
```

#### JSON フォーマット

```json
[
  {
    "contributor": [
      { "uri": "urn:vte.cx:acl:/_group/$admin,CURD" },
      { "uri": "urn:vte.cx:acl:+,CURDE" }
    ],
    "link": [{ "___rel": "self", "___href": "/your/path" }]
  }
]
```

#### 権限の振り方

| 主体 | 表記 | 用途 |
|---|---|---|
| システム管理者 | `/_group/$admin` | サービス作成者。どこからでもフルアクセス可能 |
| ログインユーザー | `+` | 認証済みユーザー全員 |
| 全員（匿名含む） | `*` | 公開データに使用 |

| 権限 | 意味 |
|---|---|
| `CURD` | 作成・読取・更新・削除 |
| `CURDE` | `CURD` + E（API経由のみアクセス許可） |
| `RE` | 読取・実行のみ |

- `/_group/$admin` には必ず `CURD` を付与する（`E` を付けると直接アクセスが制限されてしまうため）
- ログインユーザー（`+`）には `CURDE` を付与し、API 経由のみに制限する
- ロールやオーナーチェックは **API ルートではなくフレームワークが行う**。グループごとに適切な権限を folderacls で設定すること

#### パス登録の注意事項

**子パスを登録する場合、親パスも必ず登録する必要がある。**

例: `/crm/customer` を登録する場合は `/crm` の登録も必須。

```json
[
  { "link": [{ "___rel": "self", "___href": "/crm" }], "contributor": [ ... ] },
  { "link": [{ "___rel": "self", "___href": "/crm/customer" }], "contributor": [ ... ] }
]
```

動的IDを含む子パス（例: `/crm/customer/{id}/contact`）は `folderacls.json` への事前登録は不要。ただし、**親エントリ（`/crm/customer/{id}`）を API で登録する際に、子パス（`/crm/customer/{id}/contact`）も同時に登録する必要がある**。ACL は親パスを継承する。

#### システムディレクトリ

先頭が `_` のパス（`/_group`、`/_html` など）はシステムディレクトリで、サービス作成時にフレームワークが自動生成する。folderacls.json への定義は不要。

> `/_group` 自体はシステムディレクトリのため定義不要。サブグループ（`/_group/admin` など）は定義が必要。

---

### 6. メール設定（properties.xml）

`setup/_settings/properties.xml` を編集して `pnpm upload:properties` を実行することで、ユーザー登録メールとパスワードリセットメールが有効になる。

```bash
pnpm upload:properties
```

#### `/_settings/properties` — サーバー設定

```xml
<entry>
  <link href="/_settings/properties" rel="self"/>
  <rights>
_recaptcha.sitekey=your-recaptcha-site-key
_mail.user=apikey
_mail.password=SG.your-sendgrid-api-key
_mail.from=no-reply@your-domain.com
_mail.from.personal=Your Service Name
_mail.transport.protocol=smtps
_mail.smtp.host=smtp.sendgrid.net
_mail.smtp.port=587
_mail.smtp.auth=true
  </rights>
</entry>
```

| キー | 説明 |
|---|---|
| `_recaptcha.sitekey` | reCAPTCHA v2 サイトキー |
| `_mail.user` | SMTPユーザー名（SendGrid は固定値 `apikey`） |
| `_mail.password` | SMTPパスワード（SendGrid APIキー） |
| `_mail.from` | 送信元メールアドレス |
| `_mail.from.personal` | 送信者表示名 |
| `_mail.smtp.host` | SMTPホスト（SendGrid: `smtp.sendgrid.net`） |
| `_mail.smtp.port` | SMTPポート（`587`） |

#### `/_settings/adduser` — ユーザー登録確認メール

```xml
<entry>
  <link href="/_settings/adduser" rel="self"/>
  <title>ユーザ登録のお申込み確認</title>
  <subtitle>text</subtitle>
  <summary>本登録URLをクリックしてください。

${VTECXNEXT_URL}/signup-completion?_RXID=${RXID}

トップページ ${URL}</summary>
  <content type="text/html"><![CDATA[<html>
<body>
<p>本登録URLをクリックしてください。</p>
<p><a href="${VTECXNEXT_URL}/signup-completion?_RXID=${RXID}">本登録はこちら</a></p>
<p>トップページ: <a href="${URL}">${URL}</a></p>
</body>
</html>]]></content>
</entry>
```

#### `/_settings/passreset` — パスワードリセットメール

```xml
<entry>
  <link href="/_settings/passreset" rel="self"/>
  <title>パスワード変更</title>
  <subtitle>text</subtitle>
  <summary>以下のURLをクリックしてパスワード変更を行ってください。

${VTECXNEXT_URL}/change-password?${PASSRESET_TOKEN}</summary>
  <content type="text/html"><![CDATA[<html>
<body>
<p>以下のURLをクリックしてパスワード変更を行ってください。</p>
<p><a href="${VTECXNEXT_URL}/change-password?${PASSRESET_TOKEN}">パスワード変更はこちら</a></p>
</body>
</html>]]></content>
</entry>
```

| 変数 | 内容 |
|---|---|
| `${VTECXNEXT_URL}` | アプリのベースURL（`.env.local` の `NEXT_PUBLIC_VTECXNEXT_URL`） |
| `${RXID}` | 本登録トークン（フレームワークが自動生成） |
| `${PASSRESET_TOKEN}` | パスワードリセットトークン（フレームワークが自動生成） |

---

## vTecx データ構造

### URI 設計

`getFeed` は指定したパス以下の**エントリ一覧を返す**ため、1つのディレクトリに複数種類のデータを混在させてはならない。

#### NG パターン（データ混在）

```
/crm/customer/0000000001
/crm/customer/contact/...   ← 担当者が顧客と同じディレクトリ
/crm/customer/deal/...      ← 商談が顧客と同じディレクトリ
```

`getFeed('/crm/customer')` を呼ぶと顧客一覧だけでなく担当者・商談も返ってくる。

#### OK パターン（種類ごとに独立したディレクトリ）

```
/crm/customer/0000000001
/crm/customer/0000000001/contact   ← 顧客Aの担当者専用
/crm/customer/0000000001/deal      ← 顧客Aの商談専用
/crm/customer/0000000001/activity  ← 顧客Aの対応履歴専用
```

| クエリ | 返るデータ |
|---|---|
| `getFeed('/crm/customer')` | 顧客一覧 |
| `getEntry('/crm/customer/{id}')` | 顧客データ（1件） |
| `getFeed('/crm/customer/{id}/contact')` | その顧客の担当者のみ |
| `getFeed('/crm/customer/{id}/deal')` | その顧客の商談のみ |

#### 設計ルール

1. **1ディレクトリ = 1エンティティ種別** — 異なるエンティティを同じディレクトリ配下に置かない
2. **親子関係はパス階層で表現** — 子エンティティのパスに親IDを含める（例: `/crm/contact/{customerId}/{cid}`）
3. **folderacls はエンティティ種別ごとに登録** — データを置くルートパスをすべて登録する

```json
{ "link": [{ "___rel": "self", "___href": "/crm/customer" }], ... },
{ "link": [{ "___rel": "self", "___href": "/crm/contact" }],  ... },
{ "link": [{ "___rel": "self", "___href": "/crm/deal" }],     ... }
```

---

### entry のデータ形式

vTecx が返す feed の `entry` は、**件数によって型が変わる**ことに注意する。

| 件数 | `entry` の型 |
|---|---|
| 0件 | HTTP 204（`entry` なし） |
| 1件 | オブジェクト `{}` |
| 2件以上 | 配列 `[]` |

フロントエンドでは必ず配列に正規化してから使う。

```typescript
const entries = Array.isArray(data?.feed?.entry)
  ? data.feed.entry
  : data?.feed?.entry
    ? [data.feed.entry]
    : []
```

---

### entry.id の形式

`entry.id` は `{パス},{リビジョン}` の形式で返る。パスを取り出す場合は `,` より前の部分のみ使う。

```typescript
// NG: リビジョン番号が混入する
const id = entry.id.replace('/crm/customer/', '')  // → "0000000001,3"

// OK: パス部分のみ取り出す
const id = entry.id.split(',')[0].replace('/crm/customer/', '')  // → "0000000001"
```

---

## データ取得

### 使い分け

| 状況 | 使うメソッド |
|---|---|
| 件数が少なく全件取得で問題ない一覧 | `getFeed(uri)` |
| 件数が多くページング必要な一覧 | `getPageWithPagination(uri, n)` |
| 一覧の中から1件を取得（詳細・編集画面） | `getEntry(uri)` |

**基本ルール:**
- 一覧データの取得はページングを前提に行う（`getPageWithPagination`）
- 一覧からデータを1件選んで取得する場合は、必ずデータキー（URI）を使って `getEntry` で取得する
- ページング不要な少量データ（マスタ・サブリストなど）は `getFeed` でよい

```typescript
// ページング一覧（顧客一覧など）
const entries = await vtecxnext.getPageWithPagination('/crm/customer?l=25', n)

// ページング不要一覧（件数が少ないサブリストなど）
const feed = await vtecxnext.getFeed('/crm/contact/0000000001')

// 1件取得（一覧→詳細遷移時、編集画面など）
const entry = await vtecxnext.getEntry('/crm/customer/0000000001')
```

---

### メソッド一覧

| メソッド | 用途 |
|---|---|
| `getFeed(uri)` | ページング不要な一覧取得 |
| `getEntry(uri)` | データキーを指定して1件取得 |
| `getPageWithPagination(uri, n)` | ページング一覧取得（`pagination` + `getPage` を一括処理） |
| `pagination(uri, pagerange)` | カーソルリスト（pageindex）を作成 |
| `getPage(uri, n)` | 指定ページのデータを取得（カーソルリストが必要） |

---

### ページング

vTecx のページングは **カーソルリスト（pageindex）** を事前に作成してから、ページ単位でデータを取得する2ステップ方式を取る。

```
① pagination()  ─ 取得キー（URI）とページ範囲を指定してカーソルリストを作成
② getPage()     ─ 作成済みカーソルを使って指定ページのデータを取得
```

`getPageWithPagination(uri, n)` はこの2ステップを内部で自動処理する。n=1 のとき自動的に `pagination()` を呼び出す。データが存在しない場合は `undefined` を返す。

#### URI パラメータ

| パラメータ | 指定箇所 | 説明 |
|---|---|---|
| `l=件数` | URI クエリ | 1ページ当たりの表示件数 |
| `n=ページ番号` | `getPage()` が自動付加 | 取得するページ番号（1始まり） |
| `_pagination=start,end` | `pagination()` が自動付加 | カーソルを作成するページ範囲 |

> `pagination()` と `getPage()` に渡す URI は完全一致である必要がある（検索条件も含めて同一にすること）。

#### pagerange

`pagination(uri, pagerange)` の `pagerange` は `"開始ページ,終了ページ"` 形式。**endPage は 50 推奨**。

```
"1,50"   ← ページ1〜50 のカーソルを一括作成（推奨）
"51,100" ← ページ51〜100 を追加作成（続きがある場合）
```

#### 実装例

```typescript
// ページ番号をクエリパラメータから受け取る
const n = parseInt(vtecxnext.getParameter('n') ?? '1', 10)
const uri = `/crm/customer?l=25`

const entries = await vtecxnext.getPageWithPagination(uri, n)
// entries: エントリの配列、またはデータなしのとき undefined
return vtecxnext.response(200, entries ?? null)
```

#### PaginationInfo

`pagination()` の戻り値。

```typescript
type PaginationInfo = {
  lastPageNumber:   number   // 作成済みカーソルの最終ページ番号（0 = データなし）
  countWithinRange: number   // 指定ページ範囲内のエントリ数
  hasNext:          boolean  // true = 指定 endPage を超えるデータが存在する
  isMemorysort:     boolean  // メモリソートモードかどうか
}
```

| 値 | 意味 | 対処 |
|---|---|---|
| `lastPageNumber === 0` | データが1件もない | null または空を返す |
| `hasNext === true` | endPage 以降にもデータがある | 必要なら `pagination(uri, '51,100')` を追加実行 |

---

## アクセス制御

### 概念

vTecx のアクセス制御はすべて **フレームワークが担う**。API ルートはアクセス制御を実装しない。

```
① クライアント（APIルート）がデータにアクセス権限を付与する
② フレームワークがそのアクセス権限を参照してアクセス制御を行う
③ アクセス権限がない場合はフレームワークが HTTP 403 を返す
```

**API ルートではロールチェック・オーナーチェックを実装しない。** folderacls とエントリの contributor 設定がアクセス制御のすべてである。

---

### contributor によるアクセス権限付与

エントリへのアクセス権限は `contributor` フィールドで設定する。フォーマットは folderacls.json と同一。

```
urn:vte.cx:acl:{グループキーまたはUID},{権限}
```

- 固定プレフィックス: `urn:vte.cx:acl:`
- グループキー（`/_group/$admin` など）または UID を指定する
- 権限は複数のエントリで指定可能

```typescript
const uid = await vtecxnext.uid()
const entry = {
  link: [{ ___rel: 'self', ___href: '/crm/customer/0000000001' }],
  customer: { ... },
  contributor: [
    { uri: 'urn:vte.cx:acl:/_group/$admin,CURD' },  // admin グループは CURD
    { uri: `urn:vte.cx:acl:${uid},CURD` },           // 作成ユーザーは CURD
    { uri: 'urn:vte.cx:acl:/_group/viewer,R' },      // viewer グループは R のみ
  ],
}
```

```
urn:vte.cx:acl:/_group/$admin,CURD  → admin グループに CURD
urn:vte.cx:acl:{uid},R              → 特定ユーザーに R のみ
urn:vte.cx:acl:/_group/test,CRE     → test グループに CRE
```

エントリを更新する際は `existing.contributor` を引き継ぐことで、元のアクセス権限が失われない。

```typescript
const existing = await vtecxnext.getEntry(uri)
const entry = {
  link: [{ ___rel: 'self', ___href: uri }],
  id: existing?.id,                      // 楽観的排他制御
  myData: { ... },
  contributor: existing?.contributor,    // アクセス権限を保持
}
await vtecxnext.put({ feed: { entry: [entry] } })
```

---

### 403 レスポンスへの対応

フレームワークが 403 を返した場合、クライアントはセッション切れまたは権限不足として処理する。

```typescript
if (error?.status === 403) {
  router.push('/login')  // セッション切れ → ログイン画面へ
}
```

---

## ユーザーと UID

### UID の発行

ユーザーがサービスに登録（サインアップ）すると、vTecx フレームワークが自動的に **UID** を発行する。同時にユーザー専用ディレクトリ `/_user/{uid}` が生成される（folderacls.json への定義は不要）。

### UID の取得方法

```typescript
const vtecxnext = new VtecxNext(req)
const uid = await vtecxnext.uid()
```

### ユーザー専用データの保存

```typescript
const uid = await vtecxnext.uid()
const entry = {
  link: [{ ___rel: 'self', ___href: `/crm/user/${uid}` }],
  user: { displayName: 'John Doe', role: 'sales' },
}
await vtecxnext.put({ feed: { entry: [entry] } })
```

---

## グループ管理

### グループディレクトリの事前登録

グループ（`/_group/admin` など）は folderacls.json に定義し、`pnpm upload:folderacls` でサーバーに登録する。

```json
{
  "contributor": [
    { "uri": "urn:vte.cx:acl:/_group/$admin,CURD" },
    { "uri": "urn:vte.cx:acl:+,CURDE" }
  ],
  "link": [{ "___rel": "self", "___href": "/_group/admin" }]
}
```

### メソッド一覧

| メソッド | 用途 |
|---|---|
| `addGroup(group)` | 自分をグループに登録（グループがなければ作成） |
| `joinGroup(group)` | 管理者に招待されたグループへの参加確認 |
| `addGroupByAdmin(uids, group)` | 管理者が指定ユーザーをグループに追加 |
| `leaveGroup(group)` | グループから脱退 |
| `leaveGroupByAdmin(uids, group)` | 管理者がユーザーをグループから削除 |
| `isGroupMember(uri)` | ログインユーザーのグループ所属確認 |
| `getGroups()` | サービス内の全グループ一覧取得 |

```typescript
await vtecxnext.addGroup('/_group/sales')           // 自己登録
await vtecxnext.joinGroup('/_group/sales')           // 招待後の参加確認
await vtecxnext.addGroupByAdmin([uid], '/_group/sales') // 管理者による追加
const isAdmin = await vtecxnext.isGroupMember('/_group/admin')
const groups = await vtecxnext.getGroups()
```

---

## 管理画面（データ確認）

登録したデータは vte.cx の管理画面で確認できる。

- 管理画面 URL: https://admin.vte.cx/index.html
- 対象サービスの管理画面に移動し、**エンドポイント管理**から各ディレクトリにアクセスする

### 操作手順

1. https://admin.vte.cx/index.html にログイン
2. サービス一覧から対象サービスを選択
3. 左メニューの「エンドポイント管理」をクリック

---

## よくあるエラー

### Parent path is required.

```
VtecxNextError: Parent path is required. /your/path
```

**原因**: 登録しようとしたパスの親ディレクトリが vTecx サーバーに存在しない。

**対処**: `folderacls.json` に不足している親パスを追加して `pnpm upload:folderacls` を実行する。

例: `/crm/user/${uid}` への登録が失敗する場合 → `/crm` と `/crm/user` の両方が必要。

```json
[
  { "contributor": [...], "link": [{ "___rel": "self", "___href": "/crm" }] },
  { "contributor": [...], "link": [{ "___rel": "self", "___href": "/crm/user" }] }
]
```

---

### Key is required.

```
VtecxNextError: Key is required.
```

**原因**: `put()` で送信するエントリに `link` が指定されていない。

**対処**: エントリに `link` を明示する。

```typescript
// NG（link なし）
const entry = { user: { ... } }

// OK（link のみ・競合チェックなし）
const entry = {
  link: [{ ___rel: 'self', ___href: '/crm/user/uid123' }],
  user: { ... }
}

// OK（link + id・競合チェックあり）
const entry = {
  link: [{ ___rel: 'self', ___href: '/crm/user/uid123' }],
  id: '/crm/user/uid123,3',   // {path},{revision} 形式
  user: { ... }
}
```

#### `id` フィールドについて

| フィールド | 用途 | 形式 | 必須 |
|---|---|---|---|
| `link[___rel=self].___href` | リソースのパス（キー）指定 | `/path/to/entry` | PUT で必須 |
| `id` | 楽観的排他制御（競合判定） | `{path},{revision}` 例: `/foo,3` | 任意 |

- `id` を含めると、サーバーが現在のリビジョンと照合し、不一致の場合 **409 Conflict** を返す
- `id` を省略すると競合チェックなしで強制上書き

---

### 403 Forbidden

**原因**: アクセス権限がない、またはセッションが切れている。

**対処**:
- セッション切れ → ログイン画面へ自動遷移（`browserutil.handleError` が `/login` にリダイレクト）
- 権限不足 → 「権限がありません」旨のメッセージを表示
- `folderacls.json` のパスに権限が付与されていない場合も発生 → 権限設定を見直して `pnpm upload:folderacls` を再実行

---

### 401 Unauthorized

**原因**: 認証情報が間違っている（IDまたはパスワードの誤り）。

**対処**: ログイン画面で正しいアカウントIDとパスワードを入力し直す。

---

### 204 No Content

**意味**: エラーではなく、**対象データが存在しない**ことを示す正常レスポンス。

**対処**: エラーとして扱わず、「データなし」の状態として処理する。`browserutil.requestApi` では `null` が返る。

```typescript
const data = await browserutil.requestApi('GET', 'crm/customers', '')
if (data === null) {
  // データが存在しない（204）
}
```

---

## コマンドリファレンス

```bash
pnpm run login              # vTecx ログイン
pnpm upload:template        # setup/_settings/template.xml をアップロード
pnpm download:typings       # TypeScript型定義を src/typings/index.d.ts に生成
pnpm upload:folderacls      # setup/_settings/folderacls.json をアップロード
pnpm upload:properties      # setup/_settings/properties.xml をアップロード
pnpm upload:htmlfolders     # setup/_settings/htmlfolders.xml をアップロード
pnpm upload:bigquery        # setup/_settings/bigquery.json をアップロード
pnpm upload:firebase        # setup/_settings/firebase.json をアップロード
```
