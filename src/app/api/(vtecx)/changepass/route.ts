import { NextRequest } from 'next/server'
import { VtecxNext } from '@vtecx/vtecxnext'
import * as apiutil from '@/utils/apiutil'
import { ChangePass } from '@/typings/apiarguments'

/**
 * POSTメソッド
 * @param req リクエスト
 * @returns レスポンス
 */
export const POST = async (req: NextRequest): Promise<Response> => {
  console.log(`[api changepass] start.`)
  try {
    const vtecxnext = new VtecxNext(req)

    // X-Requested-With ヘッダチェック
    let result = vtecxnext.checkXRequestedWith()
    if (result) {
      return result
    }

    // リクエストJSON取得
    const data: ChangePass | undefined = await apiutil.getRequestJson(req)
    if (!data) {
      return vtecxnext.response(400, { feed: { title: 'Invalid argument.' } })
    }

    const rxid: string = vtecxnext.getParameter('_RXID') ?? ''
    if (rxid) {
      // メールリセットフロー: RXID でログイン
      console.log(`[api changepass] vtecxnext.loginWithRxid start. rxid=${rxid}`)
      const statusMessage = await vtecxnext.loginWithRxid(rxid)
      console.log(`[api changepass] statusMessage = ${JSON.stringify(statusMessage)}`)
    } else if (!data.oldpswd) {
      // ログイン済みフローでは oldpswd が必須
      return vtecxnext.response(401, { feed: { title: 'Authentication error.' } })
    }

    // パスワード変更
    console.log(`[api changepass] vtecxnext.changepass start.`)
    const pass: string = data.newpswd
    const oldpass = data.oldpswd
    const passresetToken = data.passresetToken
    const resJson = await vtecxnext.changepass(pass, oldpass, passresetToken)
    const resStatus = 200

    console.log('[api changepass] end.')
    return vtecxnext.response(resStatus, resJson)
  } catch (e) {
    return apiutil.responseError(e, 'api changepass')
  }
}
