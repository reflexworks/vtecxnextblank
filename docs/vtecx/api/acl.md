# ACL・エイリアス

エントリのアクセス権限（ACL）とエイリアス（複数パス参照）を操作するメソッド群。

> これらのメソッドは引数に **feed** を取る。対象エントリと追加・削除する ACL／エイリアスを `link` に含めた feed を渡す。
> 通常は `put()` でエントリ登録・更新時に `contributor`（ACL）や `link` の `rel="alternate"`（エイリアス）を設定すれば足りる。以下は既存エントリの ACL／エイリアスを部分的に増減したい場合に使う。

---

## ACL 操作

### `addacl(feed)`

```typescript
addacl(feed: any): Promise<any>
```

feed で指定したエントリに ACL を追加する。

| 引数 | 型 | 説明 |
| --- | --- | --- |
| `feed` | `any` | 対象エントリと追加する ACL（`contributor`）を含む feed |

#### ACL 文字列の形式

```
urn:vte.cx:acl:/_group/$admin,CURD    ← 管理者グループにCURD権限
urn:vte.cx:acl:+,CURDE                ← ログインユーザー全員にCURDE権限
urn:vte.cx:acl:{uid},CURD             ← 特定ユーザーにCURD権限
urn:vte.cx:acl:/_group/viewer,R       ← viewerグループに読み取り権限のみ
```

---

### `removeacl(feed)`

```typescript
removeacl(feed: any): Promise<any>
```

feed で指定したエントリから ACL を削除する。

---

## エイリアス操作

エイリアスは同一エントリを複数のパスから参照する仕組み。
通常は `put()` で `link` 配列に `___rel: 'alternate'` を追加することで設定するが、`addalias` / `removealias` でも操作できる。

詳細は [framework.md](../framework.md#エイリアス横断検索) を参照。

### `addalias(feed)`

```typescript
addalias(feed: any): Promise<any>
```

feed で指定したエントリにエイリアスパスを追加する。

---

### `removealias(feed)`

```typescript
removealias(feed: any): Promise<any>
```

feed で指定したエントリからエイリアスパスを削除する。
