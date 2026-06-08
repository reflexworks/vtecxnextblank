# グループ管理

ユーザーのグループ参加・脱退・管理者操作などを行うメソッド群。

グループは `folderacls.json` に事前登録が必要。詳細は [framework.md](../framework.md#グループ管理) を参照。

---

## グループ参加・脱退

### `addGroup(group, selfid?)`

```typescript
addGroup(group: string, selfid?: string): Promise<any>
```

自分自身をグループに登録する。グループが存在しない場合は作成される。

```typescript
await vtecxnext.addGroup('/_group/sales')
```

---

### `joinGroup(group, selfid?)`

```typescript
joinGroup(group: string, selfid?: string): Promise<any>
```

管理者から招待されたグループへの参加を確認する。

---

### `leaveGroup(group)`

```typescript
leaveGroup(group: string): Promise<boolean>
```

自分自身をグループから脱退させる。

---

## 管理者によるグループ操作

### `addGroupByAdmin(uids, group, selfid?)`

```typescript
addGroupByAdmin(uids: string[], group: string, selfid?: string): Promise<any>
```

管理者権限で指定ユーザー（複数）をグループに追加する。

```typescript
await vtecxnext.addGroupByAdmin(['uid1', 'uid2'], '/_group/sales')
```

---

### `leaveGroupByAdmin(uids, group)`

```typescript
leaveGroupByAdmin(uids: string[], group: string): Promise<any>
```

管理者権限で指定ユーザーをグループから削除する。

---

### `noGroupMember(uri)`

```typescript
noGroupMember(uri: string): Promise<any>
```

グループに登録されているが、正式なメンバーになっていないエントリの一覧を取得する（グループが署名を要求する場合に、署名が無い／不正なエントリが対象）。

---

## グループ情報取得

### `getGroups()`

```typescript
getGroups(): Promise<string[] | null>
```

ログインユーザーが所属するグループ名の一覧を取得する。所属がない場合は `null`。

```typescript
const groups = await vtecxnext.getGroups()
```

---

### `isGroupMember(uri)`

```typescript
isGroupMember(uri: string): Promise<boolean>
```

ログイン中のユーザーが指定グループに所属しているかどうかを返す。

```typescript
const isSales = await vtecxnext.isGroupMember('/_group/sales')
// true: 所属, false: 非所属
```

---

### `isAdmin()`

```typescript
isAdmin(): Promise<boolean>
```

ログイン中のユーザーが管理者グループ（`/_group/$admin`）に所属しているかどうかを返す。

```typescript
const isAdmin = await vtecxnext.isAdmin()
```

---

## グループ管理者

### `createGroupadmin(createGroupadminInfos)`

```typescript
createGroupadmin(createGroupadminInfos: CreateGroupadminInfo[]): Promise<any>
```

グループ管理者を作成する。グループ名と管理者 UID の組を配列で渡す。

```typescript
type CreateGroupadminInfo = {
  group: string    // グループ名
  uids: string[]   // 管理者にする UID の配列
}
```

---

### `deleteGroupadmin(groupNames, async?)`

```typescript
deleteGroupadmin(groupNames: string[], async?: boolean): Promise<any>
```

指定したグループ（複数）の管理者を削除する。
