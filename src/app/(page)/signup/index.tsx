'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Button,
  FormControl,
  IconButton,
  InputAdornment,
  TextField,
  Typography
} from '@mui/material'
import Grid from '@mui/material/Grid2'
import { grey } from '@mui/material/colors'
import { addUser } from './fetcher'
import useLoader from '@/hooks/useLoader'
import { useRouter } from 'next/navigation'
import { handleErrorProps } from '@/utils/browserutil'
import React from 'react'
import constant from '@/constants'
import VtecxApp from '@/typings'
import { useReCaptcha } from 'next-recaptcha-v3'
import { email_regex, password_regexp } from '@/utils/checkutil'
import { VisibilityOff, Visibility } from '@mui/icons-material'

/**
 * アカウント登録用画面のページ関数
 * @returns HTML
 */
const Main = () => {
  const [email, setEmail] = useState('')
  const [check_email, setCheckEmail] = React.useState<boolean | undefined>()

  const [password, setPassword] = React.useState<string>('')
  const [check_password, checkPassword] = React.useState<boolean | undefined>()

  const [repassword, setRePassword] = React.useState<string>()
  const [disabled, setDisabled] = React.useState<boolean>(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showRePassword, setShowRePassword] = useState(false)

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword)
  }

  const handleClickShowRePassword = () => {
    setShowRePassword(!showRePassword)
  }

  const checkDisabled = React.useCallback(
    (value?: string) => {
      if (check_email && check_password && value) {
        setDisabled(!Boolean(password === repassword))
      } else {
        setDisabled(true)
      }
    },
    [check_password, password, repassword, check_email]
  )

  React.useEffect(() => {
    checkPassword(password ? password_regexp.test(password) : undefined)
  }, [password])

  React.useEffect(() => {
    checkDisabled(repassword)
  }, [check_email, check_password, repassword])

  const { loaded, executeRecaptcha } = useReCaptcha()

  const router = useRouter()
  const { setLoader } = useLoader()

  const [error, setError] = React.useState<any>()

  const sendPassResetMail = async () => {
    // reCAPTCHAトークンを取得
    setLoader(true)
    if (loaded) {
      const reCaptchaToken = executeRecaptcha ? await executeRecaptcha('adduser') : ''
      const res: VtecxApp.Feed | handleErrorProps | undefined = await addUser(
        email,
        password,
        reCaptchaToken
      )
      if (res) {
        if ('feed' in res) {
          router.push('/signup/complete')
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
              {'アカウント登録'}
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
                  setCheckEmail(email_regex.test(event.target.value))
                  setEmail(event.target.value)
                }}
                slotProps={{
                  inputLabel: {
                    shrink: true
                  }
                }}
                error={check_email === true || check_email === false ? !check_email : undefined}
              />
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <TextField
              name="new_password"
              size="small"
              slotProps={{
                inputLabel: {
                  shrink: true
                }
              }}
              fullWidth
              onChange={(_e: React.ChangeEvent<HTMLInputElement>) => {
                const value = _e.target.value
                setPassword(value)
              }}
              type={showPassword ? 'text' : 'password'}
              defaultValue={password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="パスワードの表示を切り替える"
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              error={
                check_password === true || check_password === false ? !check_password : undefined
              }
            />
            <Typography variant="caption" color={check_password ? undefined : 'error'}>
              {constant.check_password_comment}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <TextField
              name="re_new_password"
              size="small"
              slotProps={{
                inputLabel: {
                  shrink: true
                }
              }}
              onChange={(_e: React.ChangeEvent<HTMLInputElement>) => {
                setRePassword(_e.target.value)
              }}
              fullWidth
              defaultValue={repassword}
              type={showRePassword ? 'text' : 'password'}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="パスワードの表示を切り替える"
                      onClick={handleClickShowRePassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              error={password ? password !== repassword : undefined}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <FormControl fullWidth variant="outlined">
              <Button
                variant="contained"
                size="small"
                disabled={disabled}
                onClick={() => {
                  sendPassResetMail()
                }}
              >
                アカウント登録メールの送信
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
