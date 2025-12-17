import { NextRequest } from 'next/server'
import { VtecxNext, VtecxNextError } from '@vtecx/vtecxnext'

/**
 * GETメソッド
 * @param req リクエスト
 * @returns レスポンス
 */
export const GET = async (req:NextRequest):Promise<Response> => {
  console.log(`[api loginwithrxid] start. x-requested-with=${req.headers.get('x-requested-with')}`)

  const vtecxnext = new VtecxNext(req)

  // X-Requested-With ヘッダチェック
  let result = vtecxnext.checkXRequestedWith()
  if (result) {
    return result
  }
  // ログインチェック
  let resStatus:number
  let resMessage:string
  try {
    console.log(`[api loginwithrxid] start.`)
    const rxid:string = vtecxnext.getParameter('rxid') ?? ''
    const statusMessage = await vtecxnext.loginWithRxid(rxid)
    resMessage = statusMessage.message
    resStatus = statusMessage.status
  } catch (error) {
    if (error instanceof VtecxNextError) {
      console.log(`[api loginwithrxid] Error occured. status=${error.status} ${error.message}`)
      resStatus = error.status
      resMessage = error.message
    } else {
      console.log(`[api loginwithrxid] Error occured. (not VtecxNextError) ${error}`)
      resStatus = 503
      resMessage = 'Error occured.'
    }
  }
  const feed = {'feed' : {'title' : resMessage}}

  console.log('[api loginwithrxid] end.')
  return vtecxnext.response(200, feed)
}
