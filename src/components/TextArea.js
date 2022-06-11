import React from 'react';
import { TextareaAutosize } from '@mui/material';

function TextArea(props) {
  return (
    <TextareaAutosize
      style={{
        padding: 10,
        borderRadius: 8,
        border: '1px solid rgba(145, 158, 171, 0.32)',
        width: '100%',
        maxWidth: '100%',
        height: 130,
        resize: 'none',
        overflow: 'auto',
        lineHeight: '1.4375em',
        fontSize: '1rem',
        fontFamily: 'Public Sans,sans-serif',
        fontWeight: '400',
        color: '#212B36'
      }}
      id={props.id}
      placeholder={props.placeholder}
      variant="outlined"
      type={props.type ? props.type : 'text'}
      margin="none"
      value={props.value}
      onChange={props.onChange}
    />
  );
}

export default TextArea;
