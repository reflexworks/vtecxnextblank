# AGENTS.md — vtecxnextblank

OpenAI Codex などの AI エージェントが自動的に読み込むプロジェクト指示ファイルです。
このプロジェクトで実装を行う前に、このファイルを読んでください。

詳細な仕様は以下のドキュメントを参照してください。

- [docs/vtecx/framework.md](docs/vtecx/framework.md) — vte.cx フレームワーク仕様（データ構造・アクセス制御・スキーマ・エラーリファレンス）
- [docs/vtecx/vtecxnext-api.md](docs/vtecx/vtecxnext-api.md) — `@vtecx/vtecxnext` SDK のよく使うメソッドのクイックリファレンス＋実装例
- [docs/vtecx/api/](docs/vtecx/api/index.md) — SDK 全メソッドの網羅リファレンス（カテゴリ別。必要時に参照）
- [CONTEXT.md](CONTEXT.md) — 制約・NG/OK パターン・クイックリファレンス
- [README.md](README.md) — セットアップ手順・コマンドリファレンス

---

## プロジェクト概要

vte.cx BaaS を使った Next.js アプリケーションのスタータープロジェクト。
ユーザー認証（サインアップ・ログイン・パスワードリセット）が組み込まれており、アプリ固有の機能実装にすぐ取りかかれます。

| 項目 | 内容 |
| --- | --- |
| バックエンド | vte.cx（BaaS） |
| フロントエンド | Next.js + TypeScript + MUI |
| SDK | `@vtecx/vtecxnext`（サーバーサイド API） |
| パッケージマネージャ | pnpm |

---

## ディレクトリ構成

```
src/
  app/
    api/(vtecx)/   ← Next.js API ルート（vtecxnext SDK 使用）
    (page)/        ← ページコンポーネント（クライアントサイド）
  components/      ← 共通コンポーネント
  constants/       ← アプリ定数（app_name など）
  hooks/           ← カスタムフック（useLoader など）
  utils/
    apiutil.ts     ← サーバーサイドユーティリティ
    apiconst.ts    ← API定数（メール設定URI など）
    browserutil.ts ← クライアントサイドユーティリティ（requestApi）
    checkutil.ts   ← バリデーションユーティリティ（email_regex など）
    commonutil.ts  ← 共通ユーティリティ
  typings/
    index.d.ts     ← pnpm download:typings で自動生成（手動編集禁止）
setup/_settings/   ← vte.cx 設定ファイル（template.xml, folderacls.json など）
docs/vtecx/        ← vte.cx フレームワーク仕様ドキュメント
```

---

## 絶対に守る制約

### スキーマ（template.xml）

- **フィールドは削除不可** — 管理画面に削除機能がないため、一度定義したフィールドは恒久的に残る
- **フィールド追加は末尾のみ** — 既存フィールドの途中に挿入するとスキーマが壊れる
- **フィールド名は snake_case** — 小文字英字・数字・アンダースコアのみ（先頭は小文字英字）
- **カスタムフィールドは必ず template.xml に定義** — `rights` / `title` / `summary` に JSON を詰めない

```
// ❌ NG
{ rights: JSON.stringify({ uid, isAdmin }) }

// ✅ OK
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
- **インデックスは既存データに遡及しない** — 設定後に登録・更新したデータのみ有効

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

## 実装パターン

### API ルート（サーバーサイド）

```typescript
import { NextRequest } from 'next/server'
import { VtecxNext } from '@vtecx/vtecxnext'
import * as apiutil from '@/utils/apiutil'

export const GET = async (req: NextRequest): Promise<Response> => {
  try {
    const vtecxnext = new VtecxNext(req)
    const result = vtecxnext.checkXRequestedWith()
    if (result) return result

    // 実装...
    return vtecxnext.response(200, { feed: { ... } })
  } catch (e) {
    return apiutil.responseError(e, 'api xxx')
  }
}
```

### クライアントサイド API 呼び出し

```typescript
import * as browserutil from '@/utils/browserutil'

const res = await browserutil.requestApi('GET', 'endpoint', '')
const res = await browserutil.requestApi('POST', 'endpoint', '', JSON.stringify(body))
```

`browserutil.requestApi` は 403 のとき例外をスローする。未ログイン判定は try/catch で受け取る。

---

## 注意事項

- `setup/_settings/properties.xml` は `.gitignore` に追加済み（認証情報を含むためコミット禁止）
- `src/typings/index.d.ts` は手動編集禁止（`pnpm download:typings` で上書きされる）
- API ルートにロールチェックを実装しない — フレームワーク（folderacls / contributor）が制御する
