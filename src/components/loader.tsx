'use client'

import React from 'react'
import { Box, CircularProgress } from '@mui/material'
import useLoader from '../hooks/useLoader'

const Loader = ({ children }: any) => {
  const { loader } = useLoader(false)
  return (
    <>
      {children}
      {loader && (
        <Box position={'fixed'} top={0} left={0} width={'100%'} height={'1000px'} zIndex={10000}>
          <Box position={'fixed'} top={'50%'} left={'50%'}>
            <CircularProgress />
          </Box>
        </Box>
      )}
    </>
  )
}
export default Loader
