// シンプルなグローバルキャッシュ（GET用）
const simpleCache = new Map<string, { data?: any; timestamp: number; promise?: Promise<any> }>()

const CACHE_KEY_PREFIX = 'requestApi:'

/**
 * 戻り値がJSONのリクエスト
 * @param method メソッド
 * @param apiAction サーバサイドJS名
 * @param urlparam URLパラメータ
 * @param body リクエストデータ
 * @param headers リクエストヘッダ
 * @param mode リクエストモード
 * @param specifyHost ホストを指定する場合true
 * @param revalidateSec キャッシュの期限を指定する場合、更新間隔(秒)。※本実装ではGETの場合、キャッシュは常に3秒で判定します。
 * @returns レスポンスJSON
 */
export const requestApi = async (
  method: string,
  apiAction: string,
  urlparam: string,
  body?: any,
  headers?: any,
  mode?: RequestMode,
  specifyHost?: boolean,
  revalidateSec?: number
): Promise<any> => {
  // ヘッダー設定
  const reqHeaders: any = headers ? headers : {}
  reqHeaders['X-Requested-With'] = 'XMLHttpRequest'

  // RequestInit の作成
  const requestInit: RequestInit = {
    body: body,
    method: method,
    headers: reqHeaders
  }
  if (revalidateSec === undefined) {
    requestInit.cache = 'no-store'
  } else {
    requestInit.next = { revalidate: revalidateSec }
  }
  if (mode) {
    requestInit.mode = mode
  }

  // URL の生成（specifyHost が指定されていればその値、なければ環境変数のURLを使用）
  const url = `${
    specifyHost ?? process.env.NEXT_PUBLIC_VTECXNEXT_URL
  }/api/${apiAction}?${urlparam ?? ''}`

  // GET の場合のみキャッシュ処理を実施
  if (method.toUpperCase() === 'GET') {
    // キャッシュキーは method, apiAction, urlparam のみを使用（body, headers は除外）
    const key = CACHE_KEY_PREFIX + `${method}:${apiAction}:${urlparam}`

    const cached = simpleCache.get(key)
    if (cached) {
      const age = Date.now() - cached.timestamp
      if (age < 3000) {
        // キャッシュが有効な場合、進行中のリクエストがあればその完了を待つ
        if (cached.promise) {
          return await cached.promise
        }
        return cached.data
      } else {
        // 3秒以上経過している場合はキャッシュを削除
        simpleCache.delete(key)
      }
    }

    // 新規リクエスト実行のための関数（リトライ付き）
    let retry_count = 0
    const doRequest = async (): Promise<any> => {
      try {
        const response = await fetch(url, requestInit)
        retry_count++
        const status = response.status
        if (status === 204) {
          throw response
        } else if (status >= 400) {
          if (status >= 500 && retry_count > 10) {
            return await doRequest()
          } else {
            throw response
          }
        } else {
          const contentType = response.headers.get('content-type')
          if (!contentType || contentType.startsWith('application/json')) {
            return await response.json()
          } else if (contentType.startsWith('text/csv')) {
            return await response.blob()
          } else if (contentType.startsWith('application/pdf')) {
            return await response.blob()
          } else if (contentType.startsWith('text/')) {
            return await response.text()
          } else {
            return await response.blob()
          }
        }
      } catch (err: any) {
        throw err
      }
    }

    // 新規リクエストの Promise を作成し、キャッシュに登録
    const requestPromise = (async () => {
      const data = await doRequest()
      // リクエスト完了後、キャッシュエントリを更新（promise プロパティは削除）
      simpleCache.set(key, { data, timestamp: Date.now() })
      return data
    })()

    // 進行中のリクエストの Promise をキャッシュにセット
    simpleCache.set(key, { data: undefined, timestamp: Date.now(), promise: requestPromise })
    return await requestPromise
  } else {
    // GET 以外の場合はキャッシュを利用せずにリクエストを実行
    let retry_count = 0
    const doRequest = async (): Promise<any> => {
      try {
        const response = await fetch(url, requestInit)
        retry_count++
        const status = response.status
        if (status === 204) {
          throw response
        } else if (status >= 400) {
          if (status >= 500 && retry_count > 10) {
            return await doRequest()
          } else {
            const contentType = response.headers.get('content-type')
            if (!contentType || contentType.startsWith('application/json')) {
              throw await response.json()
            } else {
              throw response
            }
          }
        } else {
          const contentType = response.headers.get('content-type')
          if (!contentType || contentType.startsWith('application/json')) {
            return await response.json()
          } else if (contentType.startsWith('text/csv')) {
            return await response.blob()
          } else if (contentType.startsWith('application/pdf')) {
            return await response.blob()
          } else if (contentType.startsWith('text/')) {
            return await response.text()
          } else {
            return await response.blob()
          }
        }
      } catch (err: any) {
        throw err
      }
    }
    return await doRequest()
  }
}
/**
 * 値をstring型で返す.
 * @param tmpVal 値
 * @return stringの値
 */
