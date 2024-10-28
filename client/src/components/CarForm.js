import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, gql } from '@apollo/client';
import { Button, Form, Row, Col, InputNumber, Select as AntSelect } from 'antd';
import debounce from 'lodash.debounce';
import { IoCarSportOutline, IoCloseCircleOutline } from "react-icons/io5";
import '../App.css';
import { message } from 'antd';

const { Option } = AntSelect;

// GraphQL query to fetch car makes
const GET_CAR_MAKES = gql`
  query GetCarMakes {
    carMakes {
      Make_ID
      Make_Name
    }
  }
`;

const CarForm = ({ car, people, refetchCars, onSuccess }) => {
  const [form] = Form.useForm();
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [price, setPrice] = useState('');
  const [personId, setPersonId] = useState('');
  const [filteredMakes, setFilteredMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch car makes using GraphQL query
  const { data: makesData } = useQuery(GET_CAR_MAKES);
  const makes = makesData?.carMakes || [];

  // GraphQL mutation to add a new car
  const [addCar] = useMutation(gql`
    mutation AddCar($year: Int!, $make: String!, $model: String!, $price: Float!, $personId: ID!) {
      addCar(year: $year, make: $make, model: $model, price: $price, personId: $personId) {
        id
        year
        make
        model
        price
        personId
      }
    }
  `, {
    onCompleted: () => {
      form.resetFields();
      resetForm();
      refetchCars();
      onSuccess();
      message.success('Car added successfully');
    },
    onError: (error) => {
      message.error(`Failed to add car: ${error.message}`);
    },
  });

  // GraphQL mutation to update an existing car
  const [updateCar] = useMutation(gql`
    mutation UpdateCar($id: ID!, $year: Int!, $make: String!, $model: String!, $price: Float!, $personId: ID!) {
      updateCar(id: $id, year: $year, make: $make, model: $model, price: $price, personId: $personId) {
        id
        year
        make
        model
        price
        personId
      }
    }
  `, {
    onCompleted: () => {
      form.resetFields();
      resetForm();
      refetchCars();
      onSuccess();
      message.success('Car updated successfully');
    },
    onError: (error) => {
      message.error(`Failed to update car: ${error.message}`);
    },
  });

  // Populate form fields when editing an existing car
  useEffect(() => {
    if (car && car.personId) {
      setYear(car.year);
      setMake(car.make);
      setModel(car.model);
      setPrice(car.price);
      setPersonId(car.personId);
      setIsUpdating(true);

      form.setFieldsValue({
        year: car.year,
        make: car.make,
        model: car.model,
        price: car.price,
        personId: car.personId,
      });
    }
  }, [car, form]);

  // Debounced function to filter makes after user input
  const debouncedFetchMakes = debounce((input) => {
    const filtered = makes.filter((make) =>
      make.Make_Name.toLowerCase().includes(input.toLowerCase())
    );
    setFilteredMakes(filtered);
  }, 300);

  const handleMakeInputChange = (input) => {
    debouncedFetchMakes(input);
  };

  const handleMakeDropdownVisibleChange = (open) => {
    if (open && filteredMakes.length === 0) {
      setFilteredMakes(makes);
    }
  };

  // Fetch models after make is selected
  useEffect(() => {
    if (make) {
      fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/getmodelsformake/${make}?format=json`)
        .then(response => response.json())
        .then(data => {
          const formattedModels = data.Results.length > 0
            ? data.Results.map(model => ({
                value: model.Model_Name,
                label: model.Model_Name,
              }))
            : [{ value: 'Not Available', label: 'Not Available' }];
          setModels(formattedModels);
        })
        .catch(error => {
          console.error('Error fetching models:', error);
          setModels([{ value: 'Not Available', label: 'Not Available' }]);
        });
    } else {
      setModels([]);
    }
  }, [make]);

  const handleSubmit = () => {
    form.validateFields().then(() => {
      if (isUpdating) {
        updateCar({
          variables: {
            id: car.id,
            year: parseInt(year),
            make,
            model,
            price: parseFloat(price),
            personId,
          },
        }).catch((error) => {
          console.error("Error updating car:", error);
        });
      } else {
        addCar({
          variables: {
            year: parseInt(year),
            make,
            model,
            price: parseFloat(price),
            personId,
          },
        }).catch((error) => {
          console.error("Error adding car:", error);
        });
      }
    }).catch((error) => {
      console.error("Validation failed:", error);
    });
  };

  const resetForm = () => {
    setYear(currentYear);
    setMake('');
    setModel('');
    setPrice('');
    setPersonId('');
    setIsUpdating(false);
    form.resetFields();
  };

  const isFormDisabled = people.length === 0;

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      style={{ height: '100%' }}
    >
      <h2>Add a car to a person</h2>
      <Row gutter={16}>
        {/* Make Field */}
        <Col span={12}>
          <Form.Item
            label="Make"
            name="make"
            rules={[{ required: true, message: 'Please select a make' }]}
          >
            <AntSelect
              showSearch
              value={make || undefined}
              onSearch={handleMakeInputChange}
              onChange={(value) => setMake(value)}
              placeholder="Select Make or Type to Search"
              filterOption={false}
              onDropdownVisibleChange={handleMakeDropdownVisibleChange}
              disabled={isFormDisabled}
            >
              {filteredMakes.map((make) => (
                <Option key={make.Make_ID} value={make.Make_Name}>
                  {make.Make_Name}
                </Option>
              ))}
            </AntSelect>
          </Form.Item>
        </Col>

        {/* Model Field */}
        <Col span={12}>
          <Form.Item
            label="Model"
            name="model"
            rules={[{ required: true, message: 'Please select a model' }]}
          >
            <AntSelect
              showSearch
              value={model || undefined}
              onChange={(value) => setModel(value)}
              options={models}
              placeholder="Select Model"
              disabled={!make || isFormDisabled}
            />
          </Form.Item>
        </Col>

        {/* Year Field */}
        <Col span={12}>
          <Form.Item
            label="Year"
            name="year"
            rules={[{ required: true, message: 'Please enter the year' }]}
          >
            <InputNumber
              value={year}
              onChange={(value) => setYear(value)}
              placeholder="Enter Year"
              required
              style={{ width: '100%' }}
              disabled={isFormDisabled}
              onKeyPress={(e) => {
                if (!/[0-9]/.test(e.key)) {
                  e.preventDefault();
                }
              }}
            />
          </Form.Item>
        </Col>

        {/* Price Field */}
        <Col span={12}>
          <Form.Item
            label="Price"
            name="price"
            rules={[{ required: true, message: 'Please enter the price' }]}
          >
            <InputNumber
              value={price}
              onChange={(value) => setPrice(value)}
              placeholder="Enter Price"
              required
              formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
              style={{ width: '100%' }}
              disabled={isFormDisabled}
              onKeyPress={(e) => {
                if (!/[0-9.]*/.test(e.key)) {
                  e.preventDefault();
                }
              }}
            />
          </Form.Item>
        </Col>
      </Row>

      {/* Person Field */}
      <Form.Item
        label="Person"
        name="personId"
        rules={[{ required: true, message: 'Please select a person' }]}
      >
        <AntSelect
          showSearch
          value={personId || undefined}
          onChange={(value) => setPersonId(value)}
          placeholder="Select Person"
          disabled={isFormDisabled}
          filterOption={(input, option) =>
            option?.label.toLowerCase().includes(input.toLowerCase())
          }
        >
          {people.map((person) => (
            <Option key={person.id} value={person.id} label={`${person.firstName} ${person.lastName}`}>
              {person.firstName} {person.lastName}
            </Option>
          ))}
        </AntSelect>
      </Form.Item>

      {/* Submit and Cancel Buttons */}
      <div className='formButtons'>
        <Button type="primary" htmlType="submit" disabled={isFormDisabled}>
          <IoCarSportOutline style={{ fontSize: '20px' }} /> {isUpdating ? 'Update Car' : 'Add Car'}
        </Button>
        {isUpdating && (
          <Button style={{ marginLeft: '10px' }} onClick={() => resetForm()}>
            <IoCloseCircleOutline style={{ fontSize: '20px' }} /> Cancel
          </Button>
        )}
      </div>
    </Form>
  );
};

export default CarForm;