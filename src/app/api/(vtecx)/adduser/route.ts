import { NextRequest } from 'next/server'
import { AdduserInfo, VtecxNext } from '@vtecx/vtecxnext'
import { Entry } from '@/typings'
import { URI_SETTINGS_ADDUSER } from '@/utils/apiconst'
import * as apiutil from '@/utils/apiutil'

/**
 * POSTメソッド
 * @param req リクエスト
 * @returns レスポンス
 */
export const POST = async (req: NextRequest): Promise<Response> => {
  console.log(`[api adduser] start. url=${req.url}`)

  try {
    const vtecxnext = new VtecxNext(req)

    // X-Requested-With ヘッダチェック
    let result = vtecxnext.checkXRequestedWith()
    if (result) {
      return result
    }

    console.log(`[api adduser] vtecxnext.adduser start.`)
    const reCaptchaToken: string = vtecxnext.getParameter('g-recaptcha-token') ?? ''
    //console.log(`[api adduser] reCaptchaToken=${reCaptchaToken}`)

    // リクエストJSON取得
    const reqData: AdduserInfo | undefined = await apiutil.getRequestJson(req)
    if (!reqData) {
      return vtecxnext.response(400, { feed: { title: 'Invalid argument.' } })
    }
    let emailSubject = reqData.emailSubject
    let emailText = reqData.emailText
    let emailHtml = reqData.emailHtml
    if (!emailText && !emailHtml) {
      // メール読み込み
      const adduserMailEntry: Entry | undefined = await apiutil.getEntry(
        vtecxnext,
        URI_SETTINGS_ADDUSER
      )
      if (!adduserMailEntry) {
        console.log(`[api adduser] No email settings. ${URI_SETTINGS_ADDUSER}`)
        return vtecxnext.response(426, {
          feed: { title: `No email settings. ${URI_SETTINGS_ADDUSER}` }
        })
      }
      emailSubject = adduserMailEntry.title
      emailText = adduserMailEntry.summary
      emailHtml = adduserMailEntry.content?.______text
      if (!emailText && !emailHtml) {
        console.log(`[api adduser] No email settings. ${URI_SETTINGS_ADDUSER}`)
        return vtecxnext.response(426, {
          feed: { title: `No email settings. ${URI_SETTINGS_ADDUSER}` }
        })
      }
    }
    if (emailText) {
      // 変換
      emailText = apiutil.editMailTextVtecxnextUrl(emailText)
    }
    if (emailHtml) {
      // 変換
      emailHtml = apiutil.editMailTextVtecxnextUrl(emailHtml)
    }

    const adduserData: AdduserInfo = {
      username: reqData.username,
      pswd: reqData.pswd,
      emailSubject: emailSubject,
      emailText: emailText,
      emailHtml: emailHtml
    }
    const resJson = await vtecxnext.adduser(adduserData, reCaptchaToken)
    const resStatus = 200

    console.log('[api adduser] end.')
    return vtecxnext.response(resStatus, resJson)
  } catch (e) {
    return apiutil.responseError(e, 'api adduser')
  }
}
