'use client'

import Loader from '@/components/loader'
import { Box } from '@mui/material'
import { useRouter } from 'next/navigation'

const HomePage = () => {
  const router = useRouter()
  return (
    <Loader>
      <Box>aaaaa</Box>
    </Loader>
  )
}

export default HomePage
