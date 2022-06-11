import React from 'react';
import { MenuItem, Select } from '@mui/material';

function Dropdown(props) {
  return (
    <Select
      labelId="demo-simple-select-label"
      id="demo-simple-select"
      value={props.selectedItem}
      style={{ width: '100%' }}
      SelectDisplayProps={{ style: { padding: props.padding ? props.padding : 10 } }}
      onChange={props.handleChange}
    >
      {props.title && (
        <MenuItem disabled value={1}>
          {props.title}
        </MenuItem>
      )}
      {props.itemsArray && props.itemsArray.length > 0
        ? props.itemsArray.map((item, index) => (
            <MenuItem
              value={item && item._id && item._id ? item._id : item}
              key={`${index} ${item.label}`}
            >
              {item.name ? item.name : item}
            </MenuItem>
          ))
        : null}
    </Select>
  );
}

export default Dropdown;
