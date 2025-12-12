import VtecxApp from '@/typings'

export const email_regex =
  /^[a-zA-Z0-9_.+-]+@([a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.)+[a-zA-Z]{2,}$/

// 共通：パスワードチェック
// 半角英字・半角数字・記号をすべて含む10文字以上
export const password_regexp = /^(?=.*?[0-9])(?=.*?[a-zA-Z])(?=.*?[!-/@_?])[A-Za-z!-9@_?]{10,}$/
