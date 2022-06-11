import React from 'react';
import { TextField, MenuItem } from '@mui/material';

function Textbox(props) {
  return (
    <TextField
      inputProps={{
        style: {
          padding: 10
        }
      }}
      id={props.id}
      placeholder={props.placeholder}
      variant="outlined"
      type={props.type ? props.type : 'text'}
      margin="none"
      fullWidth={props.fullWidth}
      value={props.value}
      onChange={props.onChange}
      onWheel={(e) => props.type === 'number' && e.target.blur()}
    />
  );
}

export default Textbox;
