# vtecxnextblank

## Claude Code（AI）での利用方法

このリポジトリは vte.cx を使ったシステム開発の**実装リファレンス**です。  
Claude Code などの AI に vte.cx の仕様・実装パターンを参照させることで、開発を効率化できます。

### 方法 1: 自分のプロジェクトの CLAUDE.md に追記（推奨）

新しいプロジェクトの `CLAUDE.md` に以下を追加してください。Claude Code が自動的に読み込みます。

```markdown
## vte.cx 仕様の参照先

vte.cx BaaS の仕様（SDK の使い方・エンティティ・ACL・認証など）を確認する場合は、
以下の実装リファレンスを参照すること。

- 実装パターン・制約・よくあるミス: https://raw.githubusercontent.com/takeyama/vtecx-crm/main/CONTEXT.md
- フレームワーク仕様（スキーマ・ACL・データ取得）: https://raw.githubusercontent.com/takeyama/vtecx-crm/main/README.md
```

### 方法 2: 会話中に URL を渡す

```
@https://raw.githubusercontent.com/takeyama/vtecx-crm/main/CONTEXT.md
vte.cx で顧客管理APIを実装したい
```

### 方法 3: リポジトリをクローンして直接参照

```bash
# サブモジュールとして追加
git submodule add https://github.com/takeyama/vtecx-crm .vtecx-reference
```

`CLAUDE.md` に以下を追記：

```markdown
vte.cx の仕様・実装パターンは .vtecx-reference/ を参照すること。
```

### 主な参照ファイル

| ファイル | 内容 |
| --- | --- |
| [`CONTEXT.md`](CONTEXT.md) | AI向け地図。実装パターン・制約・よくあるミスを凝縮 |
| [`README.md`](README.md) | vte.cx フレームワーク仕様（SDK・ACL・スキーマ・ページング） |
| [`doc/02_data_model.md`](doc/02_data_model.md) | エンティティ定義・フィールド一覧・URI設計 |
| [`doc/03_api.md`](doc/03_api.md) | API エンドポイント仕様 |
| [`doc/04_screens.md`](doc/04_screens.md) | 画面仕様 |
| [`setup/_settings/template.xml`](setup/_settings/template.xml) | スキーマ定義の具体例 |
| [`setup/_settings/folderacls.json`](setup/_settings/folderacls.json) | ACL 設定の具体例 |

📖 **ドキュメントサイト**: https://takeyama.github.io/vtecx-crm/

---

## 参考リンク

> **⚠️ vte.cx の仕様を確認する場合は、以下の参考リンクを参照すること。**  
> SDK の使い方・スキーマ定義・インデックス設定・ACL・クエリ構文など、仕様に疑問がある場合は  
> 実装前に必ず公式ドキュメントまたは管理画面ソースコードで正しい仕様を確認すること。

| リソース                     | URL                                                      |
| ---------------------------- | -------------------------------------------------------- |
| 公式サイト                   | https://vte.cx/                                          |
| ドキュメント                 | https://vte.cx/documentation.html                        |
| 公式ブログ                   | https://blog.vte.cx/                                     |
| 公式ガイド（Zenn）           | https://zenn.dev/p/vtecx                                 |
| 管理画面                     | https://admin.vte.cx/index.html                          |
| 管理画面ソースコード         | https://github.com/reflexworks/vtecx-adminpanel          |

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

| 変数                        | 取得場所                  | 説明                                      |
| --------------------------- | ------------------------- | ----------------------------------------- |
| `VTECX_URL`                 | 管理画面 → サービス設定   | vte.cx サービスの URL                     |
| `VTECX_APIKEY`              | 管理画面 → APIキー        | サーバーサイドからの API 認証キー         |
| `NEXT_PUBLIC_RECAPTCHA_KEY` | Google reCAPTCHA 管理画面 | reCAPTCHA v2 サイトキー                   |
| `NEXT_PUBLIC_VTECXNEXT_URL` | —                         | ローカルでは `http://localhost:3000` 固定 |

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
login: your-account@example.com      ← vte.cx アカウントID
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

| 型                 | 用途                   |
| ------------------ | ---------------------- |
| `string`           | 文字列                 |
| `int`              | 整数                   |
| `long`             | 大きな整数（金額など） |
| `date`             | 日付（ISO 8601）       |
| `boolean`          | 真偽値                 |
| `float` / `double` | 小数                   |

