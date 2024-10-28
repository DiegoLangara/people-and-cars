import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage'; 
import ShowPage from './components/ShowPage';

import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/people/:id" element={<ShowPage />} />
      </Routes>
    </Router>
  );
}

export default App;
