import React, { useEffect } from 'react';
import ReactModal from 'react-modal';

import './assets/styles/app.scss';
import Button from './shared/components/Button';
import ConfirmationDialog from './shared/components/ConfirmationDialog';
import Container from './shared/components/Container';
import DialogOpener, { CloseFunction, OpenFunction } from './shared/components/DialogOpener';

function App() {
  useEffect(() => {
    ReactModal.setAppElement('#root')
  }, []);

  return (
    <div className="App" style={{ paddingTop: '20rem' }}>
      <Container>
        <DialogOpener
          component={(open: OpenFunction) => (
            <Button onClick={open}>Click Me to Open Dialog</Button>
          )}
          dialogSize="small"
        >
          {
            (close: CloseFunction) => (
              <ConfirmationDialog
                title="Are you sure?"
                onCancel={() => close()}
                onConfirm={() => {
                  // do some work here
                  close();
                }}
              >
                Delete this element?
              </ConfirmationDialog>
            )
          }
        </DialogOpener>
      </Container>
    </div>
  );
}

export default App;