#### ルール

- `entry.title`, `entry.subtitle`, `content.______text` は**使用しない**
- 全フィールドを専用スキーマで定義する
- フィールド名は `snake_case` で記述する（例: `scheduled_date`, `next_action`）
- フィールド名は小文字英字・数字・アンダースコアのみ（先頭は小文字英字）

#### ⚠️ スキーマ変更の制約

- **フィールドの削除は不可** — 管理画面に削除機能がないため、一度定義したフィールドは恒久的に残る。フィールド設計は慎重に行う
- **追加フィールドは必ず末尾に追記する** — 既存フィールドの途中に挿入するとスキーマが壊れる。新しいフィールドは常にそのエンティティの**最後尾**に追加すること
- **子要素を持つフィールドの名前変更不可** — ネストしたフィールドの親は変更できない
- **`template.xml` はコード側の定義** — フィールド構造（DSL）は `<content>` タグ、インデックス・フィールドACL・暗号化は `<rights>` タグで管理する（後述）

```
// ❌ NG: 既存フィールドの途中に挿入
activity
 ...
 next_action(string){500}
 next_action_date(date)     ← 途中に挿入
 contact_uri(string){500}   ← 既存フィールド
 created_uid(string){255}
 is_deleted(boolean)

// ✅ OK: 既存フィールドをすべて保持し、末尾に追記
activity
 ...
 next_action(string){500}
 contact_uri(string){500}   ← 既存フィールドはそのまま
 created_uid(string){255}
 is_deleted(boolean)
 next_action_date(date)     ← 末尾に追加
```

#### ⚠️ スキーマ定義の原則（重要）

**エントリに含める全てのカスタムフィールドは `template.xml` でスキーマ定義すること。**  
これは保存するデータだけでなく、API レスポンスとして返すフィールドも対象。

```typescript
// ❌ NG: 標準 Atom フィールド(rights/title/summary)に JSON 文字列を詰め込む
const entry = { rights: JSON.stringify({ uid, isAdmin, isSales }) }

// ✅ OK: スキーマ定義したエンティティのフィールドに直接セット
// template.xml に userprofile.uid / userprofile.is_admin 等を定義済み
const entry = { userprofile: { uid, is_admin: isAdmin, is_sales: isSales } }
```

この原則を守ることで：

- vte.cx のバリデーション・インデックスが正しく機能する
- `pnpm download:typings` で型定義が自動生成される
- エントリの構造が自己文書化される

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

#### インデックス設定（`<rights>` タグ）

フィールドに検索インデックスを設定することで、そのフィールドを使った絞り込み・ソートが可能になる。  
インデックスのない フィールドは URI パラメータでの絞り込みができない。

インデックス設定は `template.xml` の `<rights>` タグに記述する。

##### 構文

```
{フィールドパス}:{フォルダパスの正規表現}
```

| 要素 | 説明 |
| --- | --- |
| `フィールドパス` | エンティティ名.フィールド名（例: `customer.status`） |
| `フォルダパスの正規表現` | インデックスを有効にするフォルダパス（正規表現）。`|` で複数指定可 |

##### インデックスの種類

| 構文 | 種類 | 用途 |
| --- | --- | --- |
| `field:path` | 通常インデックス | 完全一致検索・ソート・範囲検索 |
| `field;path` | 全文検索インデックス | 部分一致検索（`like` 検索） |
| `field1\|field2;path` | 複数フィールド全文検索 | 複数フィールドをまとめて全文検索 |

##### オプション

| 記法 | 効果 |
| --- | --- |
| `field:path=role` | フィールド ACL — 指定ロールのみ読み書き可 |
| `field#` | 暗号化 — フィールド値をサーバー側で暗号化して保存 |

##### 例

```xml
<rights>
customer.status:/crm/customer
customer.assigned_uid:/crm/customer
deal.stage:/crm/deal
deal.customer_uri:/crm/deal
deal.expected_close_date:/crm/deal
activity.next_action_date:/crm/customer
name;/crm/customer|/crm/deal
password#
score:path=admin
</rights>
```

