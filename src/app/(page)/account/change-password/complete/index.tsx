'use client'

import { Button, Typography } from '@mui/material'
import Grid from '@mui/material/Grid2'
import React from 'react'
import constant from '@/constants'
import { useRouter } from 'next/navigation'

const ChangePasswordComplete = () => {
  const router = useRouter()
  return (
    <React.Fragment>
      <div style={{ marginTop: '100px' }}>
        <Grid container direction="column" justifyContent="center" alignItems="center" spacing={4}>
          <Grid size={{ xs: 12, md: 5 }} textAlign="center">
            <Typography variant="h5" gutterBottom component="div">
              {constant.app_name}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }} textAlign="center">
            <Typography component="div">パスワードを変更しました</Typography>
            <Typography bottom={5}>
              次回のログインからは、新しいパスワードでログインしてください
            </Typography>
            <Button onClick={() => router.push('/')}>トップページへ戻る</Button>
          </Grid>
        </Grid>
      </div>
    </React.Fragment>
  )
}

export default ChangePasswordComplete
