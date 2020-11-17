import React, { ReactNode, FunctionComponent, useState } from 'react';
import Dialog from 'react-modal';
import cx from 'classnames';

export type OpenFunction = (
  event?: React.KeyboardEvent | React.MouseEvent
) => void

export type CloseFunction = (
  event?: React.KeyboardEvent | React.MouseEvent
) => void

interface Props {
  component: (open: OpenFunction) => ReactNode;
  children: (close: CloseFunction) => ReactNode;
  dialogSize?: 'small' | 'medium' | 'large';
  className?: string;
}

const DialogOpener: FunctionComponent<Props> = (props) => {
  const {
    component,
    children,
    dialogSize = 'small',
    className,
  } = props

  const [isOpen, setIsOpen] = useState(false);

  const toggleDialog = (open: boolean) => (
    event?: React.KeyboardEvent | React.MouseEvent
  ) => {
    if (
      event &&
      event.type === 'keydown' &&
      (event as React.KeyboardEvent).key !== 'Return'
    ) {
      return;
    }

    setIsOpen(open);
  }

  return (
    <div>
      {component(toggleDialog(true))}
      <Dialog
        isOpen={isOpen}
        onRequestClose={() => toggleDialog(false)}
        className={cx('dialog', dialogSize, className)}
        overlayClassName="dialog-overlay"
      >
        {children(toggleDialog(false))}
      </Dialog>
    </div>
  );
};

export default DialogOpener;

