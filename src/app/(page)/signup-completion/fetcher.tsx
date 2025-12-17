import * as browserutil from '@/utils/browserutil'

/**
 * RXIDによるログイン
 * @param rxid RXID
 * @returns メッセージ
 */
export const loginWithRxid = async (rxid: string): Promise<string | undefined> => {
  console.log(`[loginWithRxid] start.`)
  const data = await browserutil.requestApi('GET', 'loginwithrxid', `rxid=${rxid}`)
  let result: string | undefined
  if (!data) {
    console.log(`[loginWithRxid] data is null.`)
  } else if ('feed' in data) {
    const feedStr = JSON.stringify(data)
    console.log(`[loginWithRxid] data=${feedStr}`)
    result = data.feed.title
  }
  console.log(`[loginWithRxid] end. result = ${result}`)
  return result
}
