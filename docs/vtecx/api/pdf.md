# PDF・署名

PDF 生成・電子署名の付与・検証を行うメソッド群。

---

## PDF 生成

### `toPdf(htmlTemplate, filename?)`

```typescript
toPdf(htmlTemplate: string, filename?: string): Promise<boolean>
```

HTML テンプレート文字列を PDF に変換し、レスポンスへ出力する。成功したかどうかを `boolean` で返す。

| 引数 | 型 | 説明 |
| --- | --- | --- |
| `htmlTemplate` | `string` | PDF 化する HTML テンプレート |
| `filename` | `string?` | ダウンロード時のファイル名（省略可） |

```typescript
await vtecxnext.toPdf('<html><body><h1>請求書</h1></body></html>', 'invoice.pdf')
```

---

## 電子署名

### `putSignature(uri, revision?)`

```typescript
putSignature(uri: string, revision?: number): Promise<any>
```

指定した URI のエントリに電子署名を付与する。

| 引数 | 型 | 説明 |
| --- | --- | --- |
| `uri` | `string` | 署名対象エントリの URI |
| `revision` | `number?` | リビジョン（楽観的排他制御。省略可） |

---

### `putSignatures(feed)`

```typescript
putSignatures(feed: any): Promise<any>
```

feed で指定した複数エントリに電子署名を一括で付与する。

---

### `deleteSignature(uri, revision?)`

```typescript
deleteSignature(uri: string, revision?: number): Promise<boolean>
```

指定した URI のエントリの署名を削除する。

---

### `checkSignature(uri)`

```typescript
checkSignature(uri: string): Promise<boolean>
```

指定した URI のエントリの署名が有効かどうかを検証し、`boolean` で返す。

```typescript
const isValid = await vtecxnext.checkSignature('/files/contract/001')
```
