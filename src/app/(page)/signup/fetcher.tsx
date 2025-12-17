import * as browserutil from '@/utils/browserutil'
import { getHashpass } from '@vtecx/vtecxauth'

/**
 * アカウント登録メールの送信
 * @returns API result
 */
export const addUser = async (user_name: string, password: string, reCaptchaToken: string) => {
  const param = reCaptchaToken ? `g-recaptcha-token=${reCaptchaToken}` : ''
  try {
    const res: VtecxApp.Feed = await browserutil.requestApi(
      'POST',
      'adduser',
      param,
      JSON.stringify({
        username: user_name,
        pswd: getHashpass(password)
      })
    )
    return res
  } catch (e: any) {
    return browserutil.handleError(e, true)
  }
}
