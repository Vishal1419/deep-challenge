import React, { useEffect } from 'react';
import ReactModal from 'react-modal';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'react-block-ui/style.css';

import './assets/styles/app.scss';
import Container from './shared/components/Container';
import { showNotification } from './shared/notifier';

function App() {
  useEffect(() => {
    ReactModal.setAppElement('#root')
    {showNotification('This is a test notification', 'error')}
  }, []);

  return (
    <div className="App">
      <Container>
        <ToastContainer />
      </Container>
    </div>
  );
}

export default App;
