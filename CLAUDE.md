# CLAUDE.md — vtecxnextblank

Claude Code が自動的に読み込むオーケストレーターです。
このプロジェクトで実装を行う前に、以下のドキュメントを参照してください。

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

## 参照ドキュメント

### プロジェクト固有

- @CONTEXT.md — 絶対に守る制約・NG/OK パターン・SDK クイックリファレンス・インデックス・エイリアス・エラーリファレンス
- @README.md — セットアップ手順・コマンドリファレンス・アカウント管理

### vte.cx フレームワーク（横展開可能）

- @docs/vtecx/framework.md — データ構造・アクセス制御・スキーマ設計・ページング・グループ管理・エイリアス・メール設定・エラーリファレンス
- @docs/vtecx/vtecxnext-api.md — `@vtecx/vtecxnext` SDK のよく使うメソッドのクイックリファレンス＋実装例
- docs/vtecx/api/ — SDK 全メソッドの網羅リファレンス（カテゴリ別。必要時に参照）

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
