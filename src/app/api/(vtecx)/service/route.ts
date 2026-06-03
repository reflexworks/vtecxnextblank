import { NextRequest, NextResponse } from 'next/server'

export const GET = async (_req: NextRequest): Promise<Response> => {
  const vtecxUrl = process.env.VTECX_URL ?? ''
  // https://{serviceName}.vte.cx の形式からサービス名を抽出
  const match = vtecxUrl.match(/^https?:\/\/([^.]+)\.vte\.cx/)
  const serviceName = match?.[1] ?? ''
  return NextResponse.json({ feed: { title: serviceName } })
}
