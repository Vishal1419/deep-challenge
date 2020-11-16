import React, { useState } from 'react';

import './assets/styles/app.scss';
import Favorite from './shared/components/Favorite';
import Container from './shared/components/Container';

function App() {
  const [isFavorite, setIsFavorite] = useState(false);

  const handleFavoriteChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;
    setIsFavorite(checked);
  }

  return (
    <div className="App" style={{ paddingTop: '20rem' }}>
      <Container>
        <Favorite
          name="fav"
          label={`Click me to ${isFavorite ? 'Unfavorite' : 'Favorite'}`}
          checked={isFavorite}
          onChange={handleFavoriteChange}
        />
      </Container>
    </div>
  );
}

export default App;
