/* eslint-disable react/prop-types */
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

const ConfirmationModal = ({ open, onClose, onConfirm, title = "Confirm Deletion", message = "Are you sure you want to delete this record?" }) => {
  return (
<Dialog
  open={open}
  onClose={onClose}
  aria-labelledby="alert-dialog-title"
  aria-describedby="alert-dialog-description"
  PaperProps={{
    style: {
      backgroundColor: 'white',
    },
  }}
  BackdropProps={{
    style: {
      backgroundColor: 'transparent',
    },
  }}
>      <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button variant='outlined' onClick={onClose}>
          Cancel
        </Button>
        <Button variant='contained' onClick={onConfirm} color="error" autoFocus>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmationModal