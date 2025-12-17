import {
  VtecxNext,
  StatusMessage,
  VtecxNextError,
  isVtecxNextError,
  AdduserInfo
} from '@vtecx/vtecxnext'
import { NextRequest } from 'next/server'
import * as util from './commonutil'
import { Entry, MessageResponse } from '@/typings'
import { MAIL_REPLACE_VTECXNEXT_URL } from './apiconst'

/**
 * ログイン.
 * @param req リクエスト
 * @param vtecxnext VtecxNext
 * @returns レスポンスのステータスとメッセージ
 */
export const login = async (req: NextRequest, vtecxnext: VtecxNext): Promise<StatusMessage> => {
  let statusMessage: StatusMessage
  const totp: string = util.toString(vtecxnext.getParameter('totp'))
  //console.log(`[api cao login] start. totp=${totp}`)
  if (!totp) {
    // リクエストヘッダからWSSEを取得
    const wsse: string | null = req.headers.get('x-wsse')
    const reCaptchaToken: string = util.toString(vtecxnext.getParameter('g-recaptcha-token'))
    console.log(`[api login] x-wsse=${wsse}`)
    if (wsse == null) {
      console.log(`[api login] x-wsse header is required.`)
      throw new VtecxNextError(400, 'Authentication is required.')
    }
    statusMessage = await vtecxnext.login(wsse, reCaptchaToken)
  } else {
    // ２段階認証
    const isTrustedDevice = vtecxnext.hasParameter('trusteddevice')
    statusMessage = await vtecxnext.loginWithTotp(totp, isTrustedDevice)
  }
  return statusMessage
}

/**
 * ログアウト.
 * @param req リクエスト
 * @param vtecxnext VtecxNext
 * @returns レスポンスのステータスとメッセージ
 */
export const logout = async (vtecxnext: VtecxNext): Promise<StatusMessage> => {
  try {
    return await vtecxnext.logout()
  } catch (e) {
    console.log(`[apiutil logout] Error occured. ${e}`)
    throw e
  }
}

/**
 * アカウント登録
 * @param req リクエスト
 * @param vtecxnext VtecxNext
 * @param adduserInfos 登録ユーザ情報
 * @returns レスポンスのステータスとメッセージ
 */
export const adduser = async (
  req: NextRequest,
  vtecxnext: VtecxNext,
  adduserInfos: AdduserInfo
): Promise<MessageResponse> => {
  // リクエストヘッダからWSSEを取得
  const reCaptchaToken: string = util.toString(vtecxnext.getParameter('g-recaptcha-token'))
  return await vtecxnext.adduser(adduserInfos, reCaptchaToken)
}

/**
 * エラーレスポンスを生成
 * @param e エラー
 * @param procName 処理名(ログ用)
 * @returns エラーレスポンス
 */
export const responseError = (e: unknown, procName: string): Response => {
  let resStatus: number = 503
  let resErrMsg: string
  if (isVtecxNextError(e)) {
    resStatus = e.status
    resErrMsg = e.message
    console.log(`[${procName}] Error occued. VtecxNextError: ${resErrMsg}`)
  } else if (util.isError(e)) {
    resErrMsg = `${e.name} ${e.message}`
    console.log(`[${procName}] Error occued. ${resErrMsg}`)
  } else {
    resErrMsg = 'Unexpected error.'
    console.log(`[${procName}] Error occued. ${resErrMsg} ${e}`)
  }
  const resData = { feed: { title: resErrMsg } }
  const resHeaders = { 'content-type': 'application/json' }
  return new Response(JSON.stringify(resData), {
    status: resStatus,
    headers: resHeaders
  })
}

/**
 * リクエストデータ取得
 * @param req リクエスト
 * @returns リクエストデータ
 */
export const getRequestJson = async (req: NextRequest): Promise<any> => {
  // リクエストJSON取得
  const contentLength: number = util.toNumber(req.headers.get('content-length'), 0)
  let data: any | undefined
  if (contentLength > 0) {
    try {
      data = await req.json()
    } catch (error) {
      let resErrMsg: string
      if (util.isError(error)) {
        resErrMsg = `${error.name}: ${error.message}`
      } else {
        resErrMsg = 'Error occured by req.json()'
      }
      console.log(`[apiutil getRequestJson] input error. ${resErrMsg}`)
      throw new VtecxNextError(400, resErrMsg)
    }
  }

  // 入力チェック
  if (!data) {
    console.log(`[apiutil getRequestJson] request data is empty.`)
    throw new VtecxNextError(400, 'Invalid argument.')
  }
  // 配列でない場合もあるためコメントアウト。(passresetなど)
  //if (!Array.isArray(data)) {
  //  console.log(`[apiutil getRequestJson] request feed is not array. ${JSON.stringify(data)}`)
  //  throw new VtecxNextError(400, 'Invalid argument.')
  //}

  return data
}

/**
 * Entry検索
 * @param vtecxnext VtecxNext
 * @param param キー
 * @returns Entry
 */
export const getEntry = async (vtecxnext: VtecxNext, param: string): Promise<Entry | undefined> => {
  // エントリー取得
  try {
    return await vtecxnext.getEntry(param)
  } catch (e) {
    console.log(`[apiutil getEntry] Error occured. ${e}`)
    throw e
  }
}

/**
 * メール本文のテンプレートに VTECXNEXT_URL の値をセットする
 * @param text メール本文
 * @returns 編集したメール本文
 */
export const editMailTextVtecxnextUrl = (text: string) => {
  const url: string = util.toString(process.env.NEXT_PUBLIC_VTECXNEXT_URL)
  return text.replaceAll(MAIL_REPLACE_VTECXNEXT_URL, url)
}
