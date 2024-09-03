import { AppBar, Typography, Container } from "@mui/material"
import { Message } from "../types/types"
import { HEADER } from "./config-layout"

export interface HeaderProps {
    appIcon: string,
    appName: string,
    appVersion: string,
    message: Message
}

export default function Header(props: HeaderProps) {
    const { appIcon, appName, appVersion, message } = props
    return (
        <AppBar
            sx={{
                boxShadow: 'none',
                height: HEADER.H_DESKTOP
            }}
            position="fixed"
        >
            <Container
                maxWidth='xl'>
                <img
                    src={appIcon}
                    alt="Orchestrate"
                    style={{ margin: '10' }}
                />

                <Typography
                    variant="h5"
                    noWrap
                    component="p"
                    sx={{
                        mr: 2,
                        display: { xs: 'none', md: 'flex' },
                        flexGrow: 1,
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        letterSpacing: '.3rem',
                        color: 'inherit',
                        textDecoration: 'none',
                    }}
                >
                    {appName}:{appVersion}
                </Typography>
                <Typography
                    variant="h5"
                    noWrap
                    component="p"
                    sx={{
                        mr: 2,
                        display: { xs: 'none', md: 'flex' },
                        flexGrow: 1,
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        letterSpacing: '.3rem',
                        color: message.error ? 'red' : 'inherit',
                        textDecoration: 'none',
                    }}
                >
                    {message.text}
                </Typography>
            </Container>
        </AppBar>
    )
}