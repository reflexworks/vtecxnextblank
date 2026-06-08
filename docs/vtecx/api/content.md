# コンテンツ・ファイル

バイナリファイルの保存・取得・削除・署名付き URL の発行を行うメソッド群。

> アップロード対象のデータは、`VtecxNext` のコンストラクタに渡した `NextRequest`（リクエストボディ）から読み取られる。メソッド引数でコンテンツ本体を直接渡すのは `putcontent` の `arrayBuffer` のみ。

---

## URL 取得

### `getcontenturl(uri)`

```typescript
getcontenturl(uri: string): Promise<string>
```

コンテンツ（ファイル）の URL を取得する。

```typescript
const url = await vtecxnext.getcontenturl('/files/image/001')
```

---

## ファイルアップロード

### `savefiles(uri, bysize?)`

```typescript
savefiles(uri: string, bysize?: boolean): Promise<any>
```

リクエスト（コンストラクタに渡した `NextRequest`）に含まれるマルチパートフォームデータのファイルを、指定 URI 配下に保存する。

| 引数 | 型 | 説明 |
| --- | --- | --- |
| `uri` | `string` | 保存先の URI |
| `bysize` | `boolean?` | サイズ指定モードで保存するか（省略可） |

```typescript
const result = await vtecxnext.savefiles('/files/image')
```

---

### `savefilesBySize(uri)`

```typescript
savefilesBySize(uri: string): Promise<any>
```

`savefiles(uri, true)` 相当。ファイルをサイズ指定モードで保存する。

---

## コンテンツ操作

### `putcontent(uri, filename?, arrayBuffer?)`

```typescript
putcontent(uri: string, filename?: string, arrayBuffer?: ArrayBuffer): Promise<any>
```

コンテンツを指定 URI に保存（上書き）する。`arrayBuffer` を省略した場合はリクエストボディから読み取る。

| 引数 | 型 | 説明 |
| --- | --- | --- |
| `uri` | `string` | 保存先 URI |
| `filename` | `string?` | ファイル名（省略可） |
| `arrayBuffer` | `ArrayBuffer?` | 保存するコンテンツ本体（省略時はリクエストボディ） |

```typescript
await vtecxnext.putcontent('/files/report/001', 'report.pdf', pdfArrayBuffer)
```

---

### `putcontentBySize(uri)`

```typescript
putcontentBySize(uri: string): Promise<any>
```

`putcontent` のサイズ指定モード版。

---

### `postcontent(parenturi, extension?, filename?)`

```typescript
postcontent(parenturi: string, extension?: string, filename?: string): Promise<any>
```

コンテンツを新規作成する。ID は `parenturi` 配下に vte.cx が自動採番する。

| 引数 | 型 | 説明 |
| --- | --- | --- |
| `parenturi` | `string` | 親フォルダの URI |
| `extension` | `string?` | 拡張子（省略可） |
| `filename` | `string?` | ファイル名（省略可） |

---

### `getcontent(uri)`

```typescript
getcontent(uri: string): Promise<boolean>
```

指定 URI のコンテンツを取得し、レスポンスへ書き出す。取得に成功したかどうかを `boolean` で返す。

```typescript
const ok = await vtecxnext.getcontent('/files/report/001')
```

---

### `deletecontent(uri)`

```typescript
deletecontent(uri: string): Promise<any>
```

指定 URI のコンテンツを削除する。

---

## 署名付き URL

大容量ファイルの直接アップロード・ダウンロード向け。クライアントが署名付き URL を使って直接 GCS などと通信するため、サーバーを経由しない。戻り値は `ContentSignedUrl` 型。

### `getSignedUrlToPutContent(uri, filename?)`

```typescript
getSignedUrlToPutContent(uri: string, filename?: string): Promise<ContentSignedUrl>
```

PUT（上書き保存）用の署名付き URL を発行する。

```typescript
const signed = await vtecxnext.getSignedUrlToPutContent('/files/video/001', 'movie.mp4')
```

---

### `getSignedUrlToPostContent(parenturi, extension?, filename?)`

```typescript
getSignedUrlToPostContent(
  parenturi: string,
  extension?: string,
  filename?: string
): Promise<ContentSignedUrl>
```

POST（新規作成）用の署名付き URL を発行する。

---

### `getSignedUrlToGetContent(uri)`

```typescript
getSignedUrlToGetContent(uri: string): Promise<ContentSignedUrl>
```

GET（ダウンロード）用の署名付き URL を発行する。

---

## 型定義

```typescript
type ContentSignedUrl = {
  url: string    // 署名付き URL
  key: string    // 対象コンテンツのキー
}
```