export const toString = (tmpVal: any): string => {
  return tmpVal ? String(tmpVal) : ''
}

/**
 * 外部へのリクエスト
 * @param method メソッド
 * @param url URLパラメータ
 * @param body リクエストデータ
 * @param headers リクエストヘッダ
 * @param mode リクエストモード
 * @param revalidateSec キャッシュの期限を指定する場合、更新間隔(秒)。この項目がundefinedの場合cacheなし。
 * @returns レスポンスJSON
 */
export const requestUrl = async (
  method: string,
  url: string,
  body?: any,
  headers?: any,
  mode?: RequestMode,
  revalidateSec?: number
): Promise<any> => {
  console.log(`[requestUrl] start. method=${method} url=${url}`)
  const reqHeaders: any = headers ? headers : {}
  //reqHeaders['X-Requested-With'] = 'XMLHttpRequest'
  //reqHeaders['Access-Control-Request-Origin'] = process.env.NEXT_PUBLIC_VTECXNEXT_URL
  //reqHeaders['Access-Control-Request-Methods'] = method
  //reqHeaders['Access-Control-Request-Headers'] = 'access-control-allow-credentials,access-control-allow-headers,access-control-allow-methods,access-control-allow-origin,x-requested-with'

  //reqHeaders['Access-Control-Allow-Origin'] = process.env.NEXT_PUBLIC_VTECXNEXT_URL
  //reqHeaders['Access-Control-Allow-Methods'] = 'GET,OPTIONS,DELETE,POST,PUT'
  //reqHeaders['Access-Control-Allow-Credentials'] = true
  //reqHeaders['Access-Control-Allow-Headers'] = 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  if (method === 'put') {
    reqHeaders['Content-Type'] = 'application/octet-stream'
  }
  const requestInit: RequestInit = {
    body: body,
    method: method,
    headers: reqHeaders
  }
  if (revalidateSec === undefined) {
    requestInit.cache = 'no-store'
  } else {
    requestInit.next = { revalidate: revalidateSec }
  }
  if (mode) {
    requestInit['mode'] = mode
  }

  console.log(`[requestUrl] method=${method} url=${url} requestInit=${JSON.stringify(requestInit)}`)
  let data
  try {
    const response = await fetch(url, requestInit)
    const status = response.status
    console.log(`[requestUrl] response. status=${status}`)
    if (status === 204) {
      data = null
    } else {
      const contentType = response.headers.get('content-type')
      console.log(`[requestUrl] content-type=${contentType}`)
      if (!contentType || contentType.startsWith('application/json')) {
        data = JSON.stringify(await response.json())
        console.log(`[requestUrl] data(json) = ${JSON.stringify(data)}`)
      } else if (contentType.startsWith('text/') || contentType.startsWith('application/xml')) {
        data = await response.text()
        console.log(`[requestUrl] data(text) = ${data}`)
      } else {
        data = await response.blob()
        console.log(`[requestUrl] data(blob) = ${data}`)
      }
    }
  } catch (err) {
    console.error(err)
    let msg
    if (err instanceof Error) {
      msg = `Fetch by browser error. ${err.name}: ${err.message}`
    } else if (typeof err === 'string') {
      msg = err
    }
    data = { feed: { title: msg } }
  }
  return data
}

export type handleErrorProps = { error: { status: number; message: string } }

export const handleError = (_e: any, is_not_session?: boolean) => {
  const status = _e.status || _e.response?.status
  let message = _e.statusText || _e.response?.statusText

  if (_e instanceof Error) {
    message = `Fetch by browser error. ${_e.name}: ${_e.message}`
  } else if (typeof _e === 'string') {
    message = _e
  }

  if (status === 204) {
    message = '対象のデータが存在しません。'
  }
  if (status === 409) {
    message =
      '他者との更新が重なり、競合が発生している可能性があります。画面をリロードしてもう一度お試しください。'
  }
  if (status === 403) {
    //#368 ログイン画面でセッション切れメッセージが表示される件の修正
    if (is_not_session) {
      message = '認証に失敗しました。'
    } else {
      message = 'セッションが切断されました。再度ログインしてください。'
      location.href = `/login`
    }
  }
  if (status === 401) {
    message = 'ログインに失敗しました。'
  }

  if (message === 'Bad Request') {
    message = '不正なリクエストです。'
  }

  return {
    error: {
      status,
      message
    }
  }
}
