# 採番・カウンタ

連番 ID の払い出しや、カウンタ値の操作を行うメソッド群。
vte.cx のカウンタ機能は、原子性が保証された連番採番に使用する。

---

## 連番採番

### `allocids(uri, num, targetService?)`

```typescript
allocids(uri: string, num: number, targetService?: string): Promise<string>
```

指定した URI のカウンタから `num` 個の連番を払い出す。
`"{開始},{終了}"` 形式の文字列を返す。

```typescript
const range = await vtecxnext.allocids('/crm/customer/_ids', 1)
// 例: "42,43" → 42 を払い出し（num=1 で 1 件）
const id = range.split(',')[0]           // "42"
const paddedId = id.padStart(10, '0')   // "0000000042"
```

---

### `addids(uri, num, targetService?)`

```typescript
addids(uri: string, num: number, targetService?: string): Promise<number | null>
```

カウンタに `num` を加算し、加算後の値を返す。

```typescript
const next = await vtecxnext.addids('/counter/order', 1)
```

---

## カウンタ参照・設定

### `getids(uri, targetService?)`

```typescript
getids(uri: string, targetService?: string): Promise<number | null>
```

カウンタの現在値を取得する。

```typescript
const current = await vtecxnext.getids('/counter/order')
```

---

### `setids(uri, num, targetService?)`

```typescript
setids(uri: string, num: number, targetService?: string): Promise<number | null>
```

カウンタの値を指定した値に設定する。設定後の値を返す。

```typescript
await vtecxnext.setids('/counter/order', 1000)
```

---

## 範囲採番

### `rangeids(uri, range)`

```typescript
rangeids(uri: string, range: string): Promise<string>
```

カウンタから指定した範囲を確保する。`range` は `"{開始}-{終了}"` 形式。
確保した範囲を文字列で返す。

```typescript
const result = await vtecxnext.rangeids('/counter/order', '1-100')
// 例: "1-100"
```

---

### `getRangeids(uri)`

```typescript
getRangeids(uri: string): Promise<string>
```

`rangeids()` で確保した範囲の現在値を文字列で返す。
