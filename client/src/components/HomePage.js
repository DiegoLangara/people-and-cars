import React, { useState, useRef } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import PersonForm from './PersonForm';
import CarForm from './CarForm';

import carBg from '../assets/car-bg2.jpg';
import { BiMessageSquareEdit, BiMessageSquareX } from "react-icons/bi";
import { Card, Button, Typography, Box, Grid } from '@mui/material';
import { Modal, message } from 'antd';

const DELETE_ALL_PEOPLE = gql`
  mutation {
    deleteAllPeople
  }
`;

const DELETE_ALL_CARS = gql`
  mutation {
    deleteAllCars
  }
`;

const GET_PEOPLE = gql`
  query GetPeople {
    people {
      id
      firstName
      lastName
      cars {
        id
        year
        make
        model
        price
        personId
      }
    }
  }
`;

const DELETE_PERSON = gql`
  mutation DeletePerson($id: ID!) {
    deletePerson(id: $id) {
      id
    }
  }
`;

const DELETE_CAR = gql`
  mutation DeleteCar($id: ID!) {
    deleteCar(id: $id) {
      id
    }
  }
`;

function HomePage() {
  const { data, loading, error, refetch } = useQuery(GET_PEOPLE);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [selectedCar, setSelectedCar] = useState(null);
  const personFormRef = useRef(null);
  const carFormRef = useRef(null);
  const resultsRef = useRef(null); 

  const [deleteAllPeople] = useMutation(DELETE_ALL_PEOPLE, {
    onCompleted: () => {
      message.success('All people deleted successfully.');
      refetch();
    },
  });
  
  const [deleteAllCars] = useMutation(DELETE_ALL_CARS, {
    onCompleted: () => {
      message.success('All cars deleted successfully.');
      refetch();
    },
  });
  
  const handleDeleteAllRecords = () => {
    confirm({
      title: 'Are you sure you want to delete all records?',
      content: 'This action cannot be undone.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        deleteAllCars();
        deleteAllPeople();
      },
      onCancel() {
        message.info('Action cancelled.');
      },
    });
  };

  const [deletePerson] = useMutation(DELETE_PERSON, {
    onCompleted: () => {
      refetch();
      message.success('Person deleted successfully.');
    },
    onError: (error) => {
      message.error(`Failed to delete person: ${error.message}`);
    },
  });
  
  const [deleteCar] = useMutation(DELETE_CAR, {
    onCompleted: () => {
      refetch();
      message.success('Car deleted successfully.');
    },
    onError: (error) => {
      message.error(`Failed to delete car: ${error.message}`);
    },
  });

  const { confirm } = Modal;

  const showDeleteConfirm = (onConfirmAction, entityName) => {
    confirm({
      title: `Are you sure you want to delete this ${entityName}?`,
      content: `This action cannot be undone.`,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        onConfirmAction();
      },
      onCancel() {
        message.info('Action cancelled.');
      },
    });
  };

  const deleteSelectedPerson = (person) => {
    showDeleteConfirm(() => {
      deletePerson({ variables: { id: person.id } });
    }, 'person');
  };

  const deleteSelectedCar = (car) => {
    showDeleteConfirm(() => {
      deleteCar({ variables: { id: car.id } });
    }, 'car');
  };

  const handleEditPerson = (person) => {
    setSelectedPerson(person);
    if (personFormRef.current) {
      personFormRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleEditCar = (car) => {
    setSelectedCar(car);
    if (carFormRef.current) {
      carFormRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToResults = () => {
    if (resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <Box>
      <div className='carGrid'>
        <h1>People & Cars</h1>
        <figure><img src={carBg} alt="car" style={{ width: '100%', height: 'auto' }} /></figure>
        <div className='Forms'>
          <div className="PersonForm" id="PersonForm" ref={personFormRef}>
            <PersonForm
              person={selectedPerson}
              refetchPeople={() => {
                refetch();
                handleScrollToResults();
              }}
              onSuccess={() => setSelectedPerson(null)}
              className='personForm'
            />
          </div>
          <div className="CarForm" id='CarForm' ref={carFormRef}>
            <CarForm
              car={selectedCar}
              people={data.people}
              refetchCars={() => {
                refetch();
                handleScrollToResults();
              }}
              onSuccess={() => setSelectedCar(null)}
              className='carForm'
            />
          </div>
        </div>
        <div className='Results' id='Results' ref={resultsRef}>
          <h2>Results</h2>
          <Grid container spacing={4} sx={{ marginTop: 0 }}>
            {data.people.map((person) => (
              <Grid item xs={12} md={6} lg={4} key={`person-${person.id}`} className='resultsCars'>
                <Card variant="elevation" sx={{
                  height: 'calc(100% - 3rem)',
                  backgroundColor: '#474747',
                  color: 'white',
                  padding: 3,
                  boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
                  borderRadius: 3,
                }}>
                  <div className='personHeader'>
                    <Typography variant="h5" sx={{ marginBottom: 2 }}>
                      {person.firstName} {person.lastName}
                    </Typography>
                    <div className='headerButtons'>
                      <Button variant="contained" sx={{ marginRight: 0 }} onClick={() => handleEditPerson(person)}>
                        <BiMessageSquareEdit style={{ fontSize: '20px' }} />
                      </Button>
                      <Button variant="contained" className='delBtn' onClick={() => deleteSelectedPerson(person)}>
                        <BiMessageSquareX style={{ fontSize: '20px' }} />
                      </Button>
                    </div>
                  </div>
                  {person.cars.map((car) => (
                    <Card key={`car-${car.id}`} variant="outlined" sx={{
                      marginTop: 2,
                      padding: 2,
                      backgroundColor: '#383838',
                      color: 'white',
                    }}>
                      <div className='carHeader'>
                        <Typography variant="body1">
                          {car.year} {car.make} {car.model} - ${car.price}
                        </Typography>
                        <div className='carButtons'>
                          <Button variant="contained" sx={{ marginTop: 0, marginRight: 0 }} onClick={() => handleEditCar(car)}>
                            <BiMessageSquareEdit style={{ fontSize: '20px' }} />
                          </Button>
                          <Button variant="contained" className='delBtn' sx={{ marginTop: 0 }} onClick={() => deleteSelectedCar(car)}>
                            <BiMessageSquareX style={{ fontSize: '20px' }} />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </Card>
              </Grid>
            ))}
          </Grid>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleDeleteAllRecords}
            sx={{
              backgroundColor: 'red',
              color: 'white'
            }}
          >
            Delete All Records
          </Button>
        </div>
      </div>
    </Box>
  );
}

export default HomePage;