import React, { FunctionComponent } from 'react'
import { CloseFunction } from '../DialogOpener'
import Button from '../Button';

interface Props {
  title: string
  children: string
  onCancel: CloseFunction
  onConfirm: React.MouseEventHandler
}

const ConfirmationDialog: FunctionComponent<Props> = ({ title, children, onCancel, onConfirm }) => {
  return (
    <div className="confirmation-dialog">
      <h2 className="dialog-title">{title}</h2>
      <div className="dialog-content">
        {children}
      </div>
      <div className="dialog-actions">
        <Button onClick={onCancel} variant="text">Cancel</Button>
        <Button onClick={onConfirm}>Confirm</Button>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
