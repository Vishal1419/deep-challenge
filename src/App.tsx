import React, { useEffect } from 'react';
import { SWRConfig } from 'swr';
import ReactModal from 'react-modal';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'react-block-ui/style.css';

import './assets/styles/app.scss';
import Routes from './Routes';
import Container from './components/Container';
import ErrorBoundary from './components/ErrorBoundary';

const fetcher = (input: RequestInfo, init?: RequestInit | undefined) =>
  fetch(input, init)
    .then(res => res.json())
    .catch(err => {
      throw err;
    });

function App() {
  useEffect(() => {
    ReactModal.setAppElement('#root');
  }, []);

  return (
    <div className="App">
      <ErrorBoundary>
        <SWRConfig value={{ fetcher }}>
          <Container>
            <ToastContainer />
            <Routes />
          </Container>
        </SWRConfig>
      </ErrorBoundary>
    </div>
  );
}

export default App;
