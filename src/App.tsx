import React, { useEffect } from 'react';
import ReactModal from 'react-modal';
import 'react-block-ui/style.css';

import './assets/styles/app.scss';
import Container from './shared/components/Container';
import Table, { TextAlign } from './shared/components/Table';
import Button from './shared/components/Button';

interface Item {
  id: number;
  firstName: string;
  lastName: string;
};

function App() {
  useEffect(() => {
    ReactModal.setAppElement('#root')
  }, []);

  const columns = [
    {
      header: 'Id',
      accessor: 'id',
    },
    {
      header: 'First Name',
      accessor: 'firstName',
    },
    {
      header: 'Last Name',
      accessor: 'lastName',
    },
    {
      header: 'Full Name',
      cell: ({ firstName, lastName }: Item) => `${firstName} ${lastName}`,
    },
    {
      header: '',
      cell: ({ id }: Item) => <Button variant="text" onClick={() => console.log(id)}>Remove</Button>,
      textAlign: 'right' as TextAlign,
    },
  ];

  const items: Item[] = [
    { id: 1, firstName: 'Shane', lastName: 'Watson' },
    { id: 2, firstName: 'Ricky', lastName: 'Ponting' },
    { id: 3, firstName: 'Brett', lastName: 'Lee' },
    { id: 4, firstName: 'Chris', lastName: 'Gayle' },
    { id: 5, firstName: 'Virat', lastName: 'Kohli' },
    { id: 6, firstName: 'Virat', lastName: 'Kohli' },
    { id: 7, firstName: 'Virat', lastName: 'Kohli' },
    { id: 8, firstName: 'Virat', lastName: 'Kohli' },
    { id: 9, firstName: 'Virat', lastName: 'Kohli' },
  ];

  return (
    <div className="App" style={{ paddingTop: '0rem', height: '20rem', overflow: 'auto' }}>
      <Container>
        <Table columns={columns} items={items} stickyHeader />
      </Container>
    </div>
  );
}

export default App;
