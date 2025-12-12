import { NextRequest } from 'next/server'
import { VtecxNext } from '@vtecx/vtecxnext'
import * as apiutil from '@/utils/apiutil'

export const GET = async (req: NextRequest): Promise<Response> => {
  console.log(`[api logout] start. `)

  try {
    const vtecxnext = new VtecxNext(req)

    // X-Requested-With ヘッダチェック
    let result = vtecxnext.checkXRequestedWith()
    if (result) {
      return result
    }

    // ログアウト
    const statusMessage = await vtecxnext.logout()
    const resMessage = statusMessage.message
    const resStatus = statusMessage.status
    const resJson = { feed: { title: resMessage } }

    console.log('[api logout] end.')
    return vtecxnext.response(resStatus, resJson)
  } catch (e) {
    return apiutil.responseError(e, 'api logout')
  }
}
