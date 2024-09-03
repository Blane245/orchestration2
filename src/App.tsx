import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import './App.css'
import Body from './layouts/body'
import Footer from './layouts/footer'
import Header from './layouts/header'
import { Message } from './types/types'
import { Box } from '@mui/system'
import { HEADER, SPACING } from './layouts/config-layout'
import { Grid } from '@mui/material'

function App() {

  const [message, setMessage] = useState<Message>({error:false, text:''})
  const [status, setStatus] = useState<string>('')
  return (
    <>
    <Helmet>
      <title> Instrument Nodes </title>
    </Helmet>
    <Header 
      appName='Instrument Notes'
      appVersion='0.0.0'
      appIcon='./images/logo.svg'
      message={message}
    />
    <Box
      component='main'
      sx={{
        flexGrow: 1,
        minHeight: 1,
        display: 'flex',
        flexDirection: 'column',
        px: 2,
        py: `${HEADER.H_DESKTOP + SPACING}px`
      }}
      >
        <Grid container direction='column'>
          <Grid item id='maincontent'>
            <Body
              setMessage={setMessage}
              setStatus={setStatus}
            />
          </Grid>
        </Grid>
    </Box>
    <Footer
      status={status}
    />
    </>
  )
}

export default App
