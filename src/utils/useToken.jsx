import {FormControl,RadioGroup,FormLabel} from '@mui/material';

export function VRadioGroup({ children, error, label, value, ...other }) {
  return <FormControl className={error ? 'error' : ''} >
    <FormLabel id={other.name}>{label}</FormLabel>
    <RadioGroup
      aria-labelledby={other.name}
      value={value}
      {...other}
    >
      {children}
    </RadioGroup>
  </FormControl>;
}