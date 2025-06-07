import React from 'react';
import LoginPage from './loginpage/LoginPage'; 
import Dashboard from './dashboard/dashboard';
import TradeForm from './TradeForm';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/trade" element={<TradeForm />} /> 
      </Routes>
    </Router>
  );
}

export default App;

