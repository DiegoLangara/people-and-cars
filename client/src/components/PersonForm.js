import React, { useState, useEffect } from 'react';
import { useMutation, gql } from '@apollo/client';
import { Button, Input, Form, Col } from 'antd';
import { IoPersonAddOutline, IoCloseCircleOutline } from "react-icons/io5";
import { message } from 'antd';

// GraphQL mutation to add a new person
const ADD_PERSON = gql`
  mutation AddPerson($firstName: String!, $lastName: String!) {
    addPerson(firstName: $firstName, lastName: $lastName) {
      id
      firstName
      lastName
    }
  }
`;

// GraphQL mutation to update an existing person
const UPDATE_PERSON = gql`
  mutation UpdatePerson($id: ID!, $firstName: String!, $lastName: String!) {
    updatePerson(id: $id, firstName: $firstName, lastName: $lastName) {
      id
      firstName
      lastName
    }
  }
`;

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

const PersonForm = ({ person, refetchPeople, onSuccess }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Mutation to add a new person
  const [addPerson] = useMutation(ADD_PERSON, {
    onCompleted: () => {
      resetForm();
      onSuccess();
      message.success('Person added successfully');
    },
    onError: (error) => {
      message.error(`Failed to add person: ${error.message}`);
    },
    update: (cache, { data: { addPerson } }) => {
      cache.modify({
        fields: {
          people(existingPeopleRefs = [], { readField }) {
            const newPersonRef = cache.writeFragment({
              data: addPerson,
              fragment: gql`
                fragment NewPerson on Person {
                  id
                  firstName
                  lastName
                }
              `
            });

            // Prevent adding duplicate person
            if (existingPeopleRefs.some(ref => readField('id', ref) === addPerson.id)) {
              return existingPeopleRefs;
            }

            return [...existingPeopleRefs, newPersonRef];
          }
        }
      });
    }
  });

  // Mutation to update an existing person
  const [updatePerson] = useMutation(UPDATE_PERSON, {
    onCompleted: () => {
      resetForm();
      refetchPeople();
      onSuccess();
      message.success('Person updated successfully');
    },
    onError: (error) => {
      message.error(`Failed to update person: ${error.message}`);
    },
  });

  // Populate form fields when editing an existing person
  useEffect(() => {
    if (person) {
      setFirstName(person.firstName);
      setLastName(person.lastName);
      setIsUpdating(true);
    }
  }, [person]);

  // Handle form submission
  const handleSubmit = () => {
    if (isUpdating) {
      updatePerson({ variables: { id: person.id, firstName, lastName } });
    } else {
      addPerson({ variables: { firstName, lastName } });
    }
  };

  // Reset form fields
  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setIsUpdating(false);
    onSuccess();
  };

  return (
    <Form layout="vertical" onFinish={handleSubmit}>
      <div className='PersonFromContainer'>
        <Col span={24}><h2>Add a person</h2></Col>
        <Col span={24}>
          <Form.Item label="First Name" required>
            <Input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter First Name"
              required
              style={{ color: 'white', backgroundColor: '#444' }}
            />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item label="Last Name" required>
            <Input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Enter Last Name"
              required
              style={{ color: 'white', backgroundColor: '#444' }}
            />
          </Form.Item>
        </Col>
        <div className='formButtons'>
          <Button type="primary" htmlType="submit">
            <IoPersonAddOutline style={{ fontSize: '16px' }} /> {isUpdating ? 'Update Person' : 'Add Person'}
          </Button>
          {isUpdating && (
            <Button style={{ marginLeft: '10px' }} onClick={resetForm}>
              <IoCloseCircleOutline style={{ fontSize: '20px' }} /> Cancel
            </Button>
          )}
        </div>
      </div>
    </Form>
  );
};

export default PersonForm;