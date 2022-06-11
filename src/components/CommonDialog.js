import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import React from 'react';
import { YES, NO } from '../utils/strings';

function CommonDialog(props) {
  return (
    <Dialog
      BackdropProps={{ style: { background: 'black', opacity: 0.3 } }}
      open={props.open}
      onClose={props.close}
    >
      <DialogTitle id="draggable-dialog-title">{props.dialogTitle}</DialogTitle>
      <DialogContent>
        <DialogContentText>{props.dialogMessage}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={props.close}>
          {NO}
        </Button>
        <Button disabled={props.loading} onClick={() => props.onSuccess()}>
          {props.loading ? <CircularProgress size={20} /> : YES}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CommonDialog;
