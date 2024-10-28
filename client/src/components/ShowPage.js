import React from 'react';
import { useQuery, gql } from '@apollo/client';
import { Button } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';

const GET_PERSON_WITH_CARS = gql`
  query GetPersonWithCars($id: ID!) {
    personWithcars(id: $id) {
      id
      firstName
      lastName
      cars {
        id
        year
        make
        model
        price
      }
    }
  }
`;

const ShowPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loading, error, data } = useQuery(GET_PERSON_WITH_CARS, {
    variables: { id },
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const { personWithcars } = data;

  return (
    <div className='showCard'>
      <h2>{personWithcars.firstName} {personWithcars.lastName}</h2>
      <h3>Cars:</h3>
      <ul>
    

    {personWithcars.cars.length === 0 && <li><p>No cars found</p></li>}


        {personWithcars.cars.map((car) => (
        


          <li key={car.id} className='showItemCard'>
            {car.year} {car.make} {car.model} - ${car.price.toLocaleString()}
          </li>
        ))}
      </ul>
      <Button onClick={() => navigate('/')} style={{marginLeft:'auto', marginRight:'auto'}}>Go Back Home</Button>
    </div>
  );
};

export default ShowPage;
