import React from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';

// Import pages
import Home from './pages/Home';

// Import components
import TestSocket from './components/TestSocket';

function App() {
  return (
    <Router>
      <div>
        <TestSocket />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