| 行 | 説明 |
| --- | --- |
| `customer.status:/crm/customer` | `/crm/customer` 配下の `customer.status` に通常インデックス |
| `deal.customer_uri:/crm/deal` | `/crm/deal` 配下の `deal.customer_uri` に通常インデックス |
| `name;/crm/customer\|/crm/deal` | 顧客・商談の `name` フィールドに全文検索インデックス（複数パス） |
| `password#` | `password` フィールドを暗号化 |
| `score:path=admin` | `score` フィールドを `admin` ロールのみアクセス可に制限 |

##### 注意事項

- フォルダパスは **正規表現**のため `/crm/customer` は `/crm/customer` で始まるすべてのパスにマッチする
- **同一フィールドへの複数パス設定は `|` で1行にまとめる**（別々の行に分けると "Already specified" エラーになる）
  ```
  // ❌ NG: 別々の行に分けると Already specified エラー
  customer.status:/crm/customer
  customer.status:/crm/member

  // ✅ OK: | で1行にまとめる
  customer.status:/crm/customer|/crm/member
  ```
- インデックス追加後は必ず `pnpm upload:template` でサーバーに反映する
- インデックスなしのフィールドを検索条件に使っても絞り込みは機能しない（全件が返る）
- インデックス検索が有効なのは **先頭の検索条件パラメータのみ**。2番目以降はメモリ上でフィルタされる
- **⚠️ インデックス設定前に登録済みのデータには、後から設定したインデックスは適用されない。** 設定後に登録したデータのみインデックスが付与され、検索結果として返る。既存データを検索対象にするには、該当エントリを再登録（PUT）する必要がある

---

#### インデックスを使った検索クエリ構文

インデックスを設定したフィールドは、URI パラメータで絞り込み・ソートができる。

##### 基本構文

```
{フィールド名}{演算子}{値}
```

**必須フラグ**: フィールド検索を行う場合は URI に `f` パラメータを追加すること。

```
/crm/customer?f&customer.status-eq-active&l=25
```

##### 演算子一覧

| 演算子 | 意味 | 例 |
| --- | --- | --- |
| `-eq-` | 等しい（完全一致） | `customer.status-eq-active` |
| `-ne-` | 等しくない | `customer.status-ne-lost` |
| `-lt-` | より小さい | `deal.amount-lt-1000000` |
| `-le-` | 以下 | `deal.amount-le-1000000` |
| `-gt-` | より大きい | `deal.amount-gt-500000` |
| `-ge-` | 以上 | `deal.expected_close_date-ge-2025-01-01` |
| `-fm-` | 前方一致（LIKE 'value%'） | `customer.name-fm-株式会社` |
| `-bm-` | 後方一致（LIKE '%value'） | `customer.name-bm-株式会社` |
| `-rg-` | 正規表現 | `customer.name-rg-^株式` |
| `-ft-` | 全文検索 | `customer.name-ft-システム` |

##### 実装例

```typescript
// 完全一致フィルタ（ステータス）
const uri = `/crm/customer?f&customer.status-eq-active&l=25`

// 日付範囲フィルタ（クローズ予定日）
const uri = `/crm/deal?f&deal.expected_close_date-ge-2025-01-01&deal.expected_close_date-le-2025-12-31&l=50`

// 全文検索（顧客名）※全文検索インデックス（`;`）が必要
const uri = `/crm/customer?f&customer.name-ft-株式会社&l=25`

// customer_uri による商談フィルタ
const uri = `/crm/deal?f&deal.customer_uri-eq-${encodeURIComponent('/crm/customer/123')}&l=50`
```

##### OR 条件

同一フィールドへの OR 条件は先頭に `|` を付ける。

```
/crm/deal?f&|deal.stage-eq-lead&|deal.stage-eq-proposal&l=50
```

---

### 4. 型定義の生成

スキーマ変更のたびに以下の順で実行する。

```bash
pnpm upload:template      # template.xml を vte.cx サーバーに反映
pnpm download:typings     # TypeScript型定義を src/typings/index.d.ts に生成
```

- `src/typings/index.d.ts` は**手動編集しない**（コマンドで上書きされる）
- アップロード後は必ず `download:typings` を実行してから実装する

---

### 5. 初期データ登録（folderacls.json）

アプリが使用するデータパスは、事前に vte.cx サーバーに登録する必要がある。
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

