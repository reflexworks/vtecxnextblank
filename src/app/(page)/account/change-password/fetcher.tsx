import * as browserutil from '@/utils/browserutil'
import { getHashpass } from '@vtecx/vtecxauth'

/**
 * ログイン済みユーザーのパスワード変更
 * @param oldPassword 現在のパスワード
 * @param newPassword 新しいパスワード
 */
export const changePassword = async (oldPassword: string, newPassword: string) => {
  try {
    const res: VtecxApp.Feed = await browserutil.requestApi(
      'POST',
      'changepass',
      '',
      JSON.stringify({
        newpswd: getHashpass(newPassword),
        oldpswd: getHashpass(oldPassword)
      })
    )
    return res
  } catch (e: any) {
    return browserutil.handleError(e)
  }
}
