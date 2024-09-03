import { AppBar, Typography } from "@mui/material"
import { FOOTER } from "./config-layout"

export interface FooterProps {
    status: string
}

export default function Footer (props: FooterProps) {
    const { status } = props
    return (
        <AppBar
            position="fixed"
            sx={{
                top: "auto", 
                bottom: 0, 
                height: FOOTER.H_DESKTOP
            }}
        >
            <Typography>{status}</Typography>
        </AppBar>
    )
}