| 主体             | 表記             | 用途                                         |
| ---------------- | ---------------- | -------------------------------------------- |
| システム管理者   | `/_group/$admin` | サービス作成者。どこからでもフルアクセス可能 |
| ログインユーザー | `+`              | 認証済みユーザー全員                         |
| 全員（匿名含む） | `*`              | 公開データに使用                             |

| 権限    | 意味                                  |
| ------- | ------------------------------------- |
| `CURD`  | 作成・読取・更新・削除                |
| `CURDE` | `CURD` + E（API経由のみアクセス許可） |
| `RE`    | 読取・実行のみ                        |

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

| キー                  | 説明                                         |
| --------------------- | -------------------------------------------- |
| `_recaptcha.sitekey`  | reCAPTCHA v2 サイトキー                      |
| `_mail.user`          | SMTPユーザー名（SendGrid は固定値 `apikey`） |
| `_mail.password`      | SMTPパスワード（SendGrid APIキー）           |
| `_mail.from`          | 送信元メールアドレス                         |
| `_mail.from.personal` | 送信者表示名                                 |
| `_mail.smtp.host`     | SMTPホスト（SendGrid: `smtp.sendgrid.net`）  |
| `_mail.smtp.port`     | SMTPポート（`587`）                          |

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

| 変数                 | 内容                                                             |
| -------------------- | ---------------------------------------------------------------- |
| `${VTECXNEXT_URL}`   | アプリのベースURL（`.env.local` の `NEXT_PUBLIC_VTECXNEXT_URL`） |
| `${RXID}`            | 本登録トークン（フレームワークが自動生成）                       |
| `${PASSRESET_TOKEN}` | パスワードリセットトークン（フレームワークが自動生成）           |

---

## vte.cx データ構造

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

| クエリ                                  | 返るデータ           |
| --------------------------------------- | -------------------- |
| `getFeed('/crm/customer')`              | 顧客一覧             |
| `getEntry('/crm/customer/{id}')`        | 顧客データ（1件）    |
| `getFeed('/crm/customer/{id}/contact')` | その顧客の担当者のみ |
| `getFeed('/crm/customer/{id}/deal')`    | その顧客の商談のみ   |

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

### 戻り値の型

SDK メソッドごとに戻り値の型が異なる。`feed.entry` は SDK 内部で解決されるため、呼び出し側は意識しなくてよい。

| メソッド    | 正常時の型           | 204（データなし） |
| ----------- | -------------------- | ----------------- |
| `getFeed`   | `VtecxApp.Entry[]`   | `null` / `undefined` |
| `getEntry`  | `VtecxApp.Entry`     | `null` / `undefined` |

エラー時は `{ feed: { title: string } }` 型が返る。

