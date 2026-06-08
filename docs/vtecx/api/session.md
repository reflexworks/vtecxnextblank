# サーバーセッション

サーバーサイドのセッション領域にデータを保存・取得・削除するメソッド群。
セッションデータはリクエストをまたいで保持される（ユーザーセッションに紐付く）。

データ型に応じて 4 種類のサブタイプがある: `Feed`（エントリ一覧）、`Entry`（1 件）、`String`（文字列）、`Long`（整数）。

---

## Feed（エントリ一覧）

### `setSessionFeed(key, feed)`

```typescript
setSessionFeed(key: string, feed: any): Promise<boolean>
```

feed データをセッションに保存する。

```typescript
await vtecxnext.setSessionFeed('cart', { feed: { entry: [...] } })
```

---

### `getSessionFeed(key)`

```typescript
getSessionFeed(key: string): Promise<any>
```

セッションから feed データを取得する。

```typescript
const cart = await vtecxnext.getSessionFeed('cart')
```

---

### `deleteSessionFeed(key)`

```typescript
deleteSessionFeed(key: string): Promise<boolean>
```

セッションから feed データを削除する。

---

## Entry（1 件）

### `setSessionEntry(key, entry)`

```typescript
setSessionEntry(key: string, entry: any): Promise<boolean>
```

エントリ 1 件をセッションに保存する。

---

### `getSessionEntry(key)`

```typescript
getSessionEntry(key: string): Promise<any>
```

セッションからエントリ 1 件を取得する。

---

### `deleteSessionEntry(key)`

```typescript
deleteSessionEntry(key: string): Promise<boolean>
```

セッションからエントリを削除する。

---

## String（文字列）

### `setSessionString(key, value)`

```typescript
setSessionString(key: string, value: string): Promise<boolean>
```

文字列をセッションに保存する。

```typescript
await vtecxnext.setSessionString('selectedTab', 'overview')
```

---

### `getSessionString(key)`

```typescript
getSessionString(key: string): Promise<string | null>
```

セッションから文字列を取得する。

```typescript
const tab = await vtecxnext.getSessionString('selectedTab')
```

---

### `deleteSessionString(key)`

```typescript
deleteSessionString(key: string): Promise<boolean>
```

セッションから文字列を削除する。

---

## Long（整数）

### `setSessionLong(key, value)`

```typescript
setSessionLong(key: string, value: number): Promise<boolean>
```

整数値をセッションに保存する。

```typescript
await vtecxnext.setSessionLong('stepIndex', 2)
```

---

### `getSessionLong(key)`

```typescript
getSessionLong(key: string): Promise<number | null>
```

セッションから整数値を取得する。

---

### `deleteSessionLong(key)`

```typescript
deleteSessionLong(key: string): Promise<boolean>
```

セッションから整数値を削除する。

---

## カウンタ

### `incrementSession(key, num)`

```typescript
incrementSession(key: string, num: number): Promise<number | null>
```

セッション上の整数カウンタに `num` を加算する。加算後の値を返す。

```typescript
const count = await vtecxnext.incrementSession('viewCount', 1)
```
