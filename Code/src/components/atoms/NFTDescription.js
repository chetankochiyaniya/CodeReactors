import { Typography } from '@mui/material'

export default function NFTDescription({ description }) {
  return (
    <Typography
      variant="body2"
      color="white"
      gutterBottom
    >
      {description}
    </Typography>
  )
}