```typescript
const entries = await vtecxnext.getFeed('/crm/customer')
// entries は VtecxApp.Entry[]（配列）。Array.isArray による正規化は不要

const entry = await vtecxnext.getEntry('/crm/customer/0000000001')
// entry は VtecxApp.Entry（単一オブジェクト）または null（204）
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

| 状況                                    | 使うメソッド                    |
| --------------------------------------- | ------------------------------- |
| 件数が少なく全件取得で問題ない一覧      | `getFeed(uri)`                  |
| 件数が多くページング必要な一覧          | `getPageWithPagination(uri, n)` |
| 一覧の中から1件を取得（詳細・編集画面） | `getEntry(uri)`                 |

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

| メソッド                        | 用途                                                      |
| ------------------------------- | --------------------------------------------------------- |
| `getFeed(uri)`                  | ページング不要な一覧取得                                  |
| `getEntry(uri)`                 | データキーを指定して1件取得                               |
| `getPageWithPagination(uri, n)` | ページング一覧取得（`pagination` + `getPage` を一括処理） |
| `pagination(uri, pagerange)`    | カーソルリスト（pageindex）を作成                         |
| `getPage(uri, n)`               | 指定ページのデータを取得（カーソルリストが必要）          |

---

### ページング

vte.cx のページングは **カーソルリスト（pageindex）** を事前に作成してから、ページ単位でデータを取得する2ステップ方式を取る。

```
① pagination()  ─ 取得キー（URI）とページ範囲を指定してカーソルリストを作成
② getPage()     ─ 作成済みカーソルを使って指定ページのデータを取得
```

`getPageWithPagination(uri, n)` はこの2ステップを内部で自動処理する。n=1 のとき自動的に `pagination()` を呼び出す。データが存在しない場合は `undefined` を返す。

#### URI パラメータ

| パラメータ              | 指定箇所                  | 説明                          |
| ----------------------- | ------------------------- | ----------------------------- |
| `l=件数`                | URI クエリ                | 1ページ当たりの表示件数       |
| `n=ページ番号`          | `getPage()` が自動付加    | 取得するページ番号（1始まり） |
| `_pagination=start,end` | `pagination()` が自動付加 | カーソルを作成するページ範囲  |

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

| 値                     | 意味                         | 対処                                            |
| ---------------------- | ---------------------------- | ----------------------------------------------- |
| `lastPageNumber === 0` | データが1件もない            | null または空を返す                             |
| `hasNext === true`     | endPage 以降にもデータがある | 必要なら `pagination(uri, '51,100')` を追加実行 |

---

## アクセス制御

### 概念

vte.cx のアクセス制御はすべて **フレームワークが担う**。API ルートはアクセス制御を実装しない。

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

### ⭐ 重要設計原則：1トランザクションにまとめる

> **可能な限り `put()` の `feed.entry` にまとめて、API 呼び出しを1回にすること。**  
> これは vte.cx を使った実装における最重要の設計・実装方針である。

#### なぜ重要か

| 観点 | 個別 PUT（複数回） | まとめた PUT（1回） |
| --- | --- | --- |
| パフォーマンス | N回のネットワーク往復 | 1回のみ |
| 原子性 | 途中でエラーが起きると中途半端な状態になる | 全件成功 or 全件失敗 |
| サーバー負荷 | リクエスト数が多い | 少ない |

#### 設計時に意識すること

- **新規登録** — 親エントリ＋子パス登録＋子エントリをすべて同一 `feed.entry` 配列に含める
- **バルクインサート** — CSV インポートなど複数件の登録はまとめて1回の `put()` で処理する
- **再インデックス** — 既存データの再 PUT も、1顧客ぶんの全子エントリをまとめた1回の `put()` にする

#### 実装例：新規登録で親子をまとめる

`put()` の `feed.entry` に複数エントリを含めることで、**1回の API 呼び出し（1トランザクション）** でまとめて登録できる。  
API 呼び出し回数を減らせるため、バルクインサートや親子データの同時登録に活用する。

```typescript
// ✅ 複数エントリを1回のputでまとめて登録
await vtecxnext.put({
  feed: {
    entry: [
      { link: [{ ___rel: 'self', ___href: '/crm/customer/001' }], customer: {...}, contributor },
      { link: [{ ___rel: 'self', ___href: '/crm/customer/002' }], customer: {...}, contributor },
    ]
  }
})
```

#### ⚠️ 親子データは必ず親を先に配置する

親パスが存在しない状態で子エントリを登録しようとすると `Parent path is required` エラーになる。  
同一の `put()` 内に親・子を混在させる場合は、**配列の先頭に親エントリを配置**すること。

```typescript
// ✅ 正しい順序: 親（顧客）→ 子パス（/contact・/activity）
await vtecxnext.put({
  feed: {
    entry: [
      // 1. 親エントリ（顧客本体）を先に置く
      { link: [{ ___rel: 'self', ___href: '/crm/customer/001' }], customer: {...}, contributor },
      // 2. 子パスはその後に配置
      { link: [{ ___rel: 'self', ___href: '/crm/customer/001/contact' }], contributor },
      { link: [{ ___rel: 'self', ___href: '/crm/customer/001/activity' }], contributor },
    ]
  }
})

