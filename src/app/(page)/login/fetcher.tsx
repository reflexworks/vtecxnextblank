import * as browserutil from '@/utils/browserutil'

/**
 * ログインリクエスト
 * API Routeにリクエストする
 * @param wsse WSSE
 * @param reCaptchaToken reCAPTCHAトークン
 * @returns API Routeからの戻り値
 */
export const login = async (wsse: string, reCaptchaToken: string, api: string) => {
  //console.log("[login] start.")
  const method = 'GET'
  const apiAction = api
  const param = reCaptchaToken ? `g-recaptcha-token=${reCaptchaToken}` : ''
  const headers = { 'X-WSSE': wsse }
  try {
    const data = await browserutil.requestApi(method, apiAction, param, null, headers)
    if ('feed' in data) {
      return data.feed.title
    } else {
      return 'no feed'
    }
  } catch (e: any) {
    return browserutil.handleError(e, true)
  }
}
