import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import Board from './pages/Board';
import Roadmap from './pages/Roadmap';
import Changelog from './pages/Changelog';
import FeatureDetail from './pages/FeatureDetail';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Board />} />
        <Route path="roadmap" element={<Roadmap />} />
        <Route path="changelog" element={<Changelog />} />
        <Route path="feature/:id" element={<FeatureDetail />} />
      </Route>
    </Routes>
  );
}

export default App;
