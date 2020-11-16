import React from 'react';

import './assets/styles/app.scss';
import Button from './shared/components/Button';
import Container from './shared/components/Container';

function App() {
  return (
    <div className="App" style={{ paddingTop: '20rem' }}>
      <Container>
        <div style={{ margin: '2rem', display: 'inline-block' }}>
          <Button disabled onClick={() => {}}>
            Click Me!
          </Button>
        </div>
        <div style={{ margin: '2rem', display: 'inline-block' }}>
          <Button disabled variant="outlined" onClick={() => {}}>
            Click Me!
          </Button>
        </div>
        <div style={{ margin: '2rem', display: 'inline-block' }}>
          <Button disabled variant="text" onClick={() => {}}>
            Click Me!
          </Button>
        </div>
      </Container>
    </div>
  );
}

export default App;
