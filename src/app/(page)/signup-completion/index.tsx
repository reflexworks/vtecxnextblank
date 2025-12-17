'use client'

import Link from 'next/link'
import { Box, CircularProgress, Typography } from '@mui/material'
import Grid from '@mui/material/Grid2'
import React from 'react'
import constant from '@/constants'
import { loginWithRxid } from './fetcher'
import { useSearchParams } from 'next/navigation'

/**
 * 会員登録メール送信完了画面のページ関数
 * @returns HTML
 */
const Main = () => {
  const searchParams = useSearchParams()
  const rxid: string = searchParams.get('_RXID') ?? ''

  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<boolean>(false)
  React.useEffect(() => {
    if (rxid) {
      loginWithRxid(rxid).then((res: string | undefined) => {
        setLoading(false)
        if (!res) {
          setError(true)
        }
      })
    }
  }, [rxid])

  return (
    <>
      <div style={{ marginTop: '100px' }}>
        <Grid container direction="column" justifyContent="center" alignItems="center" spacing={4}>
          <Grid size={{ xs: 12, md: 5 }} textAlign={'center'}>
            <Typography variant="h5" gutterBottom component={'div'}>
              {constant.app_name}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }} textAlign={'center'}>
            {loading && (
              <Box textAlign={'center'}>
                <CircularProgress />
                <Typography component={'div'} top={5}>
                  本登録処理中
                </Typography>
              </Box>
            )}
            {!loading && !error && (
              <>
                <Typography component={'div'} color="success">
                  本登録が完了しました。
                </Typography>
              </>
            )}
            {!loading && error && (
              <>
                <Typography component={'div'} color="error">
                  本登録に失敗しました。
                </Typography>
                <Typography component={'div'} marginTop={2} marginBottom={5} variant="caption">
                  もう一度アカウント登録をやり直してください。
                </Typography>
                <Link href={'/signup'}>
                  <Typography variant="caption">アカウント登録を行う</Typography>
                </Link>
              </>
            )}
          </Grid>
          <Grid size={{ xs: 12, md: 5 }} textAlign={'center'}>
            <Link href={'/login'}>
              <Typography variant="caption">ログイン画面に戻る</Typography>
            </Link>
          </Grid>
        </Grid>
      </div>
    </>
  )
}

export default Main
