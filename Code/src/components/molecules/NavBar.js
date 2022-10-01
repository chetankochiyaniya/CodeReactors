
import { useContext } from 'react'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import { Web3Context } from '../providers/Web3Provider'
import NavItem from '../atoms/NavItem'
import ConnectedAccountAddress from '../atoms/ConnectedAccountAddress'
import ConnectButton from '../atoms/ConnectButton'

const pages = [
  {
    title: 'Market',
    href: '/'
  },
  {
    title: 'MY NFTs',
    href: '/my-nfts'
  }
]

const NavBar = () => {
  const { account } = useContext(Web3Context)

  return (
    <AppBar position="static">
      <Container maxWidth="100%" style={{ padding: '15px 30px' }}>
        <Toolbar disableGutters>
          <Typography
            variant="h3"
            noWrap
            component="div"
            sx={{ flexGrow: { xs: 1, md: 0 }, display: 'flex' }}
          >
            <img src="./logo.png" alt="Code Reactor" height={50} />
          </Typography>

          <Box sx={{ flexGrow: 1, display: 'flex', marginLeft: '25px' }}>
            {pages.map(({ title, href }) => <NavItem title={title} href={href} key={title} />)}
          </Box>
          {account ? <ConnectedAccountAddress account={account} /> : <ConnectButton />}
        </Toolbar>
      </Container>
    </AppBar>
  )
}
export default NavBar
