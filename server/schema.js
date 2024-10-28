const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Person {
    id: ID!
    firstName: String!
    lastName: String!
    cars: [Car]
  }

  type Car {
    id: ID!
    year: Int!
    make: String!
    model: String!
    price: Float!
    personId: ID!
  }

  type Make {
    Make_ID: Int!
    Make_Name: String!
  }

  type Query {
    people: [Person]
    cars: [Car]
    personWithcars(id: ID!): Person
    carMakes: [Make]
  }

  type Mutation {
    addPerson(firstName: String!, lastName: String!): Person
    updatePerson(id: ID!, firstName: String, lastName: String): Person
    deletePerson(id: ID!): Person
    addCar(year: Int!, make: String!, model: String!, price: Float!, personId: ID!): Car
    updateCar(id: ID!, year: Int, make: String, model: String, price: Float, personId: ID): Car
    deleteCar(id: ID!): Car
    deleteAllPeople: Boolean!
    deleteAllCars: Boolean!
  }
`;

module.exports = typeDefs;
