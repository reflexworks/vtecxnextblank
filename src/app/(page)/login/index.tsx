'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getAuthToken } from '@vtecx/vtecxauth'
import { Button, FormControl, TextField, Typography } from '@mui/material'
import Grid from '@mui/material/Grid2'
import { grey } from '@mui/material/colors'
import { login } from './fetcher'
import useLoader from '@/hooks/useLoader'
import { useRouter } from 'next/navigation'
import { handleErrorProps } from '@/utils/browserutil'
import React from 'react'
import constant from '@/constants'
import VtecxApp from '@/typings'
import { useReCaptcha } from 'next-recaptcha-v3'

/**
 * ページ関数
 * @returns HTML
 */
const Main = () => {
  const [username, setUsername] = useState('')
  const [pswrd, setPswrd] = useState('')

  const router = useRouter()
  const { loader, setLoader } = useLoader()

  const [error, setError] = React.useState<any>()

  const { loaded, executeRecaptcha } = useReCaptcha()

  const handleClickLogin = async () => {
    //console.log(`[handleClickLogin start] username=${username}, pass=${pswrd}`)
    // if the component is not mounted ye
    if (!loaded || loader) {
      return
    }
    setError(undefined)
    setLoader(true)
    try {
      // reCAPTCHAトークンを取得
      const reCaptchaToken = executeRecaptcha ? await executeRecaptcha('login') : ''
      // WSSEを生成
      const wsse = getAuthToken(username, pswrd)
      // ログイン
      const retStr: string | handleErrorProps | undefined | VtecxApp.Entry = await login(
        wsse,
        reCaptchaToken,
        'login'
      )
      if (retStr) {
        if (typeof retStr === 'string') {
          router.push('/')
        } else if ('error' in retStr) {
          setError(retStr.error)
        }
      }
    } catch (e) {
      console.error(e)
    }
    setLoader(false)
    //console.log(`[handleClickLogin end ${retStr}]`)
  }

  return (
    <>
      <div style={{ marginTop: '100px' }}>
        <Grid container direction="column" justifyContent="center" alignItems="center" spacing={4}>
          <Grid size={{ xs: 12, md: 5 }} textAlign={'center'}>
            <Typography variant="h5" gutterBottom component={'div'}>
              {constant.app_name}
            </Typography>
            <Typography variant="h5" gutterBottom>
              ログイン
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <FormControl fullWidth variant="outlined">
              <TextField
                type=""
                label="アカウントID"
                size="small"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                slotProps={{
                  inputLabel: {
                    shrink: true
                  }
                }}
              />
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <FormControl fullWidth variant="outlined">
              <TextField
                type="password"
                label="パスワード"
                size="small"
                value={pswrd}
                onChange={(event) => setPswrd(event.target.value)}
                slotProps={{
                  inputLabel: {
                    shrink: true
                  }
                }}
              />
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <FormControl fullWidth variant="outlined">
              <Button variant="contained" size="small" onClick={handleClickLogin}>
                ログイン
              </Button>
            </FormControl>
            <Typography variant="caption" color={grey[500]}>
              This site is protected by reCAPTCHA and the Google{' '}
              <a href="https://policies.google.com/privacy">Privacy Policy</a> and{' '}
              <a href="https://policies.google.com/terms">Terms of Service</a> apply.
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }} textAlign={'center'}>
            <Link href={'/signup'}>
              <Typography variant="caption">新規登録はこちら</Typography>
            </Link>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }} textAlign={'center'}>
            <Link href={'/forgot-password'}>
              <Typography variant="caption">パスワードをお忘れの方はこちら</Typography>
            </Link>
          </Grid>
        </Grid>
      </div>
    </>
  )
}

export default Main
