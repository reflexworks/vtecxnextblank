import * as browserutil from '@/utils/browserutil'
import { getHashpass } from '@vtecx/vtecxauth'

/**
 * パスワード再設定画面用のパスワード変更
 * @param password 新パスワード
 * @param passreset_token パスワードリセットトークン
 * @param rxid RXID
 * @returns
 */
export const changePassword = async (password: string, passreset_token: string, rxid: string) => {
  try {
    const res: VtecxApp.Feed = await browserutil.requestApi(
      'POST',
      'changepass',
      `_RXID=${rxid}`,
      JSON.stringify({
        newpswd: getHashpass(password),
        passresetToken: passreset_token
      })
    )
    return res
  } catch (e: any) {
    return browserutil.handleError(e, true)
  }
}
