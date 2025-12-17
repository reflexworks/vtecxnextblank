import { Box } from '@mui/material'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'パスワード変更 | vtecx next blank'
}

const MainLayout = ({ children }: any) => {
  return (
    <Box paddingLeft={3} paddingRight={3}>
      {children}
    </Box>
  )
}

export default MainLayout
