import 'core-js/stable';
import 'regenerator-runtime/runtime';
import 'isomorphic-fetch';
import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query-devtools'
import ReactModal from 'react-modal';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'react-block-ui/style.css';

import './assets/styles/app.scss';
import Routes from './Routes';
import ErrorBoundary from './components/ErrorBoundary';
import { readFromStorage } from './shared/storage';

const queryClient = new QueryClient();

function App() {
  useEffect(() => {
    ReactModal.setAppElement('#root');
    readFromStorage(queryClient);
  }, []);

  return (
    <div className="App">
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <ToastContainer />
          <Routes />
          <ReactQueryDevtools />
        </QueryClientProvider>
      </ErrorBoundary>
    </div>
  );
}

export default App;
