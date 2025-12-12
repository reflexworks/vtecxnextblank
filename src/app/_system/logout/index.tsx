'use client'

import { ListItemIcon, ListItemText, MenuItem, Typography } from '@mui/material'
import { logout, Props } from './fetcher'
import useLoader from '@/hooks/useLoader'
import { useRouter } from 'next/navigation'
import { Logout } from '@mui/icons-material'

/**
 * ページ関数
 * @returns HTML
 */
const Main = ({ login_path }: Props) => {
  const router = useRouter()
  const { setLoader } = useLoader()

  const handleClickLogout = async () => {
    setLoader(true)
    // ログイン
    const retStr = await logout()
    // 結果表示
    setLoader(false)
    router.push(login_path)
  }

  return (
    <>
      <MenuItem>
        <ListItemIcon>
          <Logout fontSize="small" />
        </ListItemIcon>
        <ListItemText
          onClick={() => {
            handleClickLogout()
          }}
        >
          <Typography variant="caption">ログアウト</Typography>
        </ListItemText>
      </MenuItem>
    </>
  )
}

export default Main
