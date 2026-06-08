# 外部DB連携

BigQuery・RDB（リレーショナルDB）との連携を行うメソッド群。

SQL には `?` プレースホルダを使い、`values` でバインド値を渡す。

---

## BigQuery（クエリ実行）

### `getBQ(sql, values?, parent?)`

```typescript
getBQ(sql: string, values?: any[], parent?: string): Promise<any>
```

BigQuery に SELECT クエリを実行し、結果を取得する。

```typescript
const result = await vtecxnext.getBQ(
  'SELECT * FROM `dataset.table` WHERE status = ? LIMIT 100',
  ['active']
)
```

---

### `execBQ(sql, values?, parent?)`

```typescript
execBQ(sql: string, values?: any[], parent?: string): Promise<any>
```

BigQuery に INSERT / UPDATE / DELETE などのクエリを実行する。

---

### `getBQCsv(sql, values?, filename?, parent?)`

```typescript
getBQCsv(sql: string, values?: any[], filename?: string, parent?: string): Promise<boolean>
```

BigQuery クエリの結果を CSV としてレスポンスへ出力する。成功したかどうかを `boolean` で返す。

---

## BigQuery（エントリ連携）

vte.cx のエントリを BigQuery にエクスポート・削除する。`tablenames` でエンティティとテーブルの対応を指定する。

### `postBQ(feed, async?, tablenames?)`

```typescript
postBQ(feed: any, async?: boolean, tablenames?: any): Promise<boolean>
```

feed のエントリを BigQuery に登録する。

---

### `deleteBQ(keys, async?, tablenames?)`

```typescript
deleteBQ(keys: string[], async?: boolean, tablenames?: any): Promise<boolean>
```

指定したキー（URI）のエントリを BigQuery から削除する。

---

## BigQuery DB（BDBQ）

vte.cx データストアと BigQuery を同時に更新する機能。

### `postBDBQ(feed, uri?, tablenames?, async?)`

```typescript
postBDBQ(feed: any, uri?: string, tablenames?: any, async?: boolean): Promise<any>
```

エントリをデータストアと BigQuery に新規登録する。

---

### `putBDBQ(feed, uri?, tablenames?, async?, isbulk?)`

```typescript
putBDBQ(feed: any, uri?: string, tablenames?: any, async?: boolean, isbulk?: boolean): Promise<any>
```

エントリをデータストアと BigQuery で更新する。

---

### `deleteBDBQ(keys, tablenames?, async?)`

```typescript
deleteBDBQ(keys: string[], tablenames?: any, async?: boolean): Promise<boolean>
```

指定したキー（URI）のエントリをデータストアと BigQuery から削除する。

---

## RDB（リレーショナルDB）

### `queryRDB(sql, values?, parent?)`

```typescript
queryRDB(sql: string, values?: any[], parent?: string): Promise<any>
```

RDB に SELECT クエリを実行し、結果を返す。

```typescript
const rows = await vtecxnext.queryRDB(
  'SELECT * FROM customers WHERE status = ?',
  ['active']
)
```

---

### `queryRDBCsv(sql, values?, filename?, parent?)`

```typescript
queryRDBCsv(sql: string, values?: any[], filename?: string, parent?: string): Promise<boolean>
```

RDB クエリの結果を CSV としてレスポンスへ出力する。成功したかどうかを `boolean` で返す。

---

### `execRDB(sqls, values?, async?, isbulk?)`

```typescript
execRDB(sqls: string[], values?: any[][], async?: boolean, isbulk?: boolean): Promise<any>
```

RDB に複数の INSERT / UPDATE / DELETE を実行する。`sqls` は SQL の配列、`values` はそれぞれに対応するバインド値の配列。

```typescript
await vtecxnext.execRDB(
  ['UPDATE customers SET status = ? WHERE id = ?'],
  [['inactive', customerId]]
)
```
