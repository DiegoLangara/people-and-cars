import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ApolloProvider } from '@apollo/client';
import client from './apollo-client'; // Import the Apollo client configuration

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);

root.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
);
