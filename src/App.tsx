import React, { useEffect } from 'react';
import ReactModal from 'react-modal';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'react-block-ui/style.css';

import './assets/styles/app.scss';
import Container from './components/Container';

function App() {
  useEffect(() => {
    ReactModal.setAppElement('#root');
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
