import { Paper, Typography } from '@mui/material'

export default function LowOnBalanceTip() {
  return (
    <Paper
      elevation={3}
      square
      sx={{
        p: '5px 15px'
      }}>
      <Typography variant="body2" color="black">
        Low on Ethereum? Use this <a href='https://faucet.rinkeby.io/' target="_blank ">faucet</a> to get free test tokens!
      </Typography>
    </Paper>
  )
}
