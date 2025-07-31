/* eslint-disable react/prop-types */
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

const ConfirmationModal = ({
  open,
  onClose,
  onConfirm,
  title = "Confirm Deletion",
  message = "Are you sure you want to delete this record?"
}) => {

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      PaperProps={{
        style: {
          maxWidth: '100%',
          borderRadius: '16px',
          backgroundColor: '#fff',
          padding: '16px',
          boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
        }
      }}
      BackdropProps={{
        style: {
          backgroundColor: 'transparent',
        }
      }}
    >
      <DialogTitle
        id="alert-dialog-title"
        style={{
          fontWeight: 600,
          fontSize: '18px',
          paddingBottom: 0
        }}
      >
        {title}
      </DialogTitle>

      <DialogContent>
        <DialogContentText
          id="alert-dialog-description"
          style={{
            fontSize: '14px',
            color: '#555',
            marginTop: 8
          }}
        >
          {message}
        </DialogContentText>
      </DialogContent>

      <DialogActions style={{ justifyContent: 'flex-end', padding: '16px' }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            textTransform: 'none',
            borderRadius: '8px',
            fontWeight: 500
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          sx={{
            textTransform: 'none',
            borderRadius: '8px',
            fontWeight: 500
          }}
          autoFocus
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationModal;
