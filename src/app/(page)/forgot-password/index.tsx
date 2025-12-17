'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button, FormControl, TextField, Typography } from '@mui/material'
import Grid from '@mui/material/Grid2'
import { grey } from '@mui/material/colors'
import { changePassword } from './fetcher'
import useLoader from '@/hooks/useLoader'
import { useRouter } from 'next/navigation'
import { handleErrorProps } from '@/utils/browserutil'
import React from 'react'
import constant from '@/constants'
import VtecxApp from '@/typings'
import { useReCaptcha } from 'next-recaptcha-v3'
import { email_regex } from '@/utils/checkutil'

/**
 * パスワード再設定用画面のページ関数
 * @returns HTML
 */
const Main = () => {
  const [email, setEmail] = useState('')
  // ホームページ関数内で定義
  const { loaded, executeRecaptcha } = useReCaptcha()

  const router = useRouter()
  const { setLoader } = useLoader()

  const [check_email, setCheckEmail] = React.useState<any>(true)
  const [error, setError] = React.useState<any>()

  const sendPassResetMail = async () => {
    // reCAPTCHAトークンを取得
    setLoader(true)
    if (loaded) {
      const reCaptchaToken = executeRecaptcha ? await executeRecaptcha('passreset') : ''
      const res: VtecxApp.Feed | handleErrorProps | undefined = await changePassword(
        email,
        reCaptchaToken
      )
      if (res) {
        if ('feed' in res) {
          router.push('/forgot-password/complete')
        } else if ('error' in res) {
          res.error.message =
            'メール送信に失敗しました。入力されたメールアドレスが合っているかご確認お願いします。'
          setError(res.error)
        }
      }
    }
    setLoader(false)
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
              {'パスワードの再設定'}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <FormControl fullWidth variant="outlined">
              <TextField
                type="email"
                label="メールアドレス"
                size="small"
                value={email}
                onChange={(event: any) => {
                  setCheckEmail(!email_regex.test(event.target.value))
                  setEmail(event.target.value)
                }}
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
              <Button
                variant="contained"
                size="small"
                disabled={check_email}
                onClick={() => {
                  sendPassResetMail()
                }}
              >
                パスワード再設定用メールの送信
              </Button>
            </FormControl>

            <Typography variant="caption" color={grey[500]}>
              This site is protected by reCAPTCHA and the Google{' '}
              <a href="https://policies.google.com/privacy">Privacy Policy</a> and{' '}
              <a href="https://policies.google.com/terms">Terms of Service</a> apply.
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
