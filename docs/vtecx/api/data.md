# データ操作

エントリの取得・登録・更新・削除・ページネーションを行うメソッド群。

---

## データ取得

### `getEntry(uri, targetService?)`

```typescript
getEntry(uri: string, targetService?: string): Promise<any>
```

指定した URI のエントリを 1 件取得する。データが存在しない場合は `null` / `undefined`（204）を返す。

```typescript
const entry = await vtecxnext.getEntry('/crm/customer/0000000001')
if (entry == null) {
  // データなし（204）
}
```

| 引数 | 型 | 説明 |
| --- | --- | --- |
| `uri` | `string` | エントリの URI |
| `targetService` | `string?` | 連携サービス名（省略可） |

---

### `getFeed(uri, targetService?)`

```typescript
getFeed(uri: string, targetService?: string): Promise<any>
```

指定した URI 配下のエントリ一覧を取得する。データが存在しない場合は `null` / `undefined`（204）を返す。

```typescript
const entries = await vtecxnext.getFeed('/crm/customer')
```

---

### `getFeedResponse(uri, targetService?)`

```typescript
getFeedResponse(uri: string, targetService?: string): Promise<VtecxResponse>
```

`getFeed` と同様だが、ステータスコードやヘッダを含む `VtecxResponse` 形式で返す。

---

### `count(uri, targetService?)`

```typescript
count(uri: string, targetService?: string): Promise<number | null>
```

検索条件にマッチするエントリの件数を返す。

```typescript
const total = await vtecxnext.count('/crm/customer?f&customer.status-eq-active')
```

---

### `countResponse(uri, targetService?)`

```typescript
countResponse(uri: string, targetService?: string): Promise<VtecxResponse>
```

`count` と同様だが `VtecxResponse` 形式で返す。

---

## データ登録・更新

### `post(feed, uri?, targetService?)`

```typescript
post(feed: any, uri?: string, targetService?: string): Promise<any>
```

エントリを新規登録する。ID は vte.cx が自動採番する。

| 引数 | 型 | 説明 |
| --- | --- | --- |
| `feed` | `any` | 登録する feed データ |
| `uri` | `string?` | 親フォルダの URI（省略可） |
| `targetService` | `string?` | 連携サービス名（省略可） |

---

### `put(feed, isbulk?, parallel?, async?, targetService?)`

```typescript
put(
  feed: any,
  isbulk?: boolean,
  parallel?: boolean,
  async?: boolean,
  targetService?: string
): Promise<any>
```

エントリを登録・更新する。複数エントリを 1 回の呼び出しにまとめること。

```typescript
await vtecxnext.put({
  feed: {
    entry: [
      {
        link: [{ ___rel: 'self', ___href: '/crm/customer/001' }],
        customer: { name: '株式会社テスト' },
        contributor: [{ uri: 'urn:vte.cx:acl:/_group/$admin,CURD' }],
      },
    ],
  },
})
```

| 引数 | 型 | 説明 |
| --- | --- | --- |
| `feed` | `any` | 登録・更新する feed データ |
| `isbulk` | `boolean?` | 大量データフラグ（省略可） |
| `parallel` | `boolean?` | 並列処理フラグ（省略可） |
| `async` | `boolean?` | 非同期処理フラグ（省略可） |
| `targetService` | `string?` | 連携サービス名（省略可） |

---

## データ削除

### `deleteEntry(uri, revision?, targetService?)`

```typescript
deleteEntry(uri: string, revision?: number, targetService?: string): Promise<boolean>
```

指定した URI のエントリを 1 件削除する。

| 引数 | 型 | 説明 |
| --- | --- | --- |
| `uri` | `string` | 削除するエントリの URI |
| `revision` | `number?` | リビジョン番号（楽観的排他制御。省略時は強制削除） |
| `targetService` | `string?` | 連携サービス名（省略可） |

---

### `deleteEntries(feed, isbulk?, parallel?, async?, targetService?)`

```typescript
deleteEntries(feed: any, isbulk?: boolean, parallel?: boolean, async?: boolean, targetService?: string): Promise<boolean>
```

複数エントリを一括削除する。

---

### `deleteFolder(uri, async?, targetService?)`

```typescript
deleteFolder(uri: string, async?: boolean, targetService?: string): Promise<boolean>
```

フォルダとその配下のエントリをすべて削除する。

---

### `clearFolder(uri, async?, targetService?)`

```typescript
clearFolder(uri: string, async?: boolean, targetService?: string): Promise<boolean>
```

フォルダ自体は残し、配下のエントリをすべて削除する。

---

## ページネーション

vte.cx のページネーションは 2 ステップ方式。`getPageWithPagination` がこれを自動処理する。

### `getPageWithPagination(uri, num, targetService?)`

```typescript
getPageWithPagination(uri: string, num: number, targetService?: string): Promise<any>
```

`num=1` のとき自動的に `pagination()` を呼び出してカーソルを作成し、指定ページのデータを返す。データなしの場合は `undefined`。

```typescript
const n = parseInt(vtecxnext.getParameter('n') ?? '1', 10)
const entries = await vtecxnext.getPageWithPagination('/crm/customer?l=25', n)
```

---

### `pagination(uri, pagerange, targetService?)`

```typescript
pagination(uri: string, pagerange: string, targetService?: string): Promise<PaginationInfo>
```

カーソルリスト（pageindex）を作成する。`pagerange` は `"1,50"` の形式。

```typescript
const info = await vtecxnext.pagination('/crm/customer?l=25', '1,50')
// info.lastPageNumber: 最終ページ番号（0 = データなし）
// info.hasNext: true = 50ページ以降にもデータがある
```

---

### `getPage(uri, num, targetService?)`

```typescript
getPage(uri: string, num: number, targetService?: string): Promise<any>
```

作成済みカーソルを使って指定ページのデータを取得する。`pagination()` 実行後に使用。

---

## 型定義

```typescript
type VtecxResponse = {
  status: number
  header: any
  data: any
}

type PaginationInfo = {
  lastPageNumber: number    // 最終ページ番号（0 = データなし）
  countWithinRange: number  // 指定ページ範囲内のエントリ数
  hasNext: boolean          // true = endPage を超えるデータが存在する
  isMemorysort: boolean     // メモリソートモードかどうか
}
```
