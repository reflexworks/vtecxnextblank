import constant from '@/constants'
import * as browserutil from '@/utils/browserutil'

/**
 * パスワードリセットメールの送信
 * @returns API result
 */
export const changePassword = async (user_name: string, reCaptchaToken: string) => {
  const param = reCaptchaToken ? `g-recaptcha-token=${reCaptchaToken}` : ''
  try {
    const res: VtecxApp.Feed = await browserutil.requestApi(
      'POST',
      'passreset',
      param,
      JSON.stringify({
        username: user_name
      })
    )
    return res
  } catch (e: any) {
    return browserutil.handleError(e, true)
  }
}

// propsの型を定義する
export type Props = {
  title: string
  main_path: string
  login_screen_path?: string
}
