'use client'

import React, { useState } from 'react'
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
import VtecxApp from '@/typings'
import { changePassword } from './fetcher'
import { VisibilityOff, Visibility } from '@mui/icons-material'
import { password_regexp } from '@/utils/checkutil'
import constant from '@/constants'

const Main = () => {
  const router = useRouter()
  const [error, setError] = React.useState<any>('')

  const [oldPassword, setOldPassword] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [repassword, setRePassword] = useState<string>('')
  const [checkPassword, setCheckPassword] = React.useState<boolean | undefined>()
  const [disabled, setDisabled] = React.useState<boolean>(true)
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showRePassword, setShowRePassword] = useState(false)

  const handleChangePass = async () => {
    if (!oldPassword || !password) return
    const res: VtecxApp.Feed | handleErrorProps | undefined = await changePassword(
      oldPassword,
      password
    )
    if (res) {
      if ('feed' in res) {
        router.push('/account/change-password/complete')
      } else if ('error' in res) {
        res.error.message = 'パスワードの変更に失敗しました。現在のパスワードが正しいか確認してください。'
        setError(res.error)
      }
    }
  }

  const checkDisabled = React.useCallback(
    (_value?: string) => {
      if (checkPassword && _value && oldPassword) {
        setDisabled(!(password === repassword))
      } else {
        setDisabled(true)
      }
    },
    [checkPassword, password, repassword, oldPassword]
  )

  React.useEffect(() => {
    setCheckPassword(password ? password_regexp.test(password) : undefined)
  }, [password])

  React.useEffect(() => {
    checkDisabled(repassword)
  }, [checkPassword, repassword, oldPassword, checkDisabled])

  return (
    <div style={{ marginTop: '100px' }}>
      <Grid container direction="column" justifyContent="center" alignItems="center" spacing={4}>
        <Grid size={{ xs: 12, md: 5 }} textAlign="center">
          <Typography variant="h5" gutterBottom component="div">
            {constant.app_name}
          </Typography>
          <Typography variant="h5" gutterBottom>
            パスワードの変更
          </Typography>
        </Grid>

        {error?.message && (
          <Grid size={{ xs: 12, md: 5 }}>
            <Typography color="error" variant="body2">
              {error.message}
            </Typography>
          </Grid>
        )}

        <Grid size={{ xs: 12, md: 5 }}>
          <TextField
            label="現在のパスワード"
            size="small"
            fullWidth
            type={showOldPassword ? 'text' : 'password'}
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowOldPassword(!showOldPassword)} edge="end">
                    {showOldPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <TextField
            label="新しいパスワード"
            size="small"
            fullWidth
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            error={checkPassword === false}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          <Typography variant="caption" color={checkPassword ? undefined : 'error'}>
            {constant.check_password_comment}
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <TextField
            label="新しいパスワード（確認）"
            size="small"
            fullWidth
            type={showRePassword ? 'text' : 'password'}
            value={repassword}
            onChange={(e) => setRePassword(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            error={password ? password !== repassword : undefined}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowRePassword(!showRePassword)} edge="end">
                    {showRePassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <FormControl fullWidth variant="outlined">
            <Button
              variant="contained"
              size="small"
              onClick={handleChangePass}
              disabled={disabled}
            >
              パスワードを変更する
            </Button>
          </FormControl>
        </Grid>
      </Grid>
    </div>
  )
}

export default Main
