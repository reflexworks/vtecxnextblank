# vtecxnext API クイックリファレンス

`@vtecx/vtecxnext` SDK の **よく使うメソッドの抜粋と実装例** です。
アプリ実装でまず参照する入口として使ってください。

> **全メソッドの網羅リファレンスは [api/](api/index.md) を参照してください。**
> シグネチャ・引数・戻り値・型定義はカテゴリ別ファイル（`api/*.md`）に集約しています。
> このファイルは重複を避け、頻出メソッドの使い方に絞っています。

公式リファレンス: https://zenn.dev/vtecx/articles/6a02ab2440ef05

| カテゴリ | 網羅リファレンス |
| --- | --- |
| 認証・セッション | [api/auth.md](api/auth.md) |
| データ操作（取得・登録・削除・ページング） | [api/data.md](api/data.md) |
| ユーザー管理 | [api/user.md](api/user.md) |
| グループ管理 | [api/group.md](api/group.md) |
| 採番・カウンタ | [api/counter.md](api/counter.md) |
| サーバーセッション | [api/session.md](api/session.md) |
| コンテンツ・ファイル | [api/content.md](api/content.md) |
| メール・通知 | [api/notify.md](api/notify.md) |
| 外部DB連携（BigQuery / RDB） | [api/db.md](api/db.md) |
| PDF・署名 | [api/pdf.md](api/pdf.md) |
| OAuth・TOTP | [api/oauth.md](api/oauth.md) |
| ACL・エイリアス | [api/acl.md](api/acl.md) |
| ユーティリティ | [api/util.md](api/util.md) |

---

## 初期化

```typescript
import { VtecxNext } from '@vtecx/vtecxnext'

// Next.js API Route 内で初期化
export const GET = async (req: NextRequest): Promise<Response> => {
  const vtecxnext = new VtecxNext(req)
  // ...
}
```

コンストラクタは `req?: NextRequest` と `accessToken?: string` を受け取る。

---

## 認証・セッション情報の取得

→ 一覧は [api/auth.md](api/auth.md)

```typescript
const uid = await vtecxnext.uid()          // ログインユーザーの UID（未ログインはエラー）
const email = await vtecxnext.account()    // アカウント名（メールアドレス）
const serviceName = await vtecxnext.service()  // サービス名

const loggedIn = await vtecxnext.isLoggedin()
if (!loggedIn) {
  return vtecxnext.response(401, { feed: { title: 'Unauthorized.' } })
}
```

---

## データ取得

→ 一覧・戻り値の型は [api/data.md](api/data.md)

```typescript
// 一覧（ページング不要）。データなしは null / undefined（204）
const entries = await vtecxnext.getFeed('/crm/customer')

// 1件取得。データなしは null（204）
const entry = await vtecxnext.getEntry('/crm/customer/0000000001')

// 件数取得。0件は null
const total = await vtecxnext.count('/crm/customer?f&customer.status-eq-active')
```

### ページング

`getPageWithPagination` が「カーソル作成 → ページ取得」の2ステップを内部で自動処理する。

```typescript
const n = parseInt(vtecxnext.getParameter('n') ?? '1', 10)
const entries = await vtecxnext.getPageWithPagination('/crm/customer?l=25', n)
// n=1 のとき自動的に pagination() を呼び出す。データなし: undefined
```

カーソルを手動作成する場合は `pagination()`。

```typescript
const info = await vtecxnext.pagination('/crm/customer?l=25', '1,50')
// info.lastPageNumber: 最終ページ番号（0 = データなし）
// info.hasNext: true = 50ページ以降にもデータがある
```

---

## データ登録・更新

