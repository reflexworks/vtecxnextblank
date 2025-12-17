'use client'

import Loader from '@/components/loader'
import { Typography } from '@mui/material'
import Grid from '@mui/material/Grid2'

const HomePage = () => {
  return (
    <Loader>
      <div style={{ marginTop: '100px' }}>
        <Grid container direction="column" justifyContent="center" alignItems="center" spacing={4}>
          <Grid size={{ xs: 12, md: 5 }} textAlign={'center'}>
            <Typography variant="h2" gutterBottom>
              Hello vte.cx!!
            </Typography>
          </Grid>
        </Grid>
      </div>
    </Loader>
  )
}

export default HomePage
