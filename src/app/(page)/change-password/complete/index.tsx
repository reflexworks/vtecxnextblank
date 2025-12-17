'use client'
import { Button, Typography } from '@mui/material'
import Grid from '@mui/material/Grid2'
import React from 'react'
import constant from '@/constants'
import { useRouter } from 'next/navigation'

/**
 * パスワード再設定完了画面のページ関数
 * @returns HTML
 */
const ChangePasswordComplete = () => {
  const router = useRouter()
  return (
    <React.Fragment>
      <div style={{ marginTop: '100px' }}>
        <Grid container direction="column" justifyContent="center" alignItems="center" spacing={4}>
          <Grid size={{ xs: 12, md: 5 }} textAlign={'center'}>
            <Typography variant="h5" gutterBottom component={'div'}>
              {constant.app_name}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }} textAlign={'center'}>
            <Typography component={'div'}>パスワードの再設定を行いました</Typography>
            <Typography bottom={5}>
              次回のログインからは、再設定したパスワードでログインしてください
            </Typography>
            <Button
              onClick={() => {
                router.push('/login')
              }}
            >
              ログイン画面に移動する
            </Button>
          </Grid>
        </Grid>
      </div>
    </React.Fragment>
  )
}

export default ChangePasswordComplete
