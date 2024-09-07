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

  const [message, setMessage] = useState<Message>({ error: false, text: '' })
  const [status, setStatus] = useState<string>('')
  return (
    <>
      <Helmet>
        <title> Instrument Nodes </title>
      </Helmet>
      <Header
        appName='Instrument Notes'
        appVersion={import.meta.env.PACKAGE_VERSION}
        appIcon='./src/images/O.svg'
        message={message}
      />
      <Body
        setMessage={setMessage}
        setStatus={setStatus}
      />
      <Footer
        status={status}
      />
    </>
  )
}

export default App