// ❌ 誤った順序: 子パスを親より先に置くと Parent path is required エラー
await vtecxnext.put({
  feed: {
    entry: [
      { link: [{ ___rel: 'self', ___href: '/crm/customer/001/contact' }], contributor },  // ← NG
      { link: [{ ___rel: 'self', ___href: '/crm/customer/001' }], customer: {...}, contributor },
    ]
  }
})
```

複数の親子セットをまとめる場合も同様に、各親の直後またはすべての親の後にまとめて子を配置する。

```typescript
// 複数顧客を一括登録する例（親×N → 子×N の順）
const entries = customers.flatMap((customer, i) => {
  const uri = `/crm/customer/${baseId + i}`
  return [
    { link: [{ ___rel: 'self', ___href: uri }], customer, contributor },           // 親
    { link: [{ ___rel: 'self', ___href: `${uri}/contact` }], contributor },        // 子
    { link: [{ ___rel: 'self', ___href: `${uri}/activity` }], contributor },       // 子
  ]
})
await vtecxnext.put({ feed: { entry: entries } })
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

ユーザーがサービスに登録（サインアップ）すると、vte.cx フレームワークが自動的に **UID** を発行する。同時にユーザー専用ディレクトリ `/_user/{uid}` が生成される（folderacls.json への定義は不要）。

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

| メソッド                         | 用途                                           |
| -------------------------------- | ---------------------------------------------- |
| `addGroup(group)`                | 自分をグループに登録（グループがなければ作成） |
| `joinGroup(group)`               | 管理者に招待されたグループへの参加確認         |
| `addGroupByAdmin(uids, group)`   | 管理者が指定ユーザーをグループに追加           |
| `leaveGroup(group)`              | グループから脱退                               |
| `leaveGroupByAdmin(uids, group)` | 管理者がユーザーをグループから削除             |
| `isGroupMember(uri)`             | ログインユーザーのグループ所属確認             |
| `getGroups()`                    | サービス内の全グループ一覧取得                 |

```typescript
await vtecxnext.addGroup('/_group/sales')           // 自己登録
await vtecxnext.joinGroup('/_group/sales')           // 招待後の参加確認
await vtecxnext.addGroupByAdmin([uid], '/_group/sales') // 管理者による追加
const isAdmin = await vtecxnext.isGroupMember('/_group/admin')
const groups = await vtecxnext.getGroups()
```

---

## 管理画面

管理画面 URL: https://admin.vte.cx/index.html

vte.cx の管理画面は**データ設計・アクセス制御・スキーマ設定の中心**であり、ローカルファイル（`template.xml` / `folderacls.json`）と管理画面の両方でサービスを構成する。管理画面のソースコードは https://github.com/reflexworks/vtecx-adminpanel で公開されており、データ構造の仕様や各設定項目の意味を確認する際に参照できる。

### エンドポイント管理

`folderacls.json` に相当するディレクトリパスとアクセス権限を管理する。`pnpm upload:folderacls` でアップロードした後、管理画面でも確認・追加編集が可能。

#### ACL 設定

各エンドポイントに対してグループ単位のアクセス権限を設定する。

| 主体             | 表記             | 用途                                         |
| ---------------- | ---------------- | -------------------------------------------- |
| システム管理者   | `/_group/$admin` | サービス作成者。必ず `CURD` を付与する       |
| ログインユーザー | `+`              | 認証済みユーザー全員。通常 `CURDE` を付与    |
| 全員（匿名含む） | `*`              | 公開データ（`R` のみ推奨）                   |
| カスタムグループ | `/_group/{name}` | 独自ロール（例: `/_group/sales`）             |

| 権限    | 意味                                  |
| ------- | ------------------------------------- |
| `C`     | 作成（POST）                          |
| `R`     | 読取（GET）                           |
| `U`     | 更新（PUT）                           |
| `D`     | 削除（DELETE）                        |
| `E`     | API 経由のみ許可（直接アクセス禁止）  |

#### エイリアス定義

同じデータへの別名パス（`rel="alternate"`）を設定できる。1 エントリに複数設定可能。

エイリアスはデータ設計の一部として決定し、API（`PUT` / `POST`）で設定する。設定後は管理画面のエンドポイント管理から正しく登録されているか確認することを推奨する。

- エイリアスを設定するには親パスが存在している必要がある
- エイリアスキー自体は存在しない（新規パス）である必要がある

---

#### ⭐ エイリアスを使った横断検索（クロス検索）

**エイリアスの最も重要な用途は、インデックスを使わずに「逆引き」を実現すること。**

通常、`getFeed('/crm/customer')` は顧客一覧を返すが、「あるユーザーが担当する顧客一覧」を取得するには顧客側のフィールドに担当者インデックスが必要になる。  
エイリアスを使えば、**別のパス階層からそのエントリを参照できる**ため、インデックスなしで横断検索が可能になる。

