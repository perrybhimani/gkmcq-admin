import React from 'react';
import { Checkbox } from '@mui/material';

function CommonCheckbox(props) {
  return <Checkbox id={props.id} checked={props.checked} onChange={props.onChange} />;
}

export default CommonCheckbox;
