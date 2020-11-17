import React, { useEffect, useState } from 'react';
import ReactModal from 'react-modal';

import './assets/styles/app.scss';
import Container from './shared/components/Container';
import Input from './shared/components/Input';

function App() {
  useEffect(() => {
    ReactModal.setAppElement('#root')
  }, []);

  const [notes, setNotes] = useState('');

  const handleNotesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setNotes(value);
  }

  return (
    <div className="App" style={{ paddingTop: '20rem' }}>
      <Container>
        <Input
          name="notes"
          label="Notes"
          type="textarea"
          value={notes}
          onChange={handleNotesChange}
        />
      </Container>
    </div>
  );
}

export default App;
