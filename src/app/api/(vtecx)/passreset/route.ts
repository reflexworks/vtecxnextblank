import { NextRequest } from 'next/server'
import { VtecxNext } from '@vtecx/vtecxnext'
import { Entry } from 'typings'
import { URI_SETTINGS_PASSRESET } from '@/utils/apiconst'
import * as apiutil from '@/utils/apiutil'
import { PassReset } from '@/typings/apiarguments'

/**
 * POSTメソッド
 * @param req リクエスト
 * @returns レスポンス
 */
export const POST = async (req: NextRequest): Promise<Response> => {
  console.log(`[api passreset] start. url=${req.url}`)

  try {
    const vtecxnext = new VtecxNext(req)

    // X-Requested-With ヘッダチェック
    let result = vtecxnext.checkXRequestedWith()
    if (result) {
      return result
    }

    console.log(`[api passreset] vtecxnext.passreset start.`)
    const reCaptchaToken: string = vtecxnext.getParameter('g-recaptcha-token') ?? ''
    //console.log(`[api passreset] reCaptchaToken=${reCaptchaToken}`)

    // リクエストJSON取得
    const reqData: PassReset | undefined = await apiutil.getRequestJson(req)
    if (!reqData) {
      return vtecxnext.response(400, { feed: { title: 'Invalid argument.' } })
    }
    let emailSubject = reqData.emailSubject
    let emailText = reqData.emailText
    let emailHtml = reqData.emailHtml
    if (!emailText && !emailHtml) {
      // メール読み込み
      const passresetMailEntry: Entry | undefined = await apiutil.getEntry(
        vtecxnext,
        URI_SETTINGS_PASSRESET
      )
      if (!passresetMailEntry) {
        console.log(`[api passreset] No email settings. ${URI_SETTINGS_PASSRESET}`)
        return vtecxnext.response(426, {
          feed: { title: `No email settings. ${URI_SETTINGS_PASSRESET}` }
        })
      }
      emailSubject = passresetMailEntry.title
      emailText = passresetMailEntry.summary
      emailHtml = passresetMailEntry.content?.______text
      if (!emailText && !emailHtml) {
        console.log(`[api passreset] No email settings. ${URI_SETTINGS_PASSRESET}`)
        return vtecxnext.response(426, {
          feed: { title: `No email settings. ${URI_SETTINGS_PASSRESET}` }
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

    const passresetData: PassReset = {
      username: reqData.username,
      emailSubject: emailSubject,
      emailText: emailText,
      emailHtml: emailHtml
    }
    const resJson = await vtecxnext.passreset(passresetData, reCaptchaToken)
    const resStatus = 200

    console.log('[api passreset] end.')
    return vtecxnext.response(resStatus, resJson)
  } catch (e) {
    return apiutil.responseError(e, 'api passreset')
  }
}