→ 一覧は [api/data.md](api/data.md) ／ まとめ方の方針は [framework.md](framework.md#データ登録更新)

`post` はキーを自動採番、`put` はキー（`link` の `___href`）を指定して登録・更新する。
**複数エントリは1回の `put()` にまとめること。**

```typescript
// post: uri 配下に自動採番して登録
await vtecxnext.post({
  feed: {
    entry: [{
      customer: { name: '株式会社テスト' },
      contributor: [{ uri: 'urn:vte.cx:acl:/_group/$admin,CURD' }],
    }]
  }
}, '/crm/customer')

// put: キーを指定して登録・更新
await vtecxnext.put({
  feed: {
    entry: [
      {
        link: [{ ___rel: 'self', ___href: '/crm/customer/0000000001' }],
        customer: { name: '株式会社テスト', status: 'active' },
        contributor: [
          { uri: 'urn:vte.cx:acl:/_group/$admin,CURD' },
          { uri: `urn:vte.cx:acl:${uid},CURD` },
        ],
      },
    ]
  }
})
```

---

## データ削除

→ 一覧は [api/data.md](api/data.md)

```typescript
// 1件削除（revision を渡すと競合チェックあり）
await vtecxnext.deleteEntry('/crm/customer/0000000001')

// 複数一括削除
await vtecxnext.deleteEntries({
  feed: {
    entry: [
      { link: [{ ___rel: 'self', ___href: '/crm/customer/0000000001' }] },
      { link: [{ ___rel: 'self', ___href: '/crm/customer/0000000002' }] },
    ]
  }
})
```

---

## パスワード変更

→ 一覧は [api/user.md](api/user.md) ／ 2フローの詳細は [framework.md](framework.md#パスワード変更)

```typescript
// ログイン済みフロー（現在のパスワードで変更）
await vtecxnext.changepass(newpswd, oldpswd)

// メールリセットフロー（未ログイン）
await vtecxnext.loginWithRxid(rxid)
await vtecxnext.changepass(newpswd, undefined, passresetToken)
```

パスワードは `getHashpass(password)`（`@vtecx/vtecxauth`）でハッシュしてから渡す。

---

## 採番・カウンタ

→ 一覧は [api/counter.md](api/counter.md)

```typescript
// 連番採番（"開始,終了" 形式の文字列を返す）
const range = await vtecxnext.allocids('/crm/customer/_ids', 1)
const id = range.split(',')[0].padStart(10, '0')  // "0000000042"

// カウンタ加算・参照
const count = await vtecxnext.addids('/crm/counter', 1)
const current = await vtecxnext.getids('/crm/counter')
```

---

## グループ管理

→ 一覧は [api/group.md](api/group.md) ／ グループ設計は [framework.md](framework.md#グループ管理)

```typescript
const isAdmin = await vtecxnext.isAdmin()
// isGroupMember('/_group/$admin') の省略形。true: 所属, false: 非所属

const isSales = await vtecxnext.isGroupMember('/_group/sales')
```

---

## ユーティリティ

→ 一覧は [api/util.md](api/util.md)

```typescript
// クエリパラメータ取得
const rxid = vtecxnext.getParameter('_RXID') ?? ''
const page = parseInt(vtecxnext.getParameter('n') ?? '1', 10)

// CSRF 対策（API ルートの先頭で必ず呼ぶ）
const result = vtecxnext.checkXRequestedWith()
if (result) return result

// レスポンス生成
return vtecxnext.response(200, { feed: { title: 'ok' } })
return vtecxnext.response(401, { feed: { title: 'Unauthorized.' } })

// ログ登録（title デフォルト: 'JavaScript'）
await vtecxnext.log('処理完了', 'MyApp', 'INFO')
```

---

## @vtecx/vtecxauth

クライアントサイド（ブラウザ）向けユーティリティ。

```typescript
import { getHashpass } from '@vtecx/vtecxauth'

const hashedPassword = getHashpass(rawPassword)
// パスワードをハッシュ化（API 送信前に使用）
```

---

## エラーハンドリング

エラー時の戻り値: `{ feed: { title: string } }`

```typescript
try {
  const entries = await vtecxnext.getFeed('/crm/customer')
  return vtecxnext.response(200, { feed: { entry: entries } })
} catch (e) {
  return apiutil.responseError(e, 'api customers')
}
```

エラー型判定:

```typescript
import { isVtecxNextError } from '@vtecx/vtecxnext'

if (isVtecxNextError(e)) {
  // e.status / e.message でステータス・メッセージ取得
}
```
