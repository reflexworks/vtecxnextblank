import * as browserutil from '@/utils/browserutil'

/**
 * ログインリクエスト
 * API Routeにリクエストする
 * @param wsse WSSE
 * @param reCaptchaToken reCAPTCHAトークン
 * @returns API Routeからの戻り値
 */
export const logout = async () => {
  //console.log("[login] start.")
  const method = 'GET'
  const apiAction = 'logout'
  const data = await browserutil.requestApi(method, apiAction, '', null)
  if ('feed' in data) {
    return data.feed.title
  } else {
    return 'no feed'
  }
}

// propsの型を定義する
export type Props = {
  login_path: string
}
