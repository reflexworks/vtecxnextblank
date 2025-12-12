/**
 * null、undefined、空文字の判定
 * @param val チェック値
 * @returns null、undefined、空文字の場合true
 */
export const isBlank = (val: any): boolean => {
  if (val === null || val === undefined || val === '') {
    return true
  }

  return false
}

/**
 * 値をstring型で返す.
 * @param tmpVal 値
 * @return stringの値
 */
export const toString = (tmpVal: any): string => {
  return !isBlank(tmpVal) ? String(tmpVal) : ''
}

/**
 * Error型かどうかチェック
 * インターフェースの判定には型ガード関数を使う
 * @param value チェックオブジェクト
 * @returns Error型の場合true
 */
export const isError = (value: unknown): value is Error => {
  // 値がオブジェクトであるかの判定
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const { name, message } = value as Record<keyof Error, unknown>
  // nameプロパティーが文字列型かを判定
  if (typeof name !== 'string') {
    return false
  }
  // messageプロパティーが文字列型かを判定
  if (typeof message !== 'string') {
    return false
  }
  return true
}

/**
 * 値をnumber型で返す。空の場合、defaultValが指定されていなければエラー。
 * @param tmpVal 値
 * @param defaultVal 値が指定されていない場合の返却値。この値が指定されていればエラーとしない。undefined指定は無効。エラーとなる。
 * @return numberの値
 */
export const toNumber = (tmpVal: any, defaultVal?: number): number => {
  let errMsg = `Not numeric. ${tmpVal}`
  if (!isBlank(tmpVal)) {
    try {
      return Number(tmpVal)
    } catch (e) {
      if (isError(e)) {
        errMsg = e.message
      }
    }
  } else if (defaultVal !== undefined) {
    return defaultVal
  }
  throw new CommonError(400, errMsg)
}

// --------------------------------------
/**
 * Error returned from api route
 */
export class CommonError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'CommonError'
    this.status = status
  }
}
