const fs = require('fs');
const makes = JSON.parse(fs.readFileSync('./makes.json', 'utf-8')).Results;

const people = []; // Replace this with your MongoDB logic if needed
let cars = [];

const resolvers = {
  Query: {
    people: () => people,
    cars: () => cars,
    personWithcars: (_, { id }) => people.find(person => person.id === id),
    carMakes: () => makes,
  },
  Person: {
    cars: (parent) => cars.filter(car => car.personId === parent.id)
  },
  Mutation: {
    addPerson: (_, { firstName, lastName }) => {
      const person = { id: `${people.length + 1}`, firstName, lastName };
      people.push(person);
      return person;
    },
    updatePerson: (_, { id, firstName, lastName }) => {
      const person = people.find(p => p.id === id);
      if (firstName) person.firstName = firstName;
      if (lastName) person.lastName = lastName;
      return person;
    },
    deletePerson: (_, { id }) => {
      const index = people.findIndex(p => p.id === id);
      if (index === -1) return null;
      const deletedPerson = people.splice(index, 1)[0];
      cars = cars.filter(car => car.personId !== id);
      return deletedPerson;
    },
    addCar: (_, { year, make, model, price, personId }) => {
      const car = { id: `${cars.length + 1}`, year, make, model, price, personId };
      cars.push(car);
      return car;
    },
    updateCar: (_, { id, year, make, model, price, personId }) => {
      const car = cars.find(c => c.id === id);
      if (year) car.year = year;
      if (make) car.make = make;
      if (model) car.model = model;
      if (price) car.price = price;
      if (personId) car.personId = personId;
      return car;
    },
    deleteCar: (_, { id }) => {
      const index = cars.findIndex(c => c.id === id);
      if (index === -1) return null;
      return cars.splice(index, 1)[0];
    },
    deleteAllPeople: () => {
      people.length = 0; // Clear all people from the array
      cars.length = 0; // Also remove all cars since they reference people
      return true;
    },
    deleteAllCars: () => {
      cars.length = 0; // Clear all cars from the array
      return true;
    },

  }
};

module.exports = resolvers;
