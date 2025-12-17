'use client'

import { useState } from 'react'
import {
  Button,
  FormControl,
  IconButton,
  InputAdornment,
  TextField,
  Typography
} from '@mui/material'
import Grid from '@mui/material/Grid2'
import { useRouter } from 'next/navigation'
import { handleErrorProps } from '@/utils/browserutil'
import React from 'react'
import VtecxApp from '@/typings'
import { changePassword } from './fetcher'
import { VisibilityOff, Visibility } from '@mui/icons-material'
import { password_regexp } from '@/utils/checkutil'
import constant from '@/constants'

/**
 * パスワード変更ページ関数
 * @returns HTML
 */
const Main = () => {
  const router = useRouter()
  const [error, setError] = React.useState<any>('')

  const [passreset_token] = useState<string>(
    location.search.split('?_passreset_token=')[1].split('&_RXID=')[0]
  )
  const [rxid] = useState<string>(
    location.search.split('?_passreset_token=')[1].split('&_RXID=')[1]
  )

  const [check_password, checkPassword] = React.useState<boolean | undefined>()
  const [password, setPassword] = React.useState<string>()
  const [repassword, setRePassword] = React.useState<string>()
  const [disabled, setDisabled] = React.useState<boolean>(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showRePassword, setShowRePassword] = useState(false)

  const changePass = async () => {
    // reCAPTCHAトークンを取得
    if (password) {
      const res: VtecxApp.Feed | handleErrorProps | undefined = await changePassword(
        password,
        passreset_token,
        rxid
      )
      if (res) {
        if ('feed' in res) {
          router.push('/change-password/complete')
        } else if ('error' in res) {
          res.error.message =
            'パスワード変更に失敗しました。再度パスワード変更メールの送信からやり直してください。'
          setError(res.error)
        }
      }
    }
  }

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword)
  }

  const handleClickShowRePassword = () => {
    setShowRePassword(!showRePassword)
  }

  const checkDisabled = React.useCallback(
    (_value?: string) => {
      if (check_password && _value) {
        setDisabled(!Boolean(password === repassword))
      } else {
        setDisabled(true)
      }
    },
    [check_password, password, repassword]
  )

  React.useEffect(() => {
    checkPassword(password ? password_regexp.test(password) : undefined)
  }, [password])

  React.useEffect(() => {
    checkDisabled(repassword)
  }, [check_password, repassword])

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
                check_password === false || check_password === true ? !check_password : undefined
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
                onClick={() => {
                  changePass()
                }}
                disabled={disabled}
              >
                パスワードの再設定
              </Button>
            </FormControl>
          </Grid>
        </Grid>
      </div>
    </>
  )
}

export default Main