##### 設計パターン

```
一次パス（正引き）:  /crm/customer/{cid}/member/{uid}  ← getFeed('/crm/customer/{cid}/member')
エイリアス（逆引き): /crm/member/{uid}/{cid}           ← getFeed('/crm/member/{uid}')
```

##### 登録時の実装（顧客エントリにエイリアスリンクを付与）

エイリアスは、別個のエントリを作るのではなく、**既存の顧客エントリの `link` 配列に `rel="alternate"` を追加する**。  
これにより `getFeed('/crm/member/{uid}')` が顧客エントリを直接返すため N+1 クエリが不要になる。

```typescript
// 1. 顧客エントリを取得（既存リンクを保持するため）
const customer = await vtecxnext.getEntry(`/crm/customer/${cid}`)
const existingLinks = (customer as any)?.link ?? []

// 2. エイリアス親パス登録 + 顧客エントリ更新を1トランザクションでまとめる
//    親パス（/crm/member/{uid}）を先頭に配置する
await vtecxnext.put({
  feed: {
    entry: [
      // 親パス登録（先頭に配置）
      { link: [{ ___rel: 'self', ___href: `/crm/member/${uid}` }], contributor },
      // 顧客エントリに alternate リンクを追加
      {
        ...(customer as any),
        link: [...existingLinks, { ___rel: 'alternate', ___href: `/crm/member/${uid}/${cid}` }],
      },
    ]
  }
})
```

顧客エントリの `link` 配列のイメージ（複数担当者を追加した場合）：

```json
"link": [
  { "___rel": "self",      "___href": "/crm/customer/1780019663455" },
  { "___rel": "alternate", "___href": "/crm/member/uid_tanaka/1780019663455" },
  { "___rel": "alternate", "___href": "/crm/member/uid_suzuki/1780019663455" }
]
```

##### 横断検索（逆引き）の実装

`getFeed` で **顧客エントリが直接返る**（N+1 なし）。

```typescript
// エイリアスパスで getFeed → 顧客エントリが直接返る（別途 getEntry 不要）
const feed = await vtecxnext.getFeed(`/crm/member/${uid}`)
const entries = Array.isArray(feed) ? feed : feed ? [feed] : []

// そのまま顧客データとして使える
entries.forEach((e: any) => {
  console.log(e.customer?.name)  // 顧客名を直接参照
})
```

##### 担当者一覧の取得

逆に「この顧客の担当者一覧」は顧客エントリの `link` から抽出する。

```typescript
const customer = await vtecxnext.getEntry(`/crm/customer/${cid}`)
const links = (customer as any)?.link ?? []
const memberUids = links
  .filter((l: any) => l.___rel === 'alternate' && l.___href?.startsWith('/crm/member/'))
  .map((l: any) => (l.___href as string).split('/')[3])
```

##### 削除時の実装

担当者を外す際は、顧客エントリの `link` 配列から該当の `alternate` リンクを除去して PUT する。

```typescript
const customer = await vtecxnext.getEntry(`/crm/customer/${cid}`)
const altHref = `/crm/member/${uid}/${cid}`
const updatedLinks = ((customer as any)?.link ?? [])
  .filter((l: any) => !(l.___rel === 'alternate' && l.___href === altHref))

await vtecxnext.put({
  feed: { entry: [{ ...(customer as any), link: updatedLinks }] }
})
```

##### エイリアスパスでの検索パラメータとページング

**エイリアスパスでも通常のパスと同様に検索パラメータ・ページングが使用できる。**  
ただし、フィールドフィルタを使う場合は **エイリアスパスに対してインデックスを設定**する必要がある。

```
// template.xml の rights — 同一フィールドの複数パスは | でまとめる
customer.status:/crm/customer|/crm/member    ← 両パスで customer.status フィルタが使用可能に
customer.name;/crm/customer|/crm/member      ← 両パスで customer.name 全文検索が使用可能に
```

> **⚠️ 同一フィールドに複数のパスパターンを設定する場合は `|` で1行にまとめること。**  
> 別々の行に分けると "Already specified" エラーになる。

