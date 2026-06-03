import { NextRequest } from 'next/server'
import { VtecxNext } from '@vtecx/vtecxnext'
import * as apiutil from '@/utils/apiutil'

export const GET = async (req: NextRequest): Promise<Response> => {
  console.log(`[api whoami] start.`)
  try {
    const vtecxnext = new VtecxNext(req)

    // X-Requested-With ヘッダチェック
    const result = vtecxnext.checkXRequestedWith()
    if (result) {
      return result
    }

    const uid = await vtecxnext.uid()
    const userEntry = await vtecxnext.getEntry(`/_user/${uid}`)
    const email: string = userEntry?.contributor?.[0]?.email ?? ''
    const resJson = { feed: { title: uid, subtitle: email } }

    console.log('[api whoami] end.')
    return vtecxnext.response(200, resJson)
  } catch (e) {
    return apiutil.responseError(e, 'api whoami')
  }
}
