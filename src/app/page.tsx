'use client'

import Loader from '@/components/loader'
import { Button, Typography } from '@mui/material'
import Grid from '@mui/material/Grid2'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import * as browserutil from '@/utils/browserutil'
import { useRouter } from 'next/navigation'

type WhoamiInfo = {
  uid: string
  email: string
}

const fetchWhoami = async (): Promise<WhoamiInfo | null> => {
  try {
    const res = await browserutil.requestApi('GET', 'whoami', '')
    const uid: string = res?.feed?.title ?? ''
    const email: string = res?.feed?.subtitle ?? ''
    return uid ? { uid, email } : null
  } catch {
    return null
  }
}

const fetchServiceName = async (): Promise<string> => {
  try {
    const res = await browserutil.requestApi('GET', 'service', '')
    return res?.feed?.title ?? ''
  } catch {
    return ''
  }
}

const HomePage = () => {
  const router = useRouter()
  const [whoami, setWhoami] = useState<WhoamiInfo | null | undefined>(undefined)
  const [serviceName, setServiceName] = useState<string>('')

  useEffect(() => {
    fetchWhoami().then(setWhoami)
    fetchServiceName().then(setServiceName)
  }, [])

  const handleLogout = async () => {
    await browserutil.requestApi('GET', 'logout', '')
    router.push('/login')
  }

  return (
    <Loader>
      <div style={{ marginTop: '100px' }}>
        <Grid container direction="column" justifyContent="center" alignItems="center" spacing={4}>
          <Grid size={{ xs: 12, md: 5 }} textAlign="center">
            <Typography variant="h2" gutterBottom>
              Hello vte.cx!!
            </Typography>
            {serviceName && (
              <Typography variant="body2">サービス名：{serviceName}</Typography>
            )}
          </Grid>

          {whoami && (
            <Grid size={{ xs: 12, md: 5 }} textAlign="center">
              <Typography variant="body1" gutterBottom>
                ログイン中です
              </Typography>
              <Typography variant="body2">UID：{whoami.uid}</Typography>
              <Typography variant="body2" gutterBottom>
                メールアドレス：{whoami.email}
              </Typography>
              <Grid container justifyContent="center" spacing={2} mt={1}>
                <Grid>
                  <Link href="/account/change-password">
                    <Button variant="outlined" size="small">
                      パスワードを変更する
                    </Button>
                  </Link>
                </Grid>
                <Grid>
                  <Button variant="outlined" size="small" color="error" onClick={handleLogout}>
                    ログアウト
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          )}

          {whoami === null && (
            <Grid size={{ xs: 12, md: 5 }} textAlign="center">
              <Typography variant="body1" gutterBottom>
                ログインしていません
              </Typography>
              <Link href="/login">
                <Button variant="contained" size="small">
                  ログイン
                </Button>
              </Link>
            </Grid>
          )}
        </Grid>
      </div>
    </Loader>
  )
}

export default HomePage