```typescript
// フィルタ付き横断検索
const uri = `/crm/member/${uid}?f&customer.status-eq-active&l=25`
const feed = await vtecxnext.getFeed(uri)

// ページング付き横断検索
const info = await vtecxnext.pagination(`/crm/member/${uid}?f&l=25`, '1,50')
const entries = await vtecxnext.getPage(`/crm/member/${uid}?f&l=25`, 2)

// フィルタ + ページングの組み合わせ
const baseUri = `/crm/member/${uid}?f&customer.status-eq-active&l=25`
const info2 = await vtecxnext.pagination(baseUri, '1,50')
const page1 = await vtecxnext.getPage(baseUri, 1)
```

> `pagination()` と `getPage()` に渡す URI は完全一致である必要がある（フィルタ条件も含めて同一にすること）。

##### エイリアスの権限設定

エイリアスパス（`/crm/member/{uid}` など）は `folderacls.json` に登録しておくこと。  
横断検索を全ロールに開放する場合は `viewer` にも `RE` を付与する。

```json
{
  "contributor": [
    { "uri": "urn:vte.cx:acl:/_group/$admin,CURD" },
    { "uri": "urn:vte.cx:acl:/_group/sales,CURDE" },
    { "uri": "urn:vte.cx:acl:/_group/viewer,RE" }
  ],
  "link": [{ "___rel": "self", "___href": "/crm/member" }]
}
```

### スキーマ管理

`template.xml` のアップロードで作成されたスキーマを管理画面から確認できる。インデックス・フィールドACL・暗号化の設定は `template.xml` の `<rights>` タグに記述する（「スキーマ定義」セクション参照）。管理画面では設定内容の確認と GUI による追加編集が可能。

#### インデックス設定

`template.xml` の `<rights>` タグに記述する。詳細な構文は「インデックス設定（`<rights>` タグ）」セクションを参照。

| 種類               | 用途                           | 構文例 |
| ------------------ | ------------------------------ | --- |
| 通常インデックス   | 完全一致・範囲検索・ソートに使用 | `entity.field:/path` |
| 全文検索インデックス | 部分一致検索に使用             | `entity.field;/path` |

#### フィールド ACL

フィールドレベルのアクセス制御。特定グループにのみ読取・書込を許可できる。エンドポイント ACL とは独立して動作する。`<rights>` タグに `field:path=role` の形式で記述。

#### 暗号化

フィールド値をサーバー側で暗号化して保存する。個人情報・パスワードなど機密データに使用する。`<rights>` タグに `field#` の形式で記述。

### データ確認

登録したデータはエンドポイント管理から参照できる。

1. https://admin.vte.cx/index.html にログイン
2. サービス一覧から対象サービスを選択
3. 左メニューの「エンドポイント管理」をクリック

---

## よくあるエラー

### Parent path is required.

```
VtecxNextError: Parent path is required. /your/path
```

**原因**: 登録しようとしたパスの親ディレクトリが vte.cx サーバーに存在しない。

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

| フィールド                  | 用途                       | 形式                             | 必須       |
| --------------------------- | -------------------------- | -------------------------------- | ---------- |
| `link[___rel=self].___href` | リソースのパス（キー）指定 | `/path/to/entry`                 | PUT で必須 |
| `id`                        | 楽観的排他制御（競合判定） | `{path},{revision}` 例: `/foo,3` | 任意       |

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

**対処**: エラーとして扱わず、「データなし」の状態として処理する。`getFeed` / `getEntry` では `null` または `undefined` が返る。

```typescript
const entry = await vtecxnext.getEntry('/crm/customer/0000000001')
if (entry == null) {
  // データが存在しない（204）
}
```

---

## コマンドリファレンス

```bash
pnpm run login              # vte.cx ログイン
pnpm upload:template        # setup/_settings/template.xml をアップロード
pnpm download:typings       # TypeScript型定義を src/typings/index.d.ts に生成
pnpm upload:folderacls      # setup/_settings/folderacls.json をアップロード
pnpm upload:properties      # setup/_settings/properties.xml をアップロード
pnpm upload:htmlfolders     # setup/_settings/htmlfolders.xml をアップロード
pnpm upload:bigquery        # setup/_settings/bigquery.json をアップロード
pnpm upload:firebase        # setup/_settings/firebase.json をアップロード
```
