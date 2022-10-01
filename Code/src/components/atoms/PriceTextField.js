import { TextField } from '@mui/material'
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles({
  textInputField: {
    '& .MuiInputBase-root': {
      color: '#f2f6ff',
    },
    '& label.Mui-focused': {
      color: '#f2f6ff',
    },
    '& label': {
      color: '#aaa',
    },
    '& .MuiInput-underline:after': {
      borderBottomColor: '036dbf',
    },
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: '#999',
      },
      '&:hover fieldset': {
        borderColor: '#f2f6ff',
      },
      '&.Mui-focused fieldset': {
        boxShadow: '0px 0px 2px #f2f6ff',
        borderColor: '#f2f6ff',
      },
    },
  }
});

export default function PriceTextField({ onChange, disabled, error }) {
  const classes = useStyles();
  return (
    <TextField
      id="price-input"
      label="Price"
      name="price"
      size="small"
      fullWidth
      required={!disabled}
      margin="dense"
      type="number"
      className={classes.textInputField}
      // inputProps={{ step: 'any' }}
      disabled={disabled}
      onChange={onChange}
      error={error}
      sx={{ margin: '0' }}
    />
  )
}
