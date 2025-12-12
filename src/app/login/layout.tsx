'use client'

import { Box } from '@mui/material'

const MainLayout = ({ children }: any) => {
  return (
    <Box paddingLeft={3} paddingRight={3}>
      {children}
    </Box>
  )
}

export default MainLayout
