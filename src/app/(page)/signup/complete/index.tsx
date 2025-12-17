'use client'

import Link from 'next/link'
import { Typography } from '@mui/material'
import Grid from '@mui/material/Grid2'
import constant from '@/constants'

/**
 * 会員登録メール送信完了画面のページ関数
 * @returns HTML
 */
const Main = () => {
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
            <Typography component={'div'}>会員登録メールを送信しました</Typography>
            <Typography>
              現在は仮登録中です。会員登録メールのリンクをクリックし本登録を完了してください。
            </Typography>
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
