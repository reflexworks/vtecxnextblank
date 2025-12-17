import { NextRequest } from 'next/server'
import { VtecxNext, isVtecxNextError } from '@vtecx/vtecxnext'
import * as apiutil from '@/utils/apiutil'

/**
 * ログイン処理.
 * @param req リクエスト
 * @returns ログイン成功の場合、SIDをSet-Cookieする。
 */
export const GET = async (req: NextRequest): Promise<Response> => {
  console.log(`[api login] start.`)

  const vtecxnext = new VtecxNext(req)

  // X-Requested-With ヘッダチェック
  let result = vtecxnext.checkXRequestedWith()
  if (result) {
    return result
  }

  // ログイン
  let resStatus: number
  let resMessage: string
  try {
    const statusMessage = await apiutil.login(req, vtecxnext)

    resMessage = statusMessage.message
    resStatus = statusMessage.status
    console.log(`[api login] status = ${resStatus} message = ${resMessage}`)
  } catch (error) {
    // ログイン失敗なのでログアウト
    await apiutil.logout(vtecxnext)
    if (isVtecxNextError(error)) {
      console.log(`[api login] Error occured. status=${error.status} ${error.message}`)
      resStatus = error.status
      resMessage = error.message
    } else {
      console.log(`[api login] Error occured. (not VtecxNextError) ${error}`)
      resStatus = 503
      resMessage = 'Error occured.'
    }
  }
  const feed = { feed: { title: resMessage } }

  console.log('[api login] end.')
  return vtecxnext.response(resStatus, feed)
}
