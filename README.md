# vtecxnextblank

vte.cx BaaS を使った Next.js アプリケーションのスタータープロジェクトです。ユーザー認証（サインアップ・ログイン・パスワードリセット）が組み込まれており、アプリ固有の機能実装にすぐ取りかかれます。

| 項目                 | 内容                                     |
| -------------------- | ---------------------------------------- |
| バックエンド         | vte.cx（BaaS）                           |
| フロントエンド       | Next.js + TypeScript                     |
| SDK                  | `@vtecx/vtecxnext`（サーバーサイド API） |
| パッケージマネージャ | pnpm                                     |

---

## 参考リンク

| リソース                        | URL                                             |
| ------------------------------- | ----------------------------------------------- |
| 公式サイト                      | https://vte.cx/                                 |
| ドキュメント                    | https://vte.cx/documentation.html               |
| 公式ブログ                      | https://blog.vte.cx/                            |
| 公式ガイド（Zenn）              | https://zenn.dev/p/vtecx                        |
| 管理画面                        | https://admin.vte.cx/index.html                 |
| 管理画面ソースコード            | https://github.com/reflexworks/vtecx-adminpanel |
| 実装例リファレンス              | https://takeyama.github.io/vtecx-crm/           |
| vtecxnext APIリファレンス       | https://zenn.dev/vtecx/articles/6a02ab2440ef05  |
| vtecxを使用した公開プロジェクト | https://github.com/reflexworks/vtecx-invoice    |

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

`setup/_settings/template.xml` の `<content>` にエンティティのフィールドを定義する。スキーマ構文・型・制約・インデックス設定の詳細は [docs/vtecx/framework.md](docs/vtecx/framework.md) を参照。

```bash
pnpm upload:template      # template.xml を vte.cx サーバーに反映
pnpm download:typings     # TypeScript型定義を src/typings/index.d.ts に生成
```

- スキーマ変更後は上記の順で必ず実行する
- `src/typings/index.d.ts` は手動編集禁止（コマンドで上書きされる）

---

### 4. 初期データ登録（folderacls.json）

アプリが使用するデータパスとアクセス権限を `setup/_settings/folderacls.json` に定義し、サーバーに登録する。フォーマット・権限設定の詳細は [docs/vtecx/framework.md](docs/vtecx/framework.md) を参照。

```bash
pnpm upload:folderacls
```

---

### 5. メール設定（properties.xml）

`setup/_settings/properties.xml` を編集して `pnpm upload:properties` を実行することで、ユーザー登録メールとパスワードリセットメールが有効になる。設定内容の詳細は [docs/vtecx/framework.md](docs/vtecx/framework.md) を参照。

```bash
pnpm upload:properties
```

---

### 6. アカウントの追加

サービスへのアカウント追加は **新規登録フォームから行う**。

> **注意:** https://admin.vte.cx のユーザー管理からアカウントを追加することはできない。admin.vte.cx で追加したアカウントはサービスを作成できるアカウント（管理者）になるものであり、作成したサービスのユーザーとは別。

#### 手順

1. `http://localhost:3000/signup`（または本番URL `/signup`）を開く
2. アカウントID（メールアドレス）とパスワードを入力して登録
3. 確認メールのリンクをクリックして本登録完了

#### アカウントの状態

登録後のアカウントには **仮登録** と **本登録** の 2 つの状態がある。詳細は [docs/vtecx/framework.md](docs/vtecx/framework.md) を参照。

アカウントの現在の状態は **https://admin.vte.cx → 該当サービスの「管理画面」→ ユーザー管理** から確認できる。

#### 確認メールが届かない場合

`setup/_settings/properties.xml` のメール設定（`_mail.*`）が未完了の可能性がある。[5. メール設定（properties.xml）](#5-メール設定propertiesxml) を参照して設定を確認する。

#### パスワード変更

パスワード変更も同様にフォームから行う。

**未ログインの場合（パスワードを忘れた場合）**

1. `http://localhost:3000/forgot-password`（または本番URL `/forgot-password`）を開く
2. 登録済みのメールアドレスを入力して送信
3. パスワードリセットメールのリンクをクリックして新しいパスワードを設定

**ログイン済みの場合**

セッション中のユーザーは現在のパスワードを使ってパスワードを変更できる（メールは不要）。

1. `http://localhost:3000/account/change-password` を開く
2. 現在のパスワード・新しいパスワード・確認用パスワードを入力して送信
3. 完了画面が表示されたらパスワード変更完了

---

## vte.cx フレームワーク仕様

vte.cx のデータ構造・アクセス制御・スキーマ設計・エラーリファレンスは `@vtecx/vtecxdocument` パッケージのドキュメントを参照してください。

- [framework.md](node_modules/@vtecx/vtecxdocument/docs/framework.md) — vte.cx フレームワーク仕様
- [vtecxnext-api.md](node_modules/@vtecx/vtecxdocument/docs/vtecxnext-api.md) — vtecxnext SDK クイックリファレンス（よく使うメソッド＋実装例）
- [docs/api/](node_modules/@vtecx/vtecxdocument/docs/api/index.md) — vtecxnext SDK 全メソッド網羅リファレンス（カテゴリ別）

ドキュメントの更新は `pnpm update @vtecx/vtecxdocument` で行う。

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
pnpm update @vtecx/vtecxdocument  # vte.cx フレームワーク仕様ドキュメントを更新
```